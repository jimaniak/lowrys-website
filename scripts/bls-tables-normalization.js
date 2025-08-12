// BLS Tables Normalization and Automation Script
// Handles all 12 BLS tables (Tables 1.1–1.12) with proper header handling and normalization
// Key features:
// - Headers are on row 2 for all tables except index
// - Split year-based columns into normalized format
// - Add year and refresh date metadata
// - Use index tab for table naming conventions
// - Handle year-based file detection and fallback

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const xlsx = require('xlsx');
require('dotenv').config({ path: '.env.local' });

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Current data years (update these annually when new BLS data is released)
const CURRENT_BASE_YEAR = 2023;
const CURRENT_PROJECTION_YEAR = 2033;

// BLS Table Configuration based on index tab naming conventions
const BLS_TABLE_CONFIG = {
  'Table 1.1': {
    name: 'employment_by_major_occupational_group',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Employment_2033': { base: 'employment_projected', year: 'employment_projected_year' },
      'Change_2023_2033': { base: 'employment_change', year: 'employment_change_period' },
      'Percent_change_2023_2033': { base: 'employment_percent_change', year: 'employment_percent_change_period' }
    }
  },
  'Table 1.2': {
    name: 'occupation_codes_and_titles',
    normalizedColumns: {} // This is the classification table, no year-based columns
  },
  'Table 1.3': {
    name: 'employment_and_wages_by_occupation',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Employment_2033': { base: 'employment_projected', year: 'employment_projected_year' },
      'Median_annual_wage_2023': { base: 'median_annual_wage_base', year: 'median_annual_wage_base_year' },
      'Median_annual_wage_2034': { base: 'median_annual_wage_projected', year: 'median_annual_wage_projected_year' }
    }
  },
  'Table 1.4': {
    name: 'occupations_with_most_job_growth',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Employment_2033': { base: 'employment_projected', year: 'employment_projected_year' },
      'Change_2023_2033': { base: 'employment_change', year: 'employment_change_period' }
    }
  },
  'Table 1.5': {
    name: 'occupations_with_fastest_growth',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Employment_2033': { base: 'employment_projected', year: 'employment_projected_year' },
      'Percent_change_2023_2033': { base: 'employment_percent_change', year: 'employment_percent_change_period' }
    }
  },
  'Table 1.6': {
    name: 'occupations_with_most_job_decline',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Employment_2033': { base: 'employment_projected', year: 'employment_projected_year' },
      'Change_2023_2033': { base: 'employment_change', year: 'employment_change_period' }
    }
  },
  'Table 1.7': {
    name: 'occupations_with_fastest_decline',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Employment_2033': { base: 'employment_projected', year: 'employment_projected_year' },
      'Percent_change_2023_2033': { base: 'employment_percent_change', year: 'employment_percent_change_period' }
    }
  },
  'Table 1.8': {
    name: 'occupations_by_education_work_experience',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Employment_2033': { base: 'employment_projected', year: 'employment_projected_year' },
      'Median_annual_wage_2023': { base: 'median_annual_wage_base', year: 'median_annual_wage_base_year' }
    }
  },
  'Table 1.9': {
    name: 'occupations_by_education_work_experience_detail',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Employment_2033': { base: 'employment_projected', year: 'employment_projected_year' },
      'Median_annual_wage_2023': { base: 'median_annual_wage_base', year: 'median_annual_wage_base_year' }
    }
  },
  'Table 1.10': {
    name: 'new_jobs_by_education',
    normalizedColumns: {
      'Job_openings_2023_2033': { base: 'job_openings_total', year: 'job_openings_period' },
      'Median_annual_wage_2023': { base: 'median_annual_wage_base', year: 'median_annual_wage_base_year' }
    }
  },
  'Table 1.11': {
    name: 'occupational_separations_by_education',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Separations_2023_2033': { base: 'separations_total', year: 'separations_period' }
    }
  },
  'Table 1.12': {
    name: 'occupational_openings_by_education',
    normalizedColumns: {
      'Employment_2023': { base: 'employment_base', year: 'employment_base_year' },
      'Job_openings_2023_2033': { base: 'job_openings_total', year: 'job_openings_period' }
    }
  }
};

// Helper function to detect the latest available year from file names
async function detectLatestYear(baseUrl, currentYear = CURRENT_BASE_YEAR) {
  const yearsToTry = [currentYear, currentYear - 1, currentYear - 2];
  
  for (const year of yearsToTry) {
    try {
      const testUrl = baseUrl.replace(/\\d{4}/, year.toString());
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Found BLS data for year ${year}`);
        return year;
      }
    } catch (error) {
      console.log(`⚠️  Year ${year} not available, trying next...`);
    }
  }
  
  throw new Error(`No BLS data found for years ${yearsToTry.join(', ')}`);
}

// Download occupation workbook with year detection
async function downloadOccupationWorkbook() {
  const baseUrl = 'https://www.bls.gov/emp/tables/occupation-projections-and-characteristics.xlsx';
  
  try {
    const year = await detectLatestYear(baseUrl);
    const response = await fetch(baseUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download occupation workbook: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    console.log(`✅ Downloaded occupation workbook for year ${year}`);
    
    return {
      buffer: Buffer.from(buffer),
      year,
      refreshDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Failed to download occupation workbook:', error);
    throw error;
  }
}

// Process Excel sheet with proper header handling (row 2 for all tables except index)
function processExcelSheet(workbook, sheetName, isIndexSheet = false) {
  const worksheet = workbook.Sheets[sheetName];
  
  if (isIndexSheet) {
    // Index sheet has headers on row 1
    return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  } else {
    // All other BLS tables have headers on row 2
    return xlsx.utils.sheet_to_json(worksheet, { 
      range: 1, // Start from row 2 (0-indexed)
      defval: '' 
    });
  }
}

// Create normalized table with proper schema
async function createNormalizedTable(tableConfig, tableName) {
  const { normalizedColumns } = tableConfig;
  
  // Base columns that all tables have
  let createSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      occupation_code TEXT,
      occupation_title TEXT,
      occupation_type TEXT,
      category TEXT,
      parent_code TEXT,
      data_year INTEGER,
      refresh_date TEXT,
  `;
  
  // Add normalized columns
  for (const [originalCol, normalized] of Object.entries(normalizedColumns)) {
    createSQL += `
      ${normalized.base} REAL,
      ${normalized.year} INTEGER,`;
  }
  
  // Remove trailing comma and close table
  createSQL = createSQL.replace(/,$/, '') + '\n    )';
  
  try {
    await db.execute(createSQL);
    console.log(`✅ Created/verified table: ${tableName}`);
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error);
    throw error;
  }
}

// Normalize year-based columns
function normalizeRowData(row, normalizedColumns, dataYear, refreshDate) {
  const normalizedRow = {
    occupation_code: row['2023 National Employment Matrix code'] || row['Occupation code'] || '',
    occupation_title: row['Occupation title'] || row['Occupation'] || '',
    occupation_type: row['Occupation type'] || '',
    category: '', // Will be filled by classification logic
    parent_code: null, // Will be filled by hierarchy logic
    data_year: dataYear,
    refresh_date: refreshDate
  };
  
  // Process year-based columns
  for (const [originalCol, normalized] of Object.entries(normalizedColumns)) {
    const value = row[originalCol];
    if (value !== undefined && value !== null && value !== '') {
      // Parse numeric value, removing commas and other formatting
      const numericValue = parseFloat(value.toString().replace(/[^\\d.-]/g, ''));
      if (!isNaN(numericValue)) {
        normalizedRow[normalized.base] = numericValue;
        
        // Extract year from column name or use defaults
        if (originalCol.includes('2023')) {
          normalizedRow[normalized.year] = 2023;
        } else if (originalCol.includes('2033')) {
          normalizedRow[normalized.year] = 2033;
        } else if (originalCol.includes('2034')) {
          normalizedRow[normalized.year] = 2034;
        } else if (originalCol.includes('2023_2033')) {
          normalizedRow[normalized.year] = '2023-2033'; // For change periods
        }
      }
    }
  }
  
  return normalizedRow;
}

// Classification logic from Table 1.2
function classifyOccupation(code, occupationType) {
  if (!code || !occupationType) return 'OTHER';
  
  if (code === '00-0000') return 'ALL';
  
  if (occupationType === 'Line item') return 'OCCUPATION';
  
  if (occupationType === 'Summary') {
    if (code.endsWith('0000') && code !== '00-0000') return 'MAJOR';
    if (code.length === 7 && code[4] !== '0' && code[5] === '0') return 'BROAD';
    if (code.length === 7 && code.slice(-3) === '000' && code[3] !== '0') return 'MINOR';
    if (code.length === 7 && code[5] !== '0') return 'DETAILED';
  }
  
  return 'OTHER';
}

// Build hierarchy relationships
function buildHierarchy(occupations) {
  const codeMap = new Map();
  const validCodes = new Set();
  
  // First pass: build code map and valid codes set
  for (const occ of occupations) {
    codeMap.set(occ.occupation_code, occ);
    validCodes.add(occ.occupation_code);
  }
  
  // Second pass: assign parent codes
  for (const occ of occupations) {
    const { occupation_code: code, category } = occ;
    let parentCode = null;
    
    switch (category) {
      case 'MAJOR':
        parentCode = null; // Major groups have no parent
        break;
        
      case 'BROAD':
        const majorCode = code.slice(0, 2) + '-0000';
        parentCode = validCodes.has(majorCode) ? majorCode : null;
        break;
        
      case 'MINOR':
        const broadCode = code.slice(0, 4) + '00';
        if (validCodes.has(broadCode)) {
          parentCode = broadCode;
        } else {
          const majorCodeFromMinor = code.slice(0, 2) + '-0000';
          parentCode = validCodes.has(majorCodeFromMinor) ? majorCodeFromMinor : null;
        }
        break;
        
      case 'DETAILED':
        // Try broad first, then minor
        const detailedToBroad = Object.keys(BLS_TABLE_CONFIG).find(b => 
          codeMap.has(b) && 
          codeMap.get(b).category === 'BROAD' && 
          b.slice(0, 5) === code.slice(0, 5)
        );
        if (detailedToBroad) {
          parentCode = detailedToBroad;
        } else {
          const detailedToMinor = code.slice(0, 4) + '000';
          parentCode = validCodes.has(detailedToMinor) ? detailedToMinor : null;
        }
        break;
        
      case 'OCCUPATION':
        // Try detailed -> broad -> minor -> major hierarchy
        const detailedParent = code.slice(0, -1) + '0';
        if (validCodes.has(detailedParent)) {
          parentCode = detailedParent;
        } else {
          const broadParent = code.slice(0, 5) + '00';
          if (validCodes.has(broadParent)) {
            parentCode = broadParent;
          } else {
            const minorParent = code.slice(0, 4) + '000';
            if (validCodes.has(minorParent)) {
              parentCode = minorParent;
            } else {
              const majorParent = code.slice(0, 2) + '-0000';
              parentCode = (validCodes.has(majorParent) && majorParent !== '00-0000') ? majorParent : null;
            }
          }
        }
        break;
    }
    
    occ.parent_code = parentCode;
  }
  
  return occupations;
}

// Process a single BLS table
async function processBLSTable(workbook, tableKey, tableConfig, dataYear, refreshDate) {
  console.log(`📊 Processing ${tableKey}...`);
  
  const sheetName = Object.keys(workbook.Sheets).find(name => 
    name.toLowerCase().includes(tableKey.toLowerCase().replace('Table ', '').replace('.', ''))
  );
  
  if (!sheetName) {
    console.log(`⚠️  Sheet not found for ${tableKey}, skipping...`);
    return;
  }
  
  // Process sheet data with proper header handling
  const rawData = processExcelSheet(workbook, sheetName, false);
  
  if (!rawData || rawData.length === 0) {
    console.log(`⚠️  No data found in ${tableKey}, skipping...`);
    return;
  }
  
  console.log(`📋 Found ${rawData.length} rows in ${tableKey}`);
  
  // Create normalized table
  const tableName = `bls_${tableConfig.name}`;
  await createNormalizedTable(tableConfig, tableName);
  
  // Process and normalize data
  const normalizedData = [];
  for (const row of rawData) {
    const normalizedRow = normalizeRowData(row, tableConfig.normalizedColumns, dataYear, refreshDate);
    
    // Add classification
    normalizedRow.category = classifyOccupation(normalizedRow.occupation_code, normalizedRow.occupation_type);
    
    normalizedData.push(normalizedRow);
  }
  
  // Build hierarchy relationships
  const hierarchicalData = buildHierarchy(normalizedData);
  
  // Clear existing data for this year
  await db.execute(`DELETE FROM ${tableName} WHERE data_year = ?`, [dataYear]);
  
  // Insert normalized data
  let insertCount = 0;
  for (const row of hierarchicalData) {
    if (!row.occupation_code || !row.occupation_title) continue;
    
    const columns = Object.keys(row).filter(key => row[key] !== undefined);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(key => row[key]);
    
    const insertSQL = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    try {
      await db.execute(insertSQL, values);
      insertCount++;
    } catch (error) {
      console.error(`❌ Failed to insert row for ${row.occupation_code}:`, error);
    }
  }
  
  console.log(`✅ Inserted ${insertCount} normalized records into ${tableName}`);
}

// Main normalization process
async function normalizeAllBLSTables() {
  try {
    console.log('🚀 Starting BLS Tables Normalization Process...\n');
    
    // Download occupation workbook
    console.log('📥 Downloading occupation workbook...');
    const { buffer, year, refreshDate } = await downloadOccupationWorkbook();
    
    // Parse workbook
    console.log('📊 Parsing workbook...');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    console.log('📋 Available sheets:', workbook.SheetNames);
    
    // Process index sheet for reference
    const indexData = processExcelSheet(workbook, 'Index', true);
    console.log(`📚 Index contains ${indexData.length} table references`);
    
    // Process each BLS table
    for (const [tableKey, tableConfig] of Object.entries(BLS_TABLE_CONFIG)) {
      await processBLSTable(workbook, tableKey, tableConfig, year, refreshDate);
    }
    
    // Create metadata table for tracking
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bls_data_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT UNIQUE,
        data_year INTEGER,
        refresh_date TEXT,
        record_count INTEGER,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Update metadata
    for (const [tableKey, tableConfig] of Object.entries(BLS_TABLE_CONFIG)) {
      const tableName = `bls_${tableConfig.name}`;
      const countResult = await db.execute(`SELECT COUNT(*) as count FROM ${tableName} WHERE data_year = ?`, [year]);
      const recordCount = countResult.rows[0]?.count || 0;
      
      await db.execute(`
        INSERT OR REPLACE INTO bls_data_metadata (table_name, data_year, refresh_date, record_count)
        VALUES (?, ?, ?, ?)
      `, [tableName, year, refreshDate, recordCount]);
    }
    
    console.log('\\n✅ BLS Tables Normalization Complete!');
    console.log('📊 Summary:');
    
    const metadataResult = await db.execute('SELECT * FROM bls_data_metadata ORDER BY table_name');
    for (const row of metadataResult.rows) {
      console.log(`   • ${row.table_name}: ${row.record_count} records (${row.data_year})`);
    }
    
  } catch (error) {
    console.error('❌ Normalization failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  normalizeAllBLSTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  normalizeAllBLSTables,
  BLS_TABLE_CONFIG,
  detectLatestYear,
  processExcelSheet,
  classifyOccupation,
  buildHierarchy
};
