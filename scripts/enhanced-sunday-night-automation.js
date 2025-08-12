// Enhanced Sunday Night BLS Automation Script
// Includes data freshness checking, versioning, and smart updates
// Runs every Sunday at midnight to refresh BLS data only when needed

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const unzipper = require('unzipper');
const xlsx = require('xlsx');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Current data years (update these annually when new BLS data is released)
const CURRENT_BASE_YEAR = 2023;
const CURRENT_PROJECTION_YEAR = 2033;
const CURRENT_WAGE_YEAR = 2023;
const PROJECTED_WAGE_YEAR = 2034;

// Data freshness tracking
const DATA_VERSION_TABLE = 'bls_data_versions';

// State name to code mapping
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

// BLS OEWS URLs (update year as needed)
const BLS_OEWS_NAT_ZIP_URL = `https://www.bls.gov/oes/special.requests/oesm${CURRENT_BASE_YEAR % 100}nat.zip`;
const BLS_OEWS_STATE_ZIP_URL = `https://www.bls.gov/oes/special.requests/oesm${CURRENT_BASE_YEAR % 100}st.zip`;
const XLSX_NAT_FILENAME = `oesm${CURRENT_BASE_YEAR % 100}nat/national_M${CURRENT_BASE_YEAR}_dl.xlsx`;
const XLSX_STATE_FILENAME = `oesm${CURRENT_BASE_YEAR % 100}st/state_M${CURRENT_BASE_YEAR}_dl.xlsx`;

// Category classification functions using CORRECT requirements
function isOccupation(code, occupation_type) {
  // OCCUPATION: Must be occupation_type = 'Line item'
  return occupation_type === 'Line item';
}

function isMajor(code, occupation_type) {
  if (occupation_type !== 'Summary') return false;
  // MAJOR: ends with '0000' and is not '00-0000'
  return code.endsWith('0000') && code !== '00-0000';
}

function isMinor(code, occupation_type) {
  if (occupation_type !== 'Summary') return false;
  // MINOR: last 3 chars = '000', 4th from end != '0'
  const lastThree = code.slice(-3);
  const fourthFromRight = code[code.length - 4];
  return lastThree === '000' && fourthFromRight !== '0';
}

function isBroad(code, occupation_type) {
  if (occupation_type !== 'Summary' || code.length !== 7) return false;
  // BROAD: 3rd from right != '0' AND 2nd from right = '0'
  const thirdFromRight = code[code.length - 3];   // 3rd from right
  const secondFromRight = code[code.length - 2];  // 2nd from right
  return thirdFromRight !== '0' && secondFromRight === '0';
}

function isDetailed(code, occupation_type) {
  if (occupation_type !== 'Summary' || code.length !== 7) return false;
  // DETAILED: Summary occupations with 2nd digit from right != '0'
  const secondFromRight = code[code.length - 2];
  return secondFromRight !== '0';
}

function getCategory(code, occupation_type, excelType) {
  // If Table 1.2 says this code is a Line item, always OCCUPATION
  if (excelType === 'Line item') return 'OCCUPATION';
  if (isOccupation(code, occupation_type)) return 'OCCUPATION';
  if (isMajor(code, occupation_type)) return 'MAJOR';
  if (isMinor(code, occupation_type)) return 'MINOR';
  if (isBroad(code, occupation_type)) return 'BROAD';
  if (isDetailed(code, occupation_type)) return 'DETAILED';
  return 'OTHER';
}

// Create data versioning table if it doesn't exist
async function ensureVersionTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${DATA_VERSION_TABLE} (
      data_source TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      file_hash TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      last_modified TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      record_count INTEGER
    )
  `);
}

// Calculate file hash for freshness checking
function calculateHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Check if we need to update based on file hash and metadata
async function checkDataFreshness(url, dataSource) {
  console.log(`🔍 Checking freshness for ${dataSource}...`);
  
  try {
    // Download file to check metadata
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const fileHash = calculateHash(buffer);
    const fileSize = buffer.length;
    const lastModified = response.headers.get('last-modified');
    
    // Check existing version
    const existingVersion = await db.execute(
      `SELECT * FROM ${DATA_VERSION_TABLE} WHERE data_source = ? AND year = ?`,
      [dataSource, CURRENT_BASE_YEAR]
    );
    
    if (existingVersion.rows.length > 0) {
      const existing = existingVersion.rows[0];
      
      if (existing.file_hash === fileHash) {
        console.log(`✅ ${dataSource} data is up to date (hash: ${fileHash.slice(0, 8)}...)`);
        return { needsUpdate: false, buffer: null };
      } else {
        console.log(`📄 ${dataSource} data has changed:`);
        console.log(`   Old hash: ${existing.file_hash.slice(0, 8)}...`);
        console.log(`   New hash: ${fileHash.slice(0, 8)}...`);
        console.log(`   Old size: ${existing.file_size} bytes`);
        console.log(`   New size: ${fileSize} bytes`);
      }
    } else {
      console.log(`🆕 No existing ${dataSource} data found`);
    }
    
    return {
      needsUpdate: true,
      buffer,
      metadata: {
        fileHash,
        fileSize,
        lastModified,
        dataSource,
        year: CURRENT_BASE_YEAR
      }
    };
    
  } catch (error) {
    console.error(`❌ Error checking freshness for ${dataSource}:`, error);
    throw error;
  }
}

// Update version tracking
async function updateVersionTracking(metadata, recordCount) {
  await db.execute(`
    INSERT OR REPLACE INTO ${DATA_VERSION_TABLE} 
    (data_source, year, file_hash, file_size, last_modified, last_updated, record_count)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
  `, [
    metadata.dataSource,
    metadata.year,
    metadata.fileHash,
    metadata.fileSize,
    metadata.lastModified,
    recordCount
  ]);
  
  console.log(`📊 Updated version tracking for ${metadata.dataSource}: ${recordCount} records`);
}

async function downloadAndExtractXLSX(url, targetFilename) {
  console.log(`📥 Downloading from ${url}...`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  
  const buffer = Buffer.from(await response.arrayBuffer());
  console.log(`📦 Downloaded ${buffer.length} bytes`);
  
  return new Promise((resolve, reject) => {
    const stream = require('stream').Readable.from(buffer);
    let fileFound = false;
    
    stream
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        if (entry.path === targetFilename) {
          fileFound = true;
          const chunks = [];
          entry.on('data', chunk => chunks.push(chunk));
          entry.on('end', () => resolve(Buffer.concat(chunks)));
        } else {
          entry.autodrain();
        }
      })
      .on('error', reject)
      .on('end', () => {
        if (!fileFound) {
          reject(new Error(`File ${targetFilename} not found in archive`));
        }
      });
  });
}

function parseRegionFromAreaName(areaName) {
  if (!areaName) return { region: 'US', regionName: 'National' };
  
  const stateMatch = areaName.match(/^([^,]+?)(?:\s+\([^)]+\))?\s*$/);
  if (stateMatch) {
    const stateName = stateMatch[1].trim();
    const stateCode = STATE_NAME_TO_CODE[stateName];
    
    if (stateCode) {
      return { region: stateCode, regionName: stateName };
    }
  }
  
  return { region: 'OTHER', regionName: areaName };
}

function determineParentCode(code, occupationType, validCodes) {
  // MAJOR groups (ending in '0000') have a NULL parent.
  // This is the most reliable way to identify them, regardless of 'occupationType'.
  if (code.endsWith('0000') && code !== '00-0000') {
    return null;
  }

  if (occupationType === 'Summary') {
    // For MINOR/BROAD groups, find parent in hierarchy
    const broadCode = code.slice(0, 5) + '00';
    if (validCodes.has(broadCode) && broadCode !== code) {
      return broadCode;
    }
    const minorCode = code.slice(0, 4) + '000';
    if (validCodes.has(minorCode) && minorCode !== code) {
      return minorCode;
    }
    // Fallback to major group, but only if it exists
    const majorCode = code.slice(0, 2) + '-0000';
    // Do not assign 'All Occupations' as a parent
    if (majorCode === '00-0000') {
        return null;
    }
    return validCodes.has(majorCode) ? majorCode : null;
  }
  
  // For LINE_ITEM occupations
  // Try detailed -> broad -> minor -> major hierarchy
  // FIX: Correctly find detailed parent, e.g., 15-1251 -> 15-1250
  const detailedCode = code.slice(0, -1) + '0';
  if (validCodes.has(detailedCode) && detailedCode !== code) {
    return detailedCode;
  }
  
  const broadCode = code.slice(0, 5) + '00';
  if (validCodes.has(broadCode) && broadCode !== code) {
    return broadCode;
  }
  
  const minorCode = code.slice(0, 4) + '000';
  if (validCodes.has(minorCode) && minorCode !== code) {
    return minorCode;
  }
  
  // Fallback to major group, but only if it exists
  const majorCode = code.slice(0, 2) + '-0000';
    // Do not assign 'All Occupations' as a parent
    if (majorCode === '00-0000') {
        return null;
    }
  return validCodes.has(majorCode) ? majorCode : null;
}

async function ensureCategoryColumn() {
  console.log('🔍 Checking if normalized columns exist...');
  
  const columnsToAdd = [
    { name: 'category', type: 'TEXT' },
    { name: 'projected_median_annual_wage', type: 'INTEGER' },
    { name: 'projected_median_annual_wage_year', type: 'INTEGER' }
  ];
  
  for (const column of columnsToAdd) {
    try {
      await db.execute(`ALTER TABLE occupations ADD COLUMN ${column.name} ${column.type}`);
      console.log(`✅ Added ${column.name} column`);
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log(`✅ ${column.name} column already exists`);
      } else {
        throw e;
      }
    }
  }
}

async function createNormalizedSchema() {
  console.log('🏗️  Creating normalized table schema...');
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS occupations_normalized (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      occupation_type TEXT NOT NULL,
      parent_code TEXT,
      category TEXT NOT NULL,
      
      -- Base year data (normalized)
      base_year_employment INTEGER,
      median_annual_wage INTEGER,
      base_year INTEGER DEFAULT ${CURRENT_BASE_YEAR},
      
      -- Projected data (normalized)
      projected_median_annual_wage INTEGER,
      projected_median_annual_wage_year INTEGER DEFAULT ${PROJECTED_WAGE_YEAR},
      
      -- Regional data (JSON)
      regional_employment_data TEXT,
      regional_wage_data TEXT,
      
      -- Metadata
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Normalized schema ready');
}

// Download occupation.xlsx if not present or outdated
async function ensureOccupationXLSX() {
  const occXlsxPath = path.join(__dirname, '../public/data/occupation.xlsx');
  const url = process.env.BLS_OCCUPATION_XLSX_URL;
  if (!url) {
    throw new Error('BLS_OCCUPATION_XLSX_URL is not set in .env.local');
  }
  let needsDownload = false;
  if (!fs.existsSync(occXlsxPath)) {
    needsDownload = true;
  } else {
    // Optionally, add logic to check for updates (e.g., file age or hash)
    // For now, only download if missing
  }
  if (needsDownload) {
    console.log(`📥 Downloading occupation.xlsx from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download occupation.xlsx: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(occXlsxPath), { recursive: true });
    fs.writeFileSync(occXlsxPath, buffer);
    console.log('✅ occupation.xlsx downloaded and saved.');
  } else {
    console.log('✅ occupation.xlsx already exists.');
  }
  return occXlsxPath;
}

// Load Table 1.2 from occupation.xlsx
function loadOccupationTableMapFromXLSX(occXlsxPath) {
  const workbook = xlsx.readFile(occXlsxPath);
  // Print all sheet names for debugging
  console.log('Sheets in occupation.xlsx:', workbook.SheetNames);
  // Find Table 1.2 sheet robustly (case-insensitive, partial match)
  let sheetName = workbook.SheetNames.find(n => /1\.2/i.test(n)) || workbook.SheetNames[0];
  console.log('Using sheet for Table 1.2:', sheetName);
  const worksheet = workbook.Sheets[sheetName];
  const raw = xlsx.utils.sheet_to_json(worksheet);
  console.log('First 5 rows of Table 1.2:', raw.slice(0, 5)); // DEBUG: print first 5 rows
  const codeMap = {};
  for (const row of raw) {
    const code = (row['__EMPTY'] || '').trim();
    if (!code || code === 'Occupation type' || code === '2023 National Employment Matrix code') continue;
    const occupation_type = (row['__EMPTY_1'] || '').trim();
    let category = null;
    if (occupation_type === 'Line item') {
      category = 'OCCUPATION';
    } else if (code.endsWith('0000') && code !== '00-0000' && occupation_type === 'Summary') {
      category = 'MAJOR';
    } else if (code.length === 7 && code[4] !== '0' && code[5] === '0' && occupation_type === 'Summary') {
      category = 'BROAD';
    } else if (
      code.length === 7 &&
      code.slice(-3) === '000' &&
      code[3] !== '0' &&
      occupation_type === 'Summary'
    ) {
      // MINOR: 7 chars, last 3 are '000', 4th from right != '0', Summary
      category = 'MINOR';
    } else if (
      code.length === 7 &&
      code[5] !== '0' &&
      occupation_type === 'Summary'
    ) {
      // DETAILED: 7 chars, 2nd from right != '0', Summary
      category = 'DETAILED';
    } else {
      category = 'OTHER';
    }
    codeMap[code] = { occupation_type, category };
  }
  // Assign parent_code per strict hierarchy logic
  for (const code in codeMap) {
    const { category } = codeMap[code];
    let parent_code = null;
    if (category === 'MAJOR') {
      parent_code = null;
    } else if (category === 'BROAD') {
      const major = code.slice(0,2) + '-0000';
      parent_code = codeMap[major] ? major : null;
    } else if (category === 'MINOR') {
      const broad = code.slice(0,4) + '00';
      if (codeMap[broad] && codeMap[broad].category === 'BROAD') {
        parent_code = broad;
      } else {
        const major = code.slice(0,2) + '-0000';
        parent_code = codeMap[major] ? major : null;
      }
    } else if (category === 'DETAILED') {
      // NEW LOGIC: if DETAILED first 5 chars == BROAD first 5 chars, parent is BROAD, else MINOR
      const broad = Object.keys(codeMap).find(b => codeMap[b].category === 'BROAD' && b.slice(0,5) === code.slice(0,5));
      if (broad) {
        parent_code = broad;
      } else {
        const minor = code.slice(0,4) + '000';
        parent_code = codeMap[minor] && codeMap[minor].category === 'MINOR' ? minor : null;
      }
    } else if (category === 'OCCUPATION') {
      // Updated OCCUPATION parent logic per user request
      // 1. If OCCUPATION first 6 chars = DETAILED first 6 chars, parent is DETAILED
      const detailed = Object.keys(codeMap).find(c => codeMap[c].category === 'DETAILED' && c.slice(0,6) === code.slice(0,6));
      if (detailed) {
        parent_code = detailed;
      } else {
        // 2. If OCCUPATION first 5 chars = MINOR first 5 chars, parent is MINOR
        const minor = Object.keys(codeMap).find(c => codeMap[c].category === 'MINOR' && c.slice(0,5) === code.slice(0,5));
        if (minor) {
          parent_code = minor;
        } else {
          // 3. If OCCUPATION first 5 chars = BROAD first 5 chars, parent is BROAD
          const broad = Object.keys(codeMap).find(c => codeMap[c].category === 'BROAD' && c.slice(0,5) === code.slice(0,5));
          if (broad) {
            parent_code = broad;
          } else {
            // 4. If OCCUPATION first 5 chars = MAJOR first 5 chars, parent is MAJOR
            const major = Object.keys(codeMap).find(c => codeMap[c].category === 'MAJOR' && c.slice(0,5) === code.slice(0,5));
            if (major) {
              parent_code = major;
            } else {
              // 5. Otherwise, parent is null (OTHER)
              parent_code = null;
            }
          }
        }
      }
    }
    codeMap[code].parent_code = parent_code;
  }
  return codeMap;
}

// Utility: Print category counts from occupation.xlsx (Table 1.2)
function printExcelCategoryCounts() {
  const counts = {};
  for (const code in occupationTableMap) {
    const cat = occupationTableMap[code].category;
    if (!cat) continue;
    counts[cat] = (counts[cat] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log('Category counts from occupation.xlsx:', counts);
  console.log('Total codes in occupation.xlsx:', total);
}

// Utility: Print actual columns of the remote occupations table
async function printOccupationsTableColumns() {
  try {
    const result = await db.execute("PRAGMA table_info(occupations)");
    const columns = result.rows.map(row => row.name || row[1]);
    console.log('Remote occupations table columns:', columns);
    return columns;
  } catch (e) {
    console.error('Failed to fetch occupations table columns:', e);
    return [];
  }
}

let occupationTableMap = {}

// Process and normalize BLS OEWS data (State/National workbooks) - Different structure than occupation workbooks
async function processOEWSData(buffer, isNational, sourceYear) {
  // Parse the XLSX buffer
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  // Find the first sheet (BLS OEWS data is usually in the first sheet)
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // IMPORTANT: State/National workbooks have headers on ROW 1 (not row 2 like occupation workbooks)
  const raw = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

  console.log(`📊 Processing ${isNational ? 'National' : 'State'} OEWS data for year ${sourceYear}`);
  console.log(`📄 Using sheet: ${sheetName}, Total rows: ${raw.length}`);

  // Map BLS codes to their row for fast lookup
  const colNames = Object.keys(raw[0] || {});
  console.log(`📋 Available columns: ${colNames.slice(0, 10).join(', ')}...`);
  
  const codeCol = colNames.find(c => /OCC_CODE/i.test(c));
  const nameCol = colNames.find(c => /OCC_TITLE/i.test(c));
  const empCol = colNames.find(c => /TOT_EMP/i.test(c));
  const wageCol = colNames.find(c => /A_MEDIAN/i.test(c));
  const areaCol = colNames.find(c => /AREA_TITLE/i.test(c)); // State/region information
  const areaCodeCol = colNames.find(c => /AREA_TYPE/i.test(c)) || colNames.find(c => /ST/i.test(c));

  console.log(`🔍 Key columns found: OCC_CODE=${codeCol}, OCC_TITLE=${nameCol}, TOT_EMP=${empCol}, A_MEDIAN=${wageCol}, AREA=${areaCol}`);

  const normalized = [];
  
  for (const row of raw) {
    const code = (row[codeCol] || '').trim();
    if (!code || code === 'OCC_CODE') continue;
    
    const name = (row[nameCol] || '').trim();
    const areaName = row[areaCol] || '';
    const employment = row[empCol] ? parseInt(row[empCol].toString().replace(/[^\d]/g, '')) || null : null;
    const wage = row[wageCol] ? parseInt(row[wageCol].toString().replace(/[^\d]/g, '')) || null : null;
    
    // Parse region from area name
    const { region, regionName } = parseRegionFromAreaName(areaName);
    
    // Get occupation info from Table 1.2 if available
    const occInfo = occupationTableMap[code] || {};
    const occupation_type = occInfo.occupation_type || '';
    const category = occInfo.category || 'OTHER';
    const parent_code = occInfo.parent_code || null;

    // Create normalized record for OEWS data
    // OEWS data is current year actual data (no projections)
    const normalizedRecord = {
      code,
      name,
      occupation_type,
      parent_code,
      category,
      data_year: sourceYear, // Year extracted from filename
      data_type: 'actual', // OEWS data is always actual, not projected
      region_code: region,
      region_name: regionName,
      employment,
      median_annual_wage: wage,
      source_workbook: isNational ? 'national_oews' : 'state_oews',
      workbook_year: sourceYear,
      refresh_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    normalized.push(normalizedRecord);
  }

  console.log(`✅ Normalized ${normalized.length} OEWS records for ${isNational ? 'National' : 'State'} data`);
  return normalized;
}

// Utility: Print parent_code relationships for a sample of each category
function printParentCodeSamples(samplePerCategory = 5) {
  const byCategory = {};
  for (const code in occupationTableMap) {
    const cat = occupationTableMap[code].category;
    if (!cat) continue;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(code);
  }
  const categories = ['MAJOR', 'BROAD', 'MINOR', 'DETAILED', 'OCCUPATION'];
  for (const cat of categories) {
    const codes = byCategory[cat] || [];
    console.log(`\nCategory: ${cat} (showing up to ${samplePerCategory})`);
    for (const code of codes.slice(0, samplePerCategory)) {
      const info = occupationTableMap[code];
      const parent_code = info.parent_code;
      let parentCat = null, parentName = null;
      if (parent_code && occupationTableMap[parent_code]) {
        parentCat = occupationTableMap[parent_code].category;
        parentName = occupationTableMap[parent_code].name || '';
      }
      console.log({
        code,
        category: info.category,
        parent_code,
        parent_category: parentCat,
        parent_name: parentName
      });
    }
  }
}

// Utility: Print parent_code relationships for a sample of each category from the remote database
async function printRemoteParentCodeSamples(samplePerCategory = 5) {
  const categories = ['MAJOR', 'BROAD', 'MINOR', 'DETAILED', 'OCCUPATION'];
  for (const cat of categories) {
    const result = await db.execute(
      `SELECT code, name, parent_code, category FROM occupations WHERE category = ? LIMIT ?`,
      [cat, samplePerCategory]
    );
    console.log(`\nRemote DB Category: ${cat} (showing up to ${samplePerCategory})`);
    for (const row of result.rows) {
      let parentInfo = null;
      if (row.parent_code) {
        const parentRes = await db.execute(
          `SELECT code, name, category FROM occupations WHERE code = ? LIMIT 1`,
          [row.parent_code]
        );
        if (parentRes.rows.length > 0) {
          parentInfo = parentRes.rows[0];
        }
      }
      console.log({
        code: row.code,
        name: row.name,
        category: row.category,
        parent_code: row.parent_code,
        parent_category: parentInfo ? parentInfo.category : null,
        parent_name: parentInfo ? parentInfo.name : null
      });
    }
  }
}

// BLS Table Processing Configuration - Using Index Descriptions
const BLS_TABLES_CONFIG = {
  '1.1': { 
    name: 'employment_by_major_occupational_group',
    description: 'Employment by major occupational group, 2023 and projected 2033',
    skipTable: false
  },
  '1.2': { 
    name: 'occupational_projections_2023_33',
    description: 'Occupational projections, 2023–33, and worker characteristics, 2023',
    skipTable: false
  },
  '1.3': { 
    name: 'fastest_growing_occupations',
    description: 'Fastest growing occupations, 2023 and projected 2033',
    skipTable: false
  },
  '1.4': { 
    name: 'occupations_most_job_growth',
    description: 'Occupations with the most job growth, 2023 and projected 2033',
    skipTable: false
  },
  '1.5': { 
    name: 'fastest_declining_occupations',
    description: 'Fastest declining occupations, 2023 and projected 2033',
    skipTable: false
  },
  '1.6': { 
    name: 'occupations_largest_job_declines',
    description: 'Occupations with the largest job declines, 2023 and projected 2033',
    skipTable: false
  },
  '1.7': { 
    name: 'occupational_projections_legacy',
    description: 'Content moved to Table 1.2 (Legacy)',
    skipTable: true // Skip - content moved to 1.2
  },
  '1.8': { 
    name: 'industry_occupation_matrix_by_occupation',
    description: '2023–33 Industry-occupation matrix data, by occupation',
    skipTable: false
  },
  '1.9': { 
    name: 'industry_occupation_matrix_by_industry',
    description: '2023–33 Industry-occupation matrix data, by industry',
    skipTable: false
  },
  '1.10': { 
    name: 'occupational_separations_and_openings',
    description: 'Occupational separations and openings, projected 2023–33',
    skipTable: false
  },
  '1.11': { 
    name: 'employment_in_stem_occupations',
    description: 'Employment in STEM occupations, 2023 and projected 2033',
    skipTable: true // Skip per user request
  },
  '1.12': { 
    name: 'factors_affecting_occupational_utilization',
    description: 'Factors affecting occupational utilization, projected 2023–33',
    skipTable: false
  }
};

// Helper function to identify year-based columns and normalize them
function identifyYearColumns(headers) {
  const yearColumns = [];
  const normalColumns = [];
  const yearPattern = /(\d{4})/g;
  
  for (const header of headers) {
    if (!header) continue;
    
    const yearMatches = header.match(yearPattern);
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
      
      // This is a year-based data column
      const year = parseInt(yearMatches[0]);
      
      // Extract base column name more intelligently
      let baseColumnName = header;
      
      // Handle different patterns:
      // "Employment, 2023" → "Employment"
      // "Median annual wage, dollars, 2023[1]" → "Median annual wage"
      // "Employment change, numeric, 2023–33" → "Employment change numeric"
      
      // Remove year and everything after it
      baseColumnName = baseColumnName.replace(/[,\s]*\d{4}.*$/, '').trim();
      
      // Clean up common suffixes
      baseColumnName = baseColumnName.replace(/[,\s]*dollars?\s*$/, '').trim();
      baseColumnName = baseColumnName.replace(/[,\s]*\$?\s*$/, '').trim();
      
      // If we end up with empty name, use a generic one
      if (!baseColumnName) {
        baseColumnName = 'value';
      }
      
      // Determine if it's base (past) or future year
      const isBaseYear = year <= CURRENT_BASE_YEAR;
      const isFutureYear = year > CURRENT_BASE_YEAR;
      
      yearColumns.push({
        originalHeader: header,
        baseColumnName,
        year,
        isBaseYear,
        isFutureYear,
        columnType: isBaseYear ? 'base' : (isFutureYear ? 'future' : 'other')
      });
    } else {
      normalColumns.push(header);
    }
  }
  
  return { yearColumns, normalColumns };
}

// Process a single BLS table with year-based column normalization
// ARCHITECTURE DECISION: Single Long Table Approach
// - All text fields (titles, codes, education, etc.) are included in each metric row
// - This avoids the need for JOINs and keeps each row self-contained and meaningful  
// - Each occupation generates multiple rows (one per metric/year combination)
// - Text fields are repeated but this provides better query performance and simplicity
async function processBLSTable(workbook, tableNumber, config) {
  console.log(`\n📊 Processing BLS Table ${tableNumber}: ${config.description}`);
  
  if (config.skipTable) {
    console.log(`⏭️  Skipping Table ${tableNumber} per configuration`);
    return null;
  }
  
  // Find the sheet for this table
  const sheetName = workbook.SheetNames.find(name => 
    name.includes(`${tableNumber}`) || name.includes(tableNumber.replace('.', '_'))
  );
  
  if (!sheetName) {
    console.log(`❌ Sheet for Table ${tableNumber} not found`);
    return null;
  }
  
  console.log(`📄 Using sheet: ${sheetName}`);
  const worksheet = workbook.Sheets[sheetName];
  
  // Get raw data starting from row 2 (headers on row 2)
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  range.s.r = 1; // Start from row 2 (0-indexed)
  
  const data = xlsx.utils.sheet_to_json(worksheet, { 
    range: range,
    header: 1,
    defval: null
  });
  
  if (!data || data.length === 0) {
    console.log(`⚠️  No data found in Table ${tableNumber}`);
    return null;
  }
  
  // Get headers (first row of data)
  const headers = data[0];
  const rows = data.slice(1);
  
  console.log(`📋 Headers: ${headers.slice(0, 5).join(', ')}...`);
  console.log(`📊 Data rows: ${rows.length}`);
  
  // Identify year-based columns
  const { yearColumns, normalColumns } = identifyYearColumns(headers);
  
  console.log(`📅 Year-based columns found: ${yearColumns.length}`);
  console.log(`📝 Normal columns: ${normalColumns.length}`);
  
  if (yearColumns.length > 0) {
    console.log('Year columns details:');
    yearColumns.forEach(col => {
      console.log(`  - ${col.originalHeader} → ${col.baseColumnName} (${col.year}, ${col.columnType})`);
    });
  }
  
  // Normalize the data - CREATE MULTIPLE ROWS PER OCCUPATION (ONE PER METRIC/YEAR)
  const normalizedRows = [];
  
  for (const row of rows) {
    // Skip empty rows
    if (!row || Object.values(row).every(val => !val)) continue;
    
    const baseRecord = {};
    
    // Add ALL normal columns (these will be repeated for each metric row)
    // This includes text fields like Title, Factors, Industry descriptions, etc.
    normalColumns.forEach((header, index) => {
      if (header && row[index] !== undefined) {
        // Clean up column name for database storage
        const cleanColumnName = header.trim()
          .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars except spaces
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .toLowerCase();
        
        baseRecord[cleanColumnName] = row[index];
      }
    });
    
    // Process year-based columns - CREATE ONE ROW PER YEAR COLUMN
    if (yearColumns.length > 0) {
      yearColumns.forEach(col => {
        const headerIndex = headers.indexOf(col.originalHeader);
        if (headerIndex >= 0 && row[headerIndex] !== null && row[headerIndex] !== undefined) {
          // Determine data type: actual vs forecasted
          const dataType = col.isBaseYear ? 'actual' : 
                          col.isFutureYear ? 'forecasted' : 'other';
          
          // Create a normalized record for this metric/year combination
          const normalizedRecord = {
            ...baseRecord, // This now includes ALL text columns like titles, factors, etc.
            metric_name: col.baseColumnName,
            metric_value: row[headerIndex],
            metric_year: col.year,
            data_type: dataType,
            table_number: tableNumber,
            table_name: config.name,
            table_description: config.description,
            source_workbook: 'occupation',
            workbook_year: CURRENT_BASE_YEAR,
            refresh_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          normalizedRows.push(normalizedRecord);
        }
      });
    } else {
      // No year columns, just add the base record with metadata
      // This preserves tables that might only have descriptive text data
      const normalizedRecord = {
        ...baseRecord, // This includes ALL the text columns
        metric_name: null,
        metric_value: null,
        metric_year: null,
        data_type: null,
        table_number: tableNumber,
        table_name: config.name,
        table_description: config.description,
        source_workbook: 'occupation',
        workbook_year: CURRENT_BASE_YEAR,
        refresh_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      normalizedRows.push(normalizedRecord);
    }
  }
  
  console.log(`✅ Normalized ${normalizedRows.length} records for Table ${tableNumber}`);
  return {
    tableNumber,
    tableName: config.name,
    description: config.description,
    originalRows: rows.length,
    normalizedRows: normalizedRows.length,
    data: normalizedRows
  };
}

// Create database tables for BLS data with normalized schema
// Create table for normalized BLS data - Single table approach with all text fields included
async function createBLSTable(tableName, sampleRecord) {
  console.log(`📋 Creating normalized table: bls_${tableName}`);
  
  // Drop and recreate for clean slate
  await db.execute(`DROP TABLE IF EXISTS bls_${tableName}`);
  
  // Base columns that all tables will have (using SQLite syntax for Turso)
  let createTableSQL = `
    CREATE TABLE bls_${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Identification & Metadata
      table_number TEXT,
      table_name TEXT,
      table_description TEXT,
      
      -- Normalized Metric Data
      metric_name TEXT,
      metric_value REAL, 
      metric_year INTEGER,
      data_type TEXT, -- 'actual', 'forecasted', 'other'
      
      -- System Fields
      source_workbook TEXT,
      workbook_year INTEGER,
      refresh_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP`;
  
  // Dynamically add columns for all the text fields found in the sample record
  // These are the contextual fields like titles, codes, education requirements, etc.
  // Each metric row will include these for complete context without requiring JOINs
  if (sampleRecord) {
    const metricFields = ['metric_name', 'metric_value', 'metric_year', 'data_type', 
                         'table_number', 'table_name', 'table_description',
                         'source_workbook', 'workbook_year', 'refresh_date', 
                         'created_at', 'updated_at'];
    
    for (const [key, value] of Object.entries(sampleRecord)) {
      if (!metricFields.includes(key)) {
        // This is a text/contextual field from the original BLS data
        // Use TEXT for all fields in SQLite (Turso doesn't need length limits)
        const columnType = 'TEXT';
        
        // Wrap column name in double quotes to handle special characters and reserved words
        createTableSQL += `,\n      "${key}" ${columnType}`;
      }
    }
  }
  
  // Close the CREATE TABLE statement
  createTableSQL += `
    )`;
  
  await db.execute(createTableSQL);
  
  // Add indexes separately for better performance
  const codeColumn = sampleRecord && Object.keys(sampleRecord).find(k => k.includes('code')) || 'table_number';
  try {
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_${tableName}_code_metric_year ON bls_${tableName} ("${codeColumn}", metric_name, metric_year)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_${tableName}_table_metric ON bls_${tableName} (table_number, metric_name)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_${tableName}_data_type_year ON bls_${tableName} (data_type, metric_year)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_${tableName}_metric_year ON bls_${tableName} (metric_name, metric_year)`);
  } catch (indexError) {
    console.log(`⚠️  Index creation warning (non-critical): ${indexError.message}`);
  }
  
  console.log(`✅ Created normalized table: bls_${tableName} with text fields included`);
}

// Create database tables for BLS OEWS data (State/National) with regional schema
async function createOEWSTable(tableName, sampleRecord, isNational) {
  console.log(`📋 Creating OEWS table: bls_${tableName}`);
  
  // Drop and recreate for clean slate
  await db.execute(`DROP TABLE IF EXISTS bls_${tableName}`);
  
  // OEWS tables have a different structure than occupation projection tables
  let createTableSQL = `
    CREATE TABLE bls_${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Occupation Identification
      code TEXT,
      name TEXT,
      occupation_type TEXT,
      parent_code TEXT,
      category TEXT,
      
      -- Regional Information (key difference from occupation tables)
      region_code TEXT,
      region_name TEXT,
      
      -- Data with Year Information
      data_year INTEGER,
      data_type TEXT, -- Always 'actual' for OEWS data
      employment INTEGER,
      median_annual_wage INTEGER,
      
      -- System Fields
      source_workbook TEXT,
      workbook_year INTEGER,
      refresh_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP`;
  
  // Dynamically add any additional columns from the sample record
  if (sampleRecord) {
    const standardFields = [
      'id', 'code', 'name', 'occupation_type', 'parent_code', 'category',
      'region_code', 'region_name', 'data_year', 'data_type', 'employment', 'median_annual_wage',
      'source_workbook', 'workbook_year', 'refresh_date', 'created_at', 'updated_at'
    ];
    
    for (const [key, value] of Object.entries(sampleRecord)) {
      if (!standardFields.includes(key)) {
        createTableSQL += `,\n      ${key} TEXT`;
      }
    }
  }
  
  // Close the CREATE TABLE statement
  createTableSQL += `
    )`;
  
  await db.execute(createTableSQL);
  
  // Add indexes for common query patterns
  try {
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_${tableName}_code_region ON bls_${tableName} (code, region_code)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_${tableName}_region_year ON bls_${tableName} (region_code, data_year)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_${tableName}_code_year ON bls_${tableName} (code, data_year)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_${tableName}_category_region ON bls_${tableName} (category, region_code)`);
  } catch (indexError) {
    console.log(`⚠️  Index creation warning (non-critical): ${indexError.message}`);
  }
  
  console.log(`✅ Created OEWS table: bls_${tableName} with regional schema`);
}

// Extract year from OEWS workbook filename
function extractYearFromOEWSFilename(filename) {
  // Examples: "state_M2023_dl.xlsx", "national_M2023_dl.xlsx"
  const yearMatch = filename.match(/M(\d{4})/);
  return yearMatch ? parseInt(yearMatch[1]) : CURRENT_BASE_YEAR;
}

// Process all BLS tables from the occupation workbook
async function processAllBLSTables(occXlsxPath) {
  console.log('\n🔄 Processing All BLS Tables from Occupation Workbook');
  console.log('=====================================================');
  
  const workbook = xlsx.readFile(occXlsxPath);
  console.log('Available sheets:', workbook.SheetNames);
  
  const processedTables = [];
  
  for (const [tableNumber, config] of Object.entries(BLS_TABLES_CONFIG)) {
    try {
      const result = await processBLSTable(workbook, tableNumber, config);
      
      if (result && result.data.length > 0) {
        // Create table if it doesn't exist
        await createBLSTable(config.name, result.data[0]);
        
        // Clear existing data for this table
        await db.execute(`DELETE FROM bls_${config.name} WHERE table_number = ?`, [tableNumber]);
        
        // Insert normalized data
        let insertCount = 0;
        for (const record of result.data) {
          const columns = Object.keys(record).filter(key => record[key] !== null && record[key] !== undefined);
          const values = columns.map(key => record[key]);
          const placeholders = columns.map(() => '?').join(',');
          
          // Wrap column names in double quotes to handle special characters
          const quotedColumns = columns.map(col => `"${col}"`);
          const insertSQL = `INSERT INTO bls_${config.name} (${quotedColumns.join(',')}) VALUES (${placeholders})`;
          
          try {
            await db.execute(insertSQL, values);
            insertCount++;
          } catch (insertError) {
            console.error(`❌ Error inserting record for Table ${tableNumber}:`, insertError.message);
          }
        }
        
        console.log(`✅ Inserted ${insertCount} records into bls_${config.name}`);
        processedTables.push({
          tableNumber,
          tableName: config.name, 
          recordsProcessed: insertCount
        });
      }
      
    } catch (error) {
      console.error(`❌ Error processing Table ${tableNumber}:`, error.message);
    }
  }
  
  return processedTables;
}

// Entry point for running as a script
if (require.main === module) {
  (async () => {
    try {
      await ensureVersionTable();
      await createNormalizedSchema();
      await printOccupationsTableColumns();
      const occXlsxPath = await ensureOccupationXLSX();
      occupationTableMap = loadOccupationTableMapFromXLSX(occXlsxPath);
      
      // NEW: Process all BLS tables from occupation workbook
      console.log('\n🚀 Starting BLS Table Processing...');
      const blsResults = await processAllBLSTables(occXlsxPath);
      console.log('\n📊 BLS Table Processing Summary:');
      blsResults.forEach(result => {
        console.log(`  ✅ Table ${result.tableNumber} (${result.tableName}): ${result.recordsProcessed} records`);
      });
      
      // NEW: Process OEWS data (National and State) with regional information
      console.log('\n🌎 Starting OEWS Regional Data Processing...');
      
      // Process National OEWS data
      const natOEWSResult = await checkDataFreshness(BLS_OEWS_NAT_ZIP_URL, 'NATIONAL');
      if (natOEWSResult.needsUpdate) {
        const natBuffer = await downloadAndExtractXLSX(BLS_OEWS_NAT_ZIP_URL, XLSX_NAT_FILENAME);
        const natYear = extractYearFromOEWSFilename(XLSX_NAT_FILENAME);
        const natNormalized = await processOEWSData(natBuffer, true, natYear);
        
        // Create and populate national OEWS table
        if (natNormalized.length > 0) {
          await createOEWSTable('national_oews', natNormalized[0], true);
          
          // Clear existing data
          await db.execute(`DELETE FROM bls_national_oews WHERE data_year = ?`, [natYear]);
          
          // Insert normalized data
          let natInsertCount = 0;
          for (const record of natNormalized) {
            const columns = Object.keys(record).filter(key => record[key] !== null && record[key] !== undefined);
            const values = columns.map(key => record[key]);
            const placeholders = columns.map(() => '?').join(',');
            
            // Wrap column names in double quotes to handle special characters
            const quotedColumns = columns.map(col => `"${col}"`);
            const insertSQL = `INSERT INTO bls_national_oews (${quotedColumns.join(',')}) VALUES (${placeholders})`;
            
            try {
              await db.execute(insertSQL, values);
              natInsertCount++;
            } catch (insertError) {
              console.error(`❌ Error inserting national OEWS record:`, insertError.message);
            }
          }
          
          console.log(`✅ Inserted ${natInsertCount} national OEWS records for year ${natYear}`);
          await updateVersionTracking(natOEWSResult.metadata, natInsertCount);
        }
      } else {
        console.log('National OEWS data is up to date.');
      }
      
      // Process State OEWS data
      const stateOEWSResult = await checkDataFreshness(BLS_OEWS_STATE_ZIP_URL, 'STATE');
      if (stateOEWSResult.needsUpdate) {
        const stateBuffer = await downloadAndExtractXLSX(BLS_OEWS_STATE_ZIP_URL, XLSX_STATE_FILENAME);
        const stateYear = extractYearFromOEWSFilename(XLSX_STATE_FILENAME);
        const stateNormalized = await processOEWSData(stateBuffer, false, stateYear);
        
        // Create and populate state OEWS table
        if (stateNormalized.length > 0) {
          await createOEWSTable('state_oews', stateNormalized[0], false);
          
          // Clear existing data
          await db.execute(`DELETE FROM bls_state_oews WHERE data_year = ?`, [stateYear]);
          
          // Insert normalized data
          let stateInsertCount = 0;
          for (const record of stateNormalized) {
            const columns = Object.keys(record).filter(key => record[key] !== null && record[key] !== undefined);
            const values = columns.map(key => record[key]);
            const placeholders = columns.map(() => '?').join(',');
            
            const insertSQL = `INSERT INTO bls_state_oews (${columns.join(',')}) VALUES (${placeholders})`;
            
            try {
              await db.execute(insertSQL, values);
              stateInsertCount++;
            } catch (insertError) {
              console.error(`❌ Error inserting state OEWS record:`, insertError.message);
            }
          }
          
          console.log(`✅ Inserted ${stateInsertCount} state OEWS records for year ${stateYear}`);
          await updateVersionTracking(stateOEWSResult.metadata, stateInsertCount);
        }
      } else {
        console.log('State OEWS data is up to date.');
      }
      
      printExcelCategoryCounts(); // Print Excel category counts before BLS processing
      if (typeof printParentCodeSamples === 'function') {
        printParentCodeSamples(); // Print parent_code relationships for verification (in-memory)
      } else {
        console.warn('printParentCodeSamples utility not found.');
      }
      // Print parent_code relationships from remote DB
      await printRemoteParentCodeSamples();
      // Example: Download and process national data
      const natResult = await checkDataFreshness(BLS_OEWS_NAT_ZIP_URL, 'NATIONAL');
      if (natResult.needsUpdate) {
        const natBuffer = await downloadAndExtractXLSX(BLS_OEWS_NAT_ZIP_URL, XLSX_NAT_FILENAME);
        const normalized = await processOccupationData(natBuffer, true);
        // Count by category
        const categoryCounts = normalized.reduce((acc, rec) => {
          acc[rec.category] = (acc[rec.category] || 0) + 1;
          return acc;
        }, {});
        console.log('Category counts:', categoryCounts);
        console.log('Sample normalized record:', normalized[0]);
        // --- DB update logic ---
        // 2. Upsert occupations
        // Only use columns that exist in the remote occupations table
        for (const rec of normalized) {
          await db.execute(
            `INSERT OR REPLACE INTO occupations (code, name, occupation_type, parent_code, category, base_year_employment, median_annual_wage, base_year, projected_median_annual_wage, projected_median_annual_wage_year, regional_employment_data, regional_wage_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              rec.code,
              rec.name,
              rec.occupation_type,
              rec.parent_code,
              rec.category,
              rec.base_year_employment,
              rec.median_annual_wage,
              rec.base_year,
              rec.projected_median_annual_wage,
              rec.projected_median_annual_wage_year,
              rec.regional_employment_data,
              rec.regional_wage_data
            ]
          );
        }
        console.log(`✅ Updated occupations table with ${normalized.length} occupations.`);
      } else {
        console.log('National data is up to date.');
      }
    } catch (err) {
      console.error('❌ Error in automation script:', err);
      process.exit(1);
    }
  })();
}
