#!/usr/bin/env node

/**
 * BLS Occupation Workbook Table Processor
 * 
 * Processes all BLS tables from the occupation workbook with year-based column normalization.
 * Tables to process: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 1.9, 1.10, 1.12 (skip 1.7, 1.11)
 * Headers start on row 2
 * 
 * Year column normalization:
 * - Base year (past) vs Future year columns
 * - Single year columns like "Median annual wage, dollars, 2024[1]" → "Median annual wage" + "Median annual wage year"
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const xlsx = require('xlsx');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Tables to process (skip 1.7 and 1.11)
const TABLES_TO_PROCESS = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.8', '1.9', '1.10', '1.12'];

// Table name mapping for better naming convention
const TABLE_NAME_MAPPING = {
  '1.1': 'employment_by_industry',
  '1.2': 'employment_by_occupation', 
  '1.3': 'employment_projections_industry',
  '1.4': 'employment_projections_occupation',
  '1.5': 'occupational_employment_statistics',
  '1.6': 'industry_employment_statistics',
  '1.8': 'occupational_wages',
  '1.9': 'industry_wages',
  '1.10': 'employment_outlook',
  '1.12': 'employment_growth_rates'
};

/**
 * Analyze column headers to identify year-based columns
 */
function analyzeColumns(headers) {
  const analysis = {
    yearColumns: [],
    baseYearColumns: [],
    futureYearColumns: [],
    singleYearColumns: [],
    regularColumns: []
  };
  
  headers.forEach(header => {
    if (!header) return;
    
    // Check for year patterns in column names
    const yearMatch = header.match(/(\d{4})/g);
    
    if (yearMatch) {
      const years = yearMatch.map(y => parseInt(y));
      const currentYear = new Date().getFullYear();
      
      if (years.length === 1) {
        // Single year column like "Median annual wage, dollars, 2024[1]"
        const year = years[0];
        analysis.singleYearColumns.push({
          original: header,
          year: year,
          baseColumn: header.replace(/,?\s*\d{4}.*$/, '').trim(),
          isBase: year <= currentYear,
          isFuture: year > currentYear
        });
      } else if (years.length === 2) {
        // Comparison columns like "Change, 2023-33"
        const [baseYear, futureYear] = years.sort((a, b) => a - b);
        analysis.yearColumns.push({
          original: header,
          baseYear: baseYear,
          futureYear: futureYear,
          baseColumn: header.replace(/,?\s*\d{4}-\d{2,4}.*$/, '').trim()
        });
      }
    } else {
      // Regular columns without years
      analysis.regularColumns.push(header);
    }
  });
  
  return analysis;
}

/**
 * Normalize year-based columns into separate columns
 */
function normalizeYearColumns(rowData, columnAnalysis) {
  const normalizedRow = {};
  
  // Copy regular columns as-is
  columnAnalysis.regularColumns.forEach(col => {
    normalizedRow[col] = rowData[col];
  });
  
  // Handle single year columns
  columnAnalysis.singleYearColumns.forEach(colInfo => {
    const value = rowData[colInfo.original];
    normalizedRow[colInfo.baseColumn] = value;
    normalizedRow[`${colInfo.baseColumn}_year`] = colInfo.year;
  });
  
  // Handle comparison year columns
  columnAnalysis.yearColumns.forEach(colInfo => {
    const value = rowData[colInfo.original];
    // For comparison columns, we might want to split the logic differently
    // For now, keep as base/future pattern
    normalizedRow[`${colInfo.baseColumn}_base`] = value; // This might need more complex parsing
    normalizedRow[`${colInfo.baseColumn}_base_year`] = colInfo.baseYear;
    normalizedRow[`${colInfo.baseColumn}_future_year`] = colInfo.futureYear;
  });
  
  return normalizedRow;
}

/**
 * Process a single BLS table from the workbook
 */
async function processBLSTable(workbook, tableNumber) {
  console.log(`\n=== Processing Table ${tableNumber} ===`);
  
  // Find the sheet for this table
  const sheetName = workbook.SheetNames.find(name => 
    name.includes(tableNumber) || name.includes(`Table ${tableNumber}`)
  );
  
  if (!sheetName) {
    console.log(`❌ Sheet not found for Table ${tableNumber}`);
    return;
  }
  
  console.log(`📋 Processing sheet: ${sheetName}`);
  
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON starting from row 2 (headers)
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { 
    range: 1, // Start from row 2 (0-indexed, so 1)
    defval: null 
  });
  
  if (jsonData.length === 0) {
    console.log(`❌ No data found in Table ${tableNumber}`);
    return;
  }
  
  console.log(`📊 Found ${jsonData.length} rows of data`);
  
  // Get headers (first row after conversion)
  const headers = Object.keys(jsonData[0]);
  console.log(`📋 Headers (${headers.length}):`, headers.slice(0, 5), headers.length > 5 ? '...' : '');
  
  // Analyze columns for year-based patterns
  const columnAnalysis = analyzeColumns(headers);
  
  console.log(`🔍 Column Analysis:`);
  console.log(`  - Regular columns: ${columnAnalysis.regularColumns.length}`);
  console.log(`  - Single year columns: ${columnAnalysis.singleYearColumns.length}`);
  console.log(`  - Year comparison columns: ${columnAnalysis.yearColumns.length}`);
  
  if (columnAnalysis.singleYearColumns.length > 0) {
    console.log(`  Single year columns:`, columnAnalysis.singleYearColumns.map(c => c.original));
  }
  
  if (columnAnalysis.yearColumns.length > 0) {
    console.log(`  Year comparison columns:`, columnAnalysis.yearColumns.map(c => c.original));
  }
  
  // Generate table name
  const tableName = `bls_table_${tableNumber.replace('.', '_')}`;
  const friendlyName = TABLE_NAME_MAPPING[tableNumber] || tableName;
  
  console.log(`🏗️  Target table: ${tableName} (${friendlyName})`);
  
  // Create normalized data structure
  const normalizedData = jsonData.map(row => {
    const normalized = normalizeYearColumns(row, columnAnalysis);
    
    // Add metadata
    normalized.source_table = tableNumber;
    normalized.workbook_year = new Date().getFullYear();
    normalized.refresh_date = new Date().toISOString();
    normalized.table_description = friendlyName;
    
    return normalized;
  });
  
  console.log(`✅ Normalized ${normalizedData.length} rows`);
  
  // Show sample of normalized data
  if (normalizedData.length > 0) {
    console.log(`📋 Sample normalized row:`, Object.keys(normalizedData[0]).slice(0, 8));
  }
  
  return {
    tableNumber,
    tableName,
    friendlyName,
    originalRowCount: jsonData.length,
    normalizedRowCount: normalizedData.length,
    columnAnalysis,
    normalizedData: normalizedData.slice(0, 3) // Just keep first 3 rows for preview
  };
}

/**
 * Create database table for normalized BLS data
 */
async function createBLSTable(tableName, sampleData, columnAnalysis) {
  console.log(`\n🏗️  Creating table: ${tableName}`);
  
  // Generate schema based on the normalized data structure
  const columns = [];
  
  if (sampleData && sampleData.length > 0) {
    const sampleRow = sampleData[0];
    
    Object.keys(sampleRow).forEach(key => {
      let dataType = 'TEXT';
      const value = sampleRow[key];
      
      // Determine data type based on value
      if (typeof value === 'number') {
        dataType = 'REAL';
      } else if (key.includes('_year') || key === 'workbook_year') {
        dataType = 'INTEGER';
      } else if (key.includes('_date')) {
        dataType = 'DATETIME';
      }
      
      columns.push(`${key} ${dataType}`);
    });
  }
  
  // Add standard metadata columns if not present
  const standardColumns = [
    'id INTEGER PRIMARY KEY AUTOINCREMENT',
    'created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
    'updated_at DATETIME DEFAULT CURRENT_TIMESTAMP'
  ];
  
  const allColumns = [...standardColumns, ...columns];
  
  const createSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${allColumns.join(',\n      ')}
    )
  `;
  
  console.log(`📝 Create SQL:`, createSQL.substring(0, 200) + '...');
  
  try {
    await db.execute(createSQL);
    console.log(`✅ Table ${tableName} created successfully`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * Main processing function
 */
async function processBLSWorkbook(workbookPath) {
  console.log('🚀 Starting BLS Occupation Workbook Processing');
  console.log(`📁 Workbook path: ${workbookPath}`);
  
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Workbook file not found: ${workbookPath}`);
  }
  
  // Load workbook
  console.log('📖 Loading workbook...');
  const workbook = xlsx.readFile(workbookPath);
  
  console.log(`📋 Available sheets: ${workbook.SheetNames.length}`);
  console.log('Sheet names:', workbook.SheetNames);
  
  const results = [];
  
  // Process each table
  for (const tableNumber of TABLES_TO_PROCESS) {
    try {
      const result = await processBLSTable(workbook, tableNumber);
      if (result) {
        results.push(result);
        
        // Create database table (dry run for now)
        console.log(`🔄 Would create table: ${result.tableName}`);
        // await createBLSTable(result.tableName, result.normalizedData, result.columnAnalysis);
      }
    } catch (error) {
      console.error(`❌ Error processing Table ${tableNumber}:`, error.message);
    }
  }
  
  // Generate summary
  console.log('\n📊 Processing Summary:');
  console.log(`✅ Successfully processed: ${results.length}/${TABLES_TO_PROCESS.length} tables`);
  
  results.forEach(result => {
    console.log(`  - Table ${result.tableNumber}: ${result.originalRowCount} rows → ${result.normalizedRowCount} normalized rows`);
  });
  
  return results;
}

/**
 * Integration with existing automation script
 */
async function integrateBLSTableProcessing() {
  console.log('\n🔗 Integration with Automation Script');
  console.log('This function would be called from the enhanced-sunday-night-automation.js script');
  console.log('It would process the occupation workbook and create/update the BLS tables');
  
  // This would be integrated into the main automation workflow
  // The workbook path would come from the automation script's download process
}

/**
 * CLI execution
 */
async function main() {
  try {
    // For testing, use a sample workbook path
    const workbookPath = path.join(__dirname, '..', 'db', 'occupation.xlsx');
    
    if (process.argv.includes('--test') && fs.existsSync(workbookPath)) {
      console.log('🧪 Running in test mode with local workbook');
      await processBLSWorkbook(workbookPath);
    } else {
      console.log('📋 BLS Table Processor Ready');
      console.log('Usage:');
      console.log('  node bls-table-processor.js --test    # Test with local workbook');
      console.log('  Integration: Call processBLSWorkbook() from automation script');
      
      await integrateBLSTableProcessing();
    }
    
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Export functions for integration
module.exports = {
  processBLSWorkbook,
  processBLSTable,
  analyzeColumns,
  normalizeYearColumns,
  createBLSTable,
  TABLES_TO_PROCESS,
  TABLE_NAME_MAPPING
};

// Run if called directly
if (require.main === module) {
  main();
}
