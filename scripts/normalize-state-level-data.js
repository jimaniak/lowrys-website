require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');
const xlsx = require('xlsx');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Database client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// State-level BLS data processing configuration
const STATE_TABLES_CONFIG = {
  'state': {
    description: 'All_Data_M_2023',
    tableName: 'bls_state_data',
    skipTable: false,
    headerRow: 1 // Headers are on row 1 (0-indexed = 0)
  }
};

const unzipper = require('unzipper');
const CURRENT_BASE_YEAR = 2023;
const BLS_OEWS_STATE_ZIP_URL = `https://www.bls.gov/oes/special.requests/oesm${CURRENT_BASE_YEAR % 100}st.zip`;
const XLSX_STATE_FILENAME = `oesm${CURRENT_BASE_YEAR % 100}st/state_M${CURRENT_BASE_YEAR}_dl.xlsx`;

async function downloadStateWorkbook() {
  console.log('📥 Downloading state-level BLS workbook...');
  
  const response = await fetch(BLS_OEWS_STATE_ZIP_URL);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  
  const buffer = Buffer.from(await response.arrayBuffer());
  console.log(`� Downloaded ${buffer.length} bytes`);
  
  return new Promise((resolve, reject) => {
    const stream = require('stream').Readable.from(buffer);
    let fileFound = false;
    
    stream
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        if (entry.path === XLSX_STATE_FILENAME) {
          fileFound = true;
          const chunks = [];
          entry.on('data', chunk => chunks.push(chunk));
          entry.on('end', () => resolve(Buffer.concat(chunks)));
        } else {
          entry.autodrain();
        }
      })
      .on('finish', () => {
        if (!fileFound) {
          reject(new Error(`File ${XLSX_STATE_FILENAME} not found in archive`));
        }
      })
      .on('error', reject);
  });
}

function identifyYearColumns(headers) {
  const yearColumns = [];
  const textColumns = [];
  
  headers.forEach((header, index) => {
    if (header && typeof header === 'string') {
      // Check if it's a year (4 digits)
      const yearMatch = header.match(/^\d{4}$/);
      if (yearMatch) {
        yearColumns.push({
          index,
          header,
          year: parseInt(yearMatch[0])
        });
      } else {
        textColumns.push({
          index,
          header
        });
      }
    }
  });
  
  return { yearColumns, textColumns };
}

async function createStateTable(tableName, sampleRow, yearColumns, textColumns) {
  console.log(`\n🗄️  Creating table: ${tableName}`);
  
  // Text columns
  const textColumnDefs = textColumns.map(col => {
    const colName = col.header.toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    return `${colName} TEXT`;
  }).join(', ');
  
  // Normalized metric columns
  const metricColumns = `
    metric_name TEXT,
    metric_value REAL,
    metric_year INTEGER,
    data_type TEXT
  `;
  
  const sql = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${textColumnDefs},
      ${metricColumns},
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  console.log('📝 Table Schema:');
  console.log(sql);
  
  try {
    await client.execute({ sql: `DROP TABLE IF EXISTS ${tableName}` });
    await client.execute({ sql });
    console.log(`✅ Table ${tableName} created successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error);
    return false;
  }
}

async function processStateData(workbook, config) {
  console.log(`\n📊 Processing State Data: ${config.description}`);
  
  if (config.skipTable) {
    console.log(`⏭️  Skipping state data per configuration`);
    return null;
  }
  
  // Find the main data sheet
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('all_data') || 
    name.toLowerCase().includes('data') ||
    !name.toLowerCase().includes('field')
  );
  
  if (!sheetName) {
    console.log(`❌ Main data sheet not found`);
    return null;
  }
  
  console.log(`📄 Using sheet: ${sheetName}`);
  const worksheet = workbook.Sheets[sheetName];
  
  // Get headers from row 1 (0-indexed = 0)
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  const headerRange = { s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } };
  const headers = xlsx.utils.sheet_to_json(worksheet, { 
    range: headerRange,
    header: 1,
    defval: null
  })[0];
  
  console.log('\n📋 Headers found:');
  console.log(headers.slice(0, 10), '... (showing first 10)');
  
  // Identify year and text columns
  const { yearColumns, textColumns } = identifyYearColumns(headers);
  
  console.log(`\n📊 Column Analysis:`);
  console.log(`   Year columns: ${yearColumns.length}`);
  console.log(`   Text columns: ${textColumns.length}`);
  console.log(`   Year columns: ${yearColumns.map(c => c.header).join(', ')}`);
  console.log(`   Text columns: ${textColumns.slice(0, 5).map(c => c.header).join(', ')}...`);
  
  // Get data starting from row 2 (0-indexed = 1)
  const dataRange = { ...range };
  dataRange.s.r = 1; // Start from row 2
  
  const data = xlsx.utils.sheet_to_json(worksheet, { 
    range: dataRange,
    header: 1,
    defval: null
  });
  
  if (!data || data.length === 0) {
    console.log(`⚠️  No data found in state workbook`);
    return null;
  }
  
  console.log(`📈 Found ${data.length} data rows`);
  
  // Create table
  const tableName = config.tableName;
  const sampleRow = data[0];
  const tableCreated = await createStateTable(tableName, sampleRow, yearColumns, textColumns);
  
  if (!tableCreated) {
    return null;
  }
  
  // Process and insert data
  console.log('\n💾 Inserting normalized data...');
  let insertedRows = 0;
  
  for (let i = 0; i < Math.min(data.length, 100); i++) { // Limit to first 100 rows for testing
    const row = data[i];
    
    // Extract text field values
    const textValues = {};
    textColumns.forEach(col => {
      const colName = col.header.toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      textValues[colName] = row[col.index] || null;
    });
    
    // For each year column, create a normalized row
    for (const yearCol of yearColumns) {
      const metricValue = row[yearCol.index];
      
      // Skip if no value
      if (metricValue === null || metricValue === undefined || metricValue === '') {
        continue;
      }
      
      // Create column names for text fields
      const textColumnNames = Object.keys(textValues);
      const textColumnValues = Object.values(textValues);
      
      // Prepare SQL
      const columnNames = [...textColumnNames, 'metric_name', 'metric_value', 'metric_year', 'data_type'].join(', ');
      const placeholders = Array(textColumnNames.length + 4).fill('?').join(', ');
      
      const sql = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
      const values = [
        ...textColumnValues,
        'employment_data', // Generic metric name for state data
        parseFloat(metricValue) || 0,
        yearCol.year,
        'actual' // State data contains actual/current data
      ];
      
      try {
        await client.execute({ sql, args: values });
        insertedRows++;
      } catch (error) {
        console.error(`❌ Error inserting row:`, error);
        console.log('Row data:', { textValues, metricValue, year: yearCol.year });
        break;
      }
    }
    
    if (i % 10 === 0) {
      console.log(`   Processed ${i + 1}/${Math.min(data.length, 100)} rows, inserted ${insertedRows} normalized rows`);
    }
  }
  
  console.log(`✅ Completed processing: ${insertedRows} normalized rows inserted`);
  
  return {
    tableName,
    totalRows: Math.min(data.length, 100),
    normalizedRows: insertedRows,
    yearColumns: yearColumns.length,
    textColumns: textColumns.length
  };
}

async function queryProjectManagersInMissouri(tableName) {
  console.log('\n\n🔍 SAMPLE QUERY: Project Managers in Missouri');
  console.log('=' .repeat(60));
  
  // First, let's see what columns we have
  const schemaResult = await client.execute({
    sql: `PRAGMA table_info(${tableName})`
  });
  
  console.log('\n📋 Table Schema:');
  schemaResult.rows.forEach(row => {
    console.log(`   ${row.name} (${row.type})`);
  });
  
  // Find columns that might contain location/state info
  const stateColumns = schemaResult.rows
    .map(row => row.name)
    .filter(name => 
      name.toLowerCase().includes('state') || 
      name.toLowerCase().includes('area') ||
      name.toLowerCase().includes('location') ||
      name.toLowerCase().includes('region')
    );
  
  console.log(`\n📍 Potential state/location columns: ${stateColumns.join(', ')}`);
  
  // Find columns that might contain occupation info
  const occupationColumns = schemaResult.rows
    .map(row => row.name)
    .filter(name => 
      name.toLowerCase().includes('occ') || 
      name.toLowerCase().includes('job') ||
      name.toLowerCase().includes('title') ||
      name.toLowerCase().includes('desc')
    );
  
  console.log(`💼 Potential occupation columns: ${occupationColumns.join(', ')}`);
  
  // Try to find data for Missouri and Project Managers
  let queryResults = [];
  
  for (const stateCol of stateColumns) {
    for (const occCol of occupationColumns) {
      const sql = `
        SELECT ${stateCol}, ${occCol}, metric_value, metric_year, data_type, 
               COUNT(*) as row_count
        FROM ${tableName} 
        WHERE LOWER(${stateCol}) LIKE '%missouri%' 
          AND LOWER(${occCol}) LIKE '%project%manager%'
        GROUP BY ${stateCol}, ${occCol}, metric_year
        ORDER BY metric_year DESC
        LIMIT 10
      `;
      
      try {
        const result = await client.execute({ sql });
        if (result.rows.length > 0) {
          console.log(`\n✅ Found matches using ${stateCol} + ${occCol}:`);
          result.rows.forEach(row => {
            console.log(`   ${row[stateCol]} | ${row[occCol]} | ${row.metric_year}: ${row.metric_value} (${row.row_count} rows)`);
          });
          queryResults.push(...result.rows);
        }
      } catch (error) {
        // Column might not exist or have different name
        console.log(`   ⚠️  Could not query ${stateCol} + ${occCol}`);
      }
    }
  }
  
  // If no specific matches, show sample data to understand structure
  if (queryResults.length === 0) {
    console.log('\n📊 No specific matches found. Showing sample data structure:');
    
    const sampleSql = `
      SELECT * FROM ${tableName} 
      WHERE metric_year = (SELECT MAX(metric_year) FROM ${tableName})
      LIMIT 5
    `;
    
    try {
      const sampleResult = await client.execute({ sql: sampleSql });
      console.log('\n📋 Sample rows:');
      sampleResult.rows.forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
          if (value !== null && value !== '') {
            console.log(`   ${key}: ${value}`);
          }
        });
      });
    } catch (error) {
      console.error('Error querying sample data:', error);
    }
  }
  
  return queryResults;
}

async function main() {
  try {
    console.log('🚀 Starting State-Level BLS Data Normalization');
    console.log('=' .repeat(60));
    
    // Download state workbook
    const workbookBuffer = await downloadStateWorkbook();
    
    // Load workbook from buffer
    console.log('📖 Loading state workbook from buffer...');
    const workbook = xlsx.read(workbookBuffer, { type: 'buffer' });
    console.log(`📊 Workbook loaded with ${workbook.SheetNames.length} sheets:`, workbook.SheetNames);
    
    // Process state data
    const config = STATE_TABLES_CONFIG.state;
    const result = await processStateData(workbook, config);
    
    if (result) {
      console.log('\n✅ State data processing completed:');
      console.log(`   Table: ${result.tableName}`);
      console.log(`   Source rows: ${result.totalRows}`);
      console.log(`   Normalized rows: ${result.normalizedRows}`);
      console.log(`   Year columns: ${result.yearColumns}`);
      console.log(`   Text columns: ${result.textColumns}`);
      
      // Demonstrate querying
      await queryProjectManagersInMissouri(result.tableName);
    }
    
  } catch (error) {
    console.error('❌ Error in main:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the script
main().catch(console.error);
