// Enhanced BLS Automation Script with Proper Header Handling
// Updated to handle headers on row 2 for all BLS tables except index
// Includes year-flexible processing and robust error handling

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const unzipper = require('unzipper');
const xlsx = require('xlsx');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Import normalization functions
const { 
  normalizeAllBLSTables, 
  BLS_TABLE_CONFIG, 
  detectLatestYear,
  processExcelSheet,
  classifyOccupation,
  buildHierarchy 
} = require('./bls-tables-normalization');

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Current data years with fallback detection
const CURRENT_BASE_YEAR = 2023;
const CURRENT_PROJECTION_YEAR = 2033;
const CURRENT_WAGE_YEAR = 2023;
const PROJECTED_WAGE_YEAR = 2034;

// Data freshness tracking
const DATA_VERSION_TABLE = 'bls_data_versions';

// State name to code mapping (complete)
const STATE_NAME_TO_CODE = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'District of Columbia': 'DC',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL',
  'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA',
  'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN',
  'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
  'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX',
  'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'Puerto Rico': 'PR', 'Guam': 'GU', 'Virgin Islands': 'VI',
  'Northern Mariana Islands': 'MP', 'American Samoa': 'AS'
};

// Detect latest available year for BLS OEWS data
async function detectLatestOEWSYear() {
  const baseUrl = 'https://www.bls.gov/oes/special.requests/oesm{YY}nat.zip';
  const yearsToTry = [CURRENT_BASE_YEAR, CURRENT_BASE_YEAR - 1, CURRENT_BASE_YEAR - 2];
  
  for (const year of yearsToTry) {
    try {
      const yy = (year % 100).toString().padStart(2, '0');
      const testUrl = baseUrl.replace('{YY}', yy);
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Found OEWS data for year ${year}`);
        return year;
      }
    } catch (error) {
      console.log(`⚠️  OEWS year ${year} not available, trying next...`);
    }
  }
  
  throw new Error(`No OEWS data found for years ${yearsToTry.join(', ')}`);
}

// Enhanced OEWS URL generation with year detection
async function generateOEWSUrls() {
  const year = await detectLatestOEWSYear();
  const yy = (year % 100).toString().padStart(2, '0');
  
  return {
    year,
    national: {
      zip: `https://www.bls.gov/oes/special.requests/oesm${yy}nat.zip`,
      xlsx: `oesm${yy}nat/national_M${year}_dl.xlsx`
    },
    state: {
      zip: `https://www.bls.gov/oes/special.requests/oesm${yy}st.zip`,
      xlsx: `oesm${yy}st/state_M${year}_dl.xlsx`
    }
  };
}

// Check if new data is available
async function checkDataFreshness(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return null;
    
    const lastModified = response.headers.get('last-modified');
    const etag = response.headers.get('etag');
    const contentLength = response.headers.get('content-length');
    
    return {
      lastModified: lastModified ? new Date(lastModified).toISOString() : null,
      etag: etag || null,
      contentLength: contentLength ? parseInt(contentLength) : null,
      checkDate: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to check freshness for ${url}:`, error);
    return null;
  }
}

// Enhanced download with retry logic
async function downloadWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📥 Downloading ${url} (attempt ${attempt}/${maxRetries})...`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      console.log(`✅ Downloaded ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
      return Buffer.from(buffer);
      
    } catch (error) {
      console.error(`❌ Download attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to download after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Enhanced unzip with proper error handling
async function unzipBuffer(buffer, targetFilename) {
  return new Promise((resolve, reject) => {
    const entries = [];
    
    const stream = unzipper.Parse()
      .on('entry', (entry) => {
        entries.push(entry.path);
        
        if (entry.path === targetFilename) {
          const chunks = [];
          entry
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', () => {
              const buffer = Buffer.concat(chunks);
              console.log(`✅ Extracted ${targetFilename} (${(buffer.length / 1024).toFixed(2)} KB)`);
              resolve(buffer);
            })
            .on('error', reject);
        } else {
          entry.autodrain();
        }
      })
      .on('error', reject)
      .on('close', () => {
        if (entries.length === 0) {
          reject(new Error('No files found in ZIP archive'));
        } else if (!entries.includes(targetFilename)) {
          reject(new Error(`Target file ${targetFilename} not found. Available files: ${entries.join(', ')}`));
        }
      });
    
    stream.end(buffer);
  });
}

// Process OEWS data with proper header handling
async function processOEWSData(buffer, isNational, dataYear) {
  try {
    console.log(`📊 Processing ${isNational ? 'national' : 'state'} OEWS data...`);
    
    // Parse the XLSX buffer
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // IMPORTANT: OEWS files have headers on row 2
    const raw = xlsx.utils.sheet_to_json(worksheet, { 
      range: 1, // Start from row 2 (0-indexed)
      defval: '' 
    });
    
    console.log(`📋 Found ${raw.length} rows in OEWS data`);
    
    if (raw.length === 0) {
      throw new Error('No data found in OEWS file');
    }
    
    // Log first few column names for debugging
    const sampleRow = raw[0];
    console.log('📋 OEWS columns:', Object.keys(sampleRow).slice(0, 10).join(', '), '...');
    
    // Find relevant columns (case-insensitive)
    const columns = Object.keys(sampleRow);
    const codeCol = columns.find(c => /OCC[_\\s]*CODE/i.test(c)) || 'OCC_CODE';
    const titleCol = columns.find(c => /OCC[_\\s]*TITLE/i.test(c)) || 'OCC_TITLE';
    const empCol = columns.find(c => /TOT[_\\s]*EMP/i.test(c)) || 'TOT_EMP';
    const wageCol = columns.find(c => /A[_\\s]*MEDIAN/i.test(c)) || 'A_MEDIAN';
    const stateCol = isNational ? null : (columns.find(c => /ST/i.test(c)) || 'ST');
    
    console.log(`📊 Using columns: code=${codeCol}, title=${titleCol}, emp=${empCol}, wage=${wageCol}${stateCol ? `, state=${stateCol}` : ''}`);
    
    const processedData = [];
    
    for (const row of raw) {
      const code = (row[codeCol] || '').toString().trim();
      const title = (row[titleCol] || '').toString().trim();
      
      // Skip header rows and empty entries
      if (!code || code === 'OCC_CODE' || !title) continue;
      
      const employment = row[empCol] ? parseInt(row[empCol].toString().replace(/[^\\d]/g, '')) : null;
      const wage = row[wageCol] ? parseInt(row[wageCol].toString().replace(/[^\\d]/g, '')) : null;
      const state = isNational ? null : (row[stateCol] || '').toString().trim();
      
      const processedRow = {
        occupation_code: code,
        occupation_title: title,
        employment: employment,
        median_annual_wage: wage,
        data_year: dataYear,
        data_type: isNational ? 'national' : 'state',
        state_code: state,
        refresh_date: new Date().toISOString()
      };
      
      processedData.push(processedRow);
    }
    
    console.log(`✅ Processed ${processedData.length} OEWS records`);
    return processedData;
    
  } catch (error) {
    console.error('❌ Failed to process OEWS data:', error);
    throw error;
  }
}

// Store OEWS data in database
async function storeOEWSData(data, isNational) {
  const tableName = isNational ? 'bls_oews_national' : 'bls_oews_state';
  
  // Create table if it doesn't exist
  const createSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      occupation_code TEXT NOT NULL,
      occupation_title TEXT,
      employment INTEGER,
      median_annual_wage INTEGER,
      data_year INTEGER NOT NULL,
      data_type TEXT NOT NULL,
      ${isNational ? '' : 'state_code TEXT,'}
      refresh_date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(occupation_code, data_year${isNational ? '' : ', state_code'})
    )
  `;
  
  await db.execute(createSQL);
  console.log(`✅ Created/verified table: ${tableName}`);
  
  // Clear existing data for this year
  const dataYear = data[0]?.data_year;
  if (dataYear) {
    const deleteSQL = isNational 
      ? `DELETE FROM ${tableName} WHERE data_year = ?`
      : `DELETE FROM ${tableName} WHERE data_year = ?`;
    await db.execute(deleteSQL, [dataYear]);
    console.log(`🧹 Cleared existing ${dataYear} data from ${tableName}`);
  }
  
  // Insert new data
  let insertCount = 0;
  for (const row of data) {
    const columns = Object.keys(row);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(key => row[key]);
    
    const insertSQL = `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    try {
      await db.execute(insertSQL, values);
      insertCount++;
    } catch (error) {
      console.error(`❌ Failed to insert OEWS row:`, error);
    }
  }
  
  console.log(`✅ Inserted ${insertCount} records into ${tableName}`);
}

// Main automation process
async function runAutomation() {
  try {
    console.log('🚀 Starting Enhanced BLS Automation Process...\n');
    
    // Step 1: Normalize BLS occupation tables (Tables 1.1-1.12)
    console.log('📊 Step 1: Normalizing BLS occupation tables...');
    await normalizeAllBLSTables();
    
    // Step 2: Process OEWS wage data
    console.log('\\n💰 Step 2: Processing OEWS wage data...');
    
    const oewsUrls = await generateOEWSUrls();
    console.log(`📅 Using OEWS data for year ${oewsUrls.year}`);
    
    // Process national OEWS data
    console.log('🇺🇸 Processing national OEWS data...');
    const nationalZipBuffer = await downloadWithRetry(oewsUrls.national.zip);
    const nationalXlsxBuffer = await unzipBuffer(nationalZipBuffer, oewsUrls.national.xlsx);
    const nationalData = await processOEWSData(nationalXlsxBuffer, true, oewsUrls.year);
    await storeOEWSData(nationalData, true);
    
    // Process state OEWS data
    console.log('🏛️  Processing state OEWS data...');
    const stateZipBuffer = await downloadWithRetry(oewsUrls.state.zip);
    const stateXlsxBuffer = await unzipBuffer(stateZipBuffer, oewsUrls.state.xlsx);
    const stateData = await processOEWSData(stateXlsxBuffer, false, oewsUrls.year);
    await storeOEWSData(stateData, false);
    
    // Step 3: Update metadata and cleanup
    console.log('\\n📋 Step 3: Updating metadata...');
    
    // Update automation log
    await db.execute(`
      CREATE TABLE IF NOT EXISTS automation_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_date TEXT NOT NULL,
        data_year INTEGER NOT NULL,
        tables_processed INTEGER NOT NULL,
        total_records INTEGER NOT NULL,
        status TEXT NOT NULL,
        notes TEXT
      )
    `);
    
    // Count total records
    const nationalCount = await db.execute('SELECT COUNT(*) as count FROM bls_oews_national WHERE data_year = ?', [oewsUrls.year]);
    const stateCount = await db.execute('SELECT COUNT(*) as count FROM bls_oews_state WHERE data_year = ?', [oewsUrls.year]);
    const totalRecords = (nationalCount.rows[0]?.count || 0) + (stateCount.rows[0]?.count || 0);
    
    await db.execute(`
      INSERT INTO automation_log (run_date, data_year, tables_processed, total_records, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      new Date().toISOString(),
      oewsUrls.year,
      Object.keys(BLS_TABLE_CONFIG).length + 2, // BLS tables + 2 OEWS tables
      totalRecords,
      'SUCCESS',
      'Enhanced automation with proper header handling'
    ]);
    
    console.log('\\n✅ BLS Automation Complete!');
    console.log('📊 Summary:');
    console.log(`   • Data Year: ${oewsUrls.year}`);
    console.log(`   • BLS Tables: ${Object.keys(BLS_TABLE_CONFIG).length} normalized`);
    console.log(`   • OEWS National: ${nationalCount.rows[0]?.count || 0} records`);
    console.log(`   • OEWS State: ${stateCount.rows[0]?.count || 0} records`);
    console.log(`   • Total Records: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Automation failed:', error);
    
    // Log failure
    try {
      await db.execute(`
        INSERT INTO automation_log (run_date, data_year, tables_processed, total_records, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        new Date().toISOString(),
        CURRENT_BASE_YEAR,
        0,
        0,
        'FAILED',
        error.message
      ]);
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
    
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runAutomation()
    .then(() => {
      console.log('🎉 Automation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Automation script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAutomation,
  detectLatestOEWSYear,
  generateOEWSUrls,
  processOEWSData,
  storeOEWSData,
  downloadWithRetry,
  unzipBuffer
};
