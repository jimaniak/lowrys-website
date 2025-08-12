#!/usr/bin/env node

/**
 * NEW BLS TABLE NORMALIZATION DEMO
 * Shows the normalized data structure and query examples
 */

const xlsx = require('xlsx');
const path = require('path');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const CURRENT_BASE_YEAR = 2023;

// BLS Tables to process (focusing on just a couple for demo)
const BLS_TABLES_CONFIG = {
  '1.2': { 
    name: 'occupational_projections_2023_33',
    description: 'Occupational projections, 2023–33, and worker characteristics, 2023',
    skipTable: false
  },
  '1.3': { 
    name: 'fastest_growing_occupations',
    description: 'Fastest growing occupations, 2023 and projected 2033',
    skipTable: false
  }
};

// Helper function to identify year-based columns and normalize them
function identifyYearColumns(headers) {
  const yearColumns = [];
  const normalColumns = [];
  
  for (const header of headers) {
    if (!header) continue;
    
    const yearMatches = header.match(/(\d{4})/g);
    if (yearMatches && yearMatches.length > 0) {
      // Skip structural columns that happen to have years in them
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes('matrix title') || 
          lowerHeader.includes('matrix code') ||
          lowerHeader.includes('matrix link') ||
          lowerHeader.includes('naics code')) {
        normalColumns.push(header);
        continue;
      }
      
      const year = parseInt(yearMatches[0]);
      let baseColumnName = header.replace(/[,\s]*\d{4}.*$/, '').trim();
      baseColumnName = baseColumnName.replace(/[,\s]*dollars?\s*$/, '').trim();
      
      if (!baseColumnName) baseColumnName = 'value';
      
      const isBaseYear = year <= CURRENT_BASE_YEAR;
      const isFutureYear = year > CURRENT_BASE_YEAR;
      
      yearColumns.push({
        originalHeader: header,
        baseColumnName,
        year,
        isBaseYear,
        isFutureYear,
        columnType: isBaseYear ? 'actual' : (isFutureYear ? 'forecasted' : 'other')
      });
    } else {
      normalColumns.push(header);
    }
  }
  
  return { yearColumns, normalColumns };
}

// Process a single BLS table with normalization
async function processBLSTable(workbook, tableNumber, config) {
  console.log(`\n📊 Processing BLS Table ${tableNumber}: ${config.description}`);
  
  const sheetName = workbook.SheetNames.find(name => 
    name.includes(`${tableNumber}`) || name.includes(tableNumber.replace('.', '_'))
  );
  
  if (!sheetName) {
    console.log(`❌ Sheet for Table ${tableNumber} not found`);
    return null;
  }
  
  const worksheet = workbook.Sheets[sheetName];
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  range.s.r = 1; // Start from row 2 (headers)
  
  const data = xlsx.utils.sheet_to_json(worksheet, { 
    range: range, header: 1, defval: null 
  });
  
  if (!data || data.length === 0) return null;
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const { yearColumns, normalColumns } = identifyYearColumns(headers);
  
  console.log(`📋 ${headers.length} columns: ${yearColumns.length} metrics, ${normalColumns.length} text fields`);
  
  // Normalize the data
  const normalizedRows = [];
  
  for (const row of rows) {
    if (!row || Object.values(row).every(val => !val)) continue;
    
    // Create base record with all text fields
    const baseRecord = {};
    normalColumns.forEach((header, index) => {
      if (header && row[index] !== undefined) {
        const cleanColumnName = header.trim()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .toLowerCase();
        baseRecord[cleanColumnName] = row[index];
      }
    });
    
    // Create normalized records for each metric
    if (yearColumns.length > 0) {
      yearColumns.forEach(col => {
        const headerIndex = headers.indexOf(col.originalHeader);
        if (headerIndex >= 0 && row[headerIndex] !== null && row[headerIndex] !== undefined) {
          const dataType = col.isBaseYear ? 'actual' : 
                          col.isFutureYear ? 'forecasted' : 'other';
          
          const normalizedRecord = {
            ...baseRecord, // ALL text fields included in each row
            metric_name: col.baseColumnName,
            metric_value: row[headerIndex],
            metric_year: col.year,
            data_type: dataType,
            table_number: tableNumber,
            table_name: config.name,
            table_description: config.description,
            source_workbook: 'occupation',
            workbook_year: CURRENT_BASE_YEAR,
            
            // ADD SIMULATED REGIONAL DATA FOR DEMO
            region_code: 'US', // National data
            region_name: 'United States',
            
            refresh_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          normalizedRows.push(normalizedRecord);
        }
      });
    }
  }
  
  console.log(`✅ Normalized ${normalizedRows.length} records`);
  return {
    tableNumber,
    tableName: config.name,
    data: normalizedRows
  };
}

// Create a demo table
async function createDemoTable(tableName, sampleRecord) {
  console.log(`📋 Creating demo table: demo_bls_${tableName}`);
  
  await db.execute(`DROP TABLE IF EXISTS demo_bls_${tableName}`);
  
  let createTableSQL = `
    CREATE TABLE demo_bls_${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number TEXT,
      table_name TEXT,
      table_description TEXT,
      metric_name TEXT,
      metric_value REAL,
      metric_year INTEGER,
      data_type TEXT,
      region_code TEXT,
      region_name TEXT,
      source_workbook TEXT,
      workbook_year INTEGER,
      refresh_date TEXT,
      created_at TEXT,
      updated_at TEXT`;
  
  // Add dynamic text fields
  if (sampleRecord) {
    const standardFields = [
      'table_number', 'table_name', 'table_description', 'metric_name', 
      'metric_value', 'metric_year', 'data_type', 'region_code', 'region_name',
      'source_workbook', 'workbook_year', 'refresh_date', 'created_at', 'updated_at'
    ];
    
    for (const [key, value] of Object.entries(sampleRecord)) {
      if (!standardFields.includes(key)) {
        createTableSQL += `,\n      ${key} TEXT`;
      }
    }
  }
  
  createTableSQL += `\n    )`;
  
  await db.execute(createTableSQL);
  console.log(`✅ Created demo table: demo_bls_${tableName}`);
}

console.log('🚀 NEW BLS TABLE NORMALIZATION DEMO');
console.log('===================================');

async function runDemo() {
  try {
    const xlsxPath = path.join(__dirname, '..', 'public', 'data', 'occupation.xlsx');
    const workbook = xlsx.readFile(xlsxPath);
    
    // Process Table 1.2 (comprehensive occupation data)
    const result = await processBLSTable(workbook, '1.2', BLS_TABLES_CONFIG['1.2']);
    
    if (result && result.data.length > 0) {
      // Create demo table
      await createDemoTable(result.tableName, result.data[0]);
      
      // Insert sample data (first 50 records for demo)
      console.log('\n📥 Inserting sample normalized data...');
      let insertCount = 0;
      
      for (const record of result.data.slice(0, 100)) { // Limit for demo
        const columns = Object.keys(record).filter(key => 
          record[key] !== null && record[key] !== undefined
        );
        const values = columns.map(key => record[key]);
        const placeholders = columns.map(() => '?').join(',');
        
        const insertSQL = `INSERT INTO demo_bls_${result.tableName} (${columns.join(',')}) VALUES (${placeholders})`;
        
        try {
          await db.execute(insertSQL, values);
          insertCount++;
        } catch (error) {
          console.error(`Insert error:`, error.message);
        }
      }
      
      console.log(`✅ Inserted ${insertCount} demo records`);
      
      // NOW DEMONSTRATE QUERIES
      console.log('\n🔍 NORMALIZED DATA STRUCTURE DEMONSTRATION');
      console.log('==========================================');
      
      // 1. Find Project Manager occupations
      console.log('\n1️⃣ FINDING PROJECT MANAGER OCCUPATIONS:');
      const projectManagerQuery = `
        SELECT DISTINCT 
          national_employment_matrix_code as code,
          national_employment_matrix_title as title,
          occupation_type
        FROM demo_bls_${result.tableName} 
        WHERE LOWER(national_employment_matrix_title) LIKE '%project%manager%'
           OR LOWER(national_employment_matrix_title) LIKE '%program%manager%'
        LIMIT 10
      `;
      
      const projectManagers = await db.execute(projectManagerQuery);
      projectManagers.rows.forEach(row => {
        console.log(`   ${row.code}: ${row.title} (${row.occupation_type})`);
      });
      
      // 2. Get ALL metrics for a specific Project Manager occupation
      if (projectManagers.rows.length > 0) {
        const pmCode = projectManagers.rows[0].code;
        const pmTitle = projectManagers.rows[0].title;
        
        console.log(`\n2️⃣ ALL METRICS FOR: ${pmTitle} (${pmCode}):`);
        
        const metricsQuery = `
          SELECT 
            metric_name,
            metric_value,
            metric_year,
            data_type,
            typical_education_needed_for_entry as education,
            work_experience_in_a_related_occupation as experience
          FROM demo_bls_${result.tableName}
          WHERE national_employment_matrix_code = ?
          ORDER BY metric_name, metric_year
        `;
        
        const metrics = await db.execute(metricsQuery, [pmCode]);
        metrics.rows.forEach(row => {
          console.log(`   ${row.metric_name} (${row.metric_year}): ${row.metric_value?.toLocaleString()} [${row.data_type}]`);
          if (row.education && row.education !== '—') {
            console.log(`     Education: ${row.education}`);
          }
          if (row.experience && row.experience !== '—') {
            console.log(`     Experience: ${row.experience}`);
          }
        });
      }
      
      // 3. Demonstrate how we WOULD query by region (Missouri example)
      console.log('\n3️⃣ HOW REGIONAL QUERIES WOULD WORK (with state data):');
      console.log('   Current data is national only, but with regional data you could:');
      console.log('   ');
      console.log('   SQL: SELECT * FROM bls_occupational_projections_2023_33');
      console.log('        WHERE region_code = "MO"');
      console.log('        AND LOWER(national_employment_matrix_title) LIKE "%project%manager%"');
      console.log('   ');
      console.log('   This would return ALL metrics for Project Managers in Missouri:');
      console.log('   - Employment (2023): 12,450 [actual]');
      console.log('   - Employment (2033): 13,890 [forecasted]');  
      console.log('   - Median wage (2024): $89,750 [actual]');
      console.log('   - Education: Bachelor\'s degree');
      console.log('   - Experience: 5 years or more');
      console.log('   - Training: None');
      console.log('   ');
      
      // 4. Show actual data structure
      console.log('\n4️⃣ ACTUAL NORMALIZED RECORD STRUCTURE:');
      const sampleQuery = `
        SELECT * FROM demo_bls_${result.tableName} 
        WHERE national_employment_matrix_code = ? 
        AND metric_name = 'Employment'
        LIMIT 1
      `;
      
      if (projectManagers.rows.length > 0) {
        const sampleRecord = await db.execute(sampleQuery, [projectManagers.rows[0].code]);
        if (sampleRecord.rows.length > 0) {
          const record = sampleRecord.rows[0];
          console.log('   Each record contains ALL context + ONE metric:');
          console.log('   {');
          Object.entries(record).forEach(([key, value]) => {
            const displayValue = typeof value === 'string' && value.length > 50 
              ? `"${value.substring(0, 47)}..."` 
              : JSON.stringify(value);
            console.log(`     "${key}": ${displayValue},`);
          });
          console.log('   }');
        }
      }
      
      // 5. Show relational capabilities
      console.log('\n5️⃣ RELATIONAL QUERY CAPABILITIES:');
      console.log('   ✅ No JOINs needed - each record is self-contained');
      console.log('   ✅ Filter by occupation, metric, year, region, education level');
      console.log('   ✅ Compare metrics across occupations, regions, time periods');
      console.log('   ✅ Aggregate data by any dimension');
      console.log('   ');
      console.log('   Example complex query:');
      console.log('   "Get average wage for all management occupations requiring');
      console.log('    Bachelor\'s degree in Missouri for 2023"');
      console.log('   ');
      console.log('   SELECT AVG(metric_value) as avg_wage');
      console.log('   FROM bls_occupational_projections_2023_33');
      console.log('   WHERE region_code = "MO"');
      console.log('     AND metric_name = "Median annual wage"');
      console.log('     AND metric_year = 2023');
      console.log('     AND typical_education_needed_for_entry = "Bachelor\'s degree"');
      console.log('     AND LOWER(national_employment_matrix_title) LIKE "%manager%"');
      
      // Cleanup
      await db.execute(`DROP TABLE IF EXISTS demo_bls_${result.tableName}`);
      console.log('\n🧹 Demo table cleaned up');
    }
    
    console.log('\n✅ DEMO COMPLETE');
    console.log('================');
    console.log('KEY INSIGHTS:');
    console.log('• Single table approach provides complete context in each row');
    console.log('• No complex JOINs needed for common queries');
    console.log('• Easy to filter and aggregate by any dimension');
    console.log('• Scalable for regional data when available');
    console.log('• Perfect for analytical queries and reporting');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

runDemo();
