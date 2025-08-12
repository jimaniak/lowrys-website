// Updated Sunday Night BLS Automation Script
// This script updates the EXISTING normalized database structure
// Runs every Sunday at midnight to refresh BLS data

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const unzipper = require('unzipper');
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
const CURRENT_WAGE_YEAR = 2023;
const PROJECTED_WAGE_YEAR = 2034;

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

// Category classification functions using your CORRECT requirements
function isMajor(code, occupation_type) {
  return occupation_type === 'Summary' && 
         code.length === 7 &&
         code.slice(-4) === '0000' &&        // Last 4 chars = '0000'
         code.slice(0, 2) !== '00';           // First 2 chars ≠ '00'
}

function isMinor(code, occupation_type) {
  return occupation_type === 'Summary' && 
         code.length === 7 &&
         code.slice(-4, -3) !== '0' &&       // 4th from right ≠ '0'
         code.slice(-3) === '000';            // Last 3 chars = '000'
}

function isBroad(code, occupation_type) {
  return occupation_type === 'Summary' && 
         code.length === 7 &&
         code.slice(-2, -1) === '0' &&       // 2nd from right = '0'
         code.slice(-3, -2) !== '0';          // 3rd from right ≠ '0'
}

function isDetailed(code, occupation_type) {
  return occupation_type === 'Summary' && 
         code.length === 7 &&
         code.slice(-2, -1) !== '0';          // 2nd from right ≠ '0'
}

function isTop(code) {
  return code === '00-0000';
}

function getCategory(code, occupation_type) {
  if (isTop(code)) return 'TOP';
  if (isMajor(code, occupation_type)) return 'MAJOR';
  if (isMinor(code, occupation_type)) return 'MINOR';
  if (isBroad(code, occupation_type)) return 'BROAD';
  if (isDetailed(code, occupation_type)) return 'DETAILED';
  return 'LINE_ITEM'; // For actual occupations (not Summary categories)
}

function determineParentCode(code, occupation_type, codeToRow) {
  if (isTop(code)) return null;
  if (isMajor(code, occupation_type)) return '00-0000';
  
  if (isMinor(code, occupation_type) || isBroad(code, occupation_type)) {
    // Parent is the major group
    return code.slice(0, 2) + '-0000';
  }
  
  if (isDetailed(code, occupation_type)) {
    // Try to find matching Broad code first, then Minor
    const broadCode = code.slice(0, 5) + '00';
    if (codeToRow[broadCode]) {
      return broadCode;
    }
    const minorCode = code.slice(0, 4) + '000';
    if (codeToRow[minorCode]) {
      return minorCode;
    }
    // Fallback to major group
    return code.slice(0, 2) + '-0000';
  }
  
  // For LINE_ITEM occupations
  // Try detailed -> broad -> minor -> major hierarchy
  const detailedCode = code.slice(0, 6);
  if (codeToRow[detailedCode]) return detailedCode;
  
  const broadCode = code.slice(0, 5) + '00';
  if (codeToRow[broadCode]) return broadCode;
  
  const minorCode = code.slice(0, 4) + '000';
  if (codeToRow[minorCode]) return minorCode;
  
  // Fallback to major group
  return code.slice(0, 2) + '-0000';
}

async function ensureCategoryColumn() {
  console.log('🔍 Checking if category column exists...');
  
  try {
    // Add category column if it doesn't exist
    await db.execute(`ALTER TABLE occupations ADD COLUMN category TEXT`);
    console.log('✅ Added category column');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('✅ Category column already exists');
    } else {
      throw e;
    }
  }
  
  // Add projected wage columns if they don't exist
  try {
    await db.execute(`ALTER TABLE occupations ADD COLUMN projected_median_annual_wage INTEGER`);
    console.log('✅ Added projected_median_annual_wage column');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('✅ projected_median_annual_wage column already exists');
    } else {
      throw e;
    }
  }
  
  try {
    await db.execute(`ALTER TABLE occupations ADD COLUMN projected_median_annual_wage_year INTEGER`);
    console.log('✅ Added projected_median_annual_wage_year column');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('✅ projected_median_annual_wage_year column already exists');
    } else {
      throw e;
    }
  }
}

async function downloadAndExtractXLSX(url, filename) {
  console.log('📥 Downloading BLS OEWS ZIP:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download BLS OEWS ZIP: ' + res.status);
  const buffer = Buffer.from(await res.arrayBuffer());
  
  const directory = await unzipper.Open.buffer(buffer);
  console.log('📁 Files in ZIP:', directory.files.map(f => f.path));
  
  const file = directory.files.find(f => f.path === filename);
  if (!file) throw new Error('XLSX file not found in ZIP: ' + filename);
  
  const xlsxBuffer = await file.buffer();
  return xlsxBuffer;
}

function parseRegionFromAreaName(areaName) {
  if (!areaName || areaName === 'U.S.') return { region: 'US', regionName: 'United States' };
  
  const stateName = areaName.includes(',') ? areaName.split(',')[1].trim() : areaName;
  const stateCode = STATE_NAME_TO_CODE[stateName] || stateName;
  
  return {
    region: stateCode,
    regionName: areaName
  };
}

async function processOccupationData(xlsxBuffer, isNational = true) {
  console.log(`📊 Processing ${isNational ? 'national' : 'state'} occupation data...`);
  
  const workbook = xlsx.read(xlsxBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = xlsx.utils.sheet_to_json(worksheet);
  
  const processedOccupations = new Map();
  const codeToRow = {};
  
  // First pass: collect all codes for parent relationship determination
  for (const row of rawData) {
    const code = row['OCC_CODE']?.toString().trim();
    if (code) {
      codeToRow[code] = row;
    }
  }
  
  // Second pass: process and classify
  for (const row of rawData) {
    const code = row['OCC_CODE']?.toString().trim();
    const title = row['OCC_TITLE']?.toString().trim();
    const employmentLevel = parseInt(row['TOT_EMP']) || null;
    const medianWage = parseInt(row['A_MEDIAN']) || null;
    
    if (!code || !title) continue;
    
    const occupationType = (employmentLevel && medianWage) ? 'Line item' : 'Summary';
    const category = getCategory(code, occupationType);
    const parentCode = determineParentCode(code, occupationType, codeToRow);
    
    if (!processedOccupations.has(code)) {
      processedOccupations.set(code, {
        code,
        name: title,
        occupation_type: occupationType,
        parent_code: parentCode,
        category,
        base_year_employment: isNational ? employmentLevel : null,
        median_annual_wage: isNational ? medianWage : null,
        regions: new Map()
      });
    }
    
    // Add regional data
    const { region, regionName } = parseRegionFromAreaName(row['AREA_TITLE']);
    if (!isNational && region !== 'US') {
      const occupation = processedOccupations.get(code);
      occupation.regions.set(region, {
        employment: employmentLevel,
        wage: medianWage,
        regionName
      });
    }
  }
  
  return processedOccupations;
}

async function insertNormalizedData(occupations) {
  console.log(`💾 Inserting ${occupations.size} occupations into normalized table...`);
  
  let inserted = 0;
  for (const occupation of occupations.values()) {
    try {
      await db.execute({
        sql: `
          INSERT OR REPLACE INTO occupations_normalized (
            code, name, occupation_type, parent_code, category,
            base_year, projection_year, base_year_employment, 
            median_annual_wage, median_annual_wage_year,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          occupation.code,
          occupation.name,
          occupation.occupation_type,
          occupation.parent_code,
          occupation.category,
          CURRENT_BASE_YEAR,
          CURRENT_PROJECTION_YEAR,
          occupation.base_year_employment,
          occupation.median_annual_wage,
          CURRENT_WAGE_YEAR
        ]
      });
      
      inserted++;
      if (inserted % 100 === 0) {
        console.log(`  Inserted ${inserted}/${occupations.size} occupations...`);
      }
    } catch (error) {
      console.error(`❌ Failed to insert ${occupation.code}:`, error);
    }
  }
  
  console.log(`✅ Successfully inserted ${inserted} occupations`);
}

async function swapToProductionTable() {
  console.log('🔄 Swapping normalized table to production...');
  
  try {
    // Backup current table
    await db.execute('DROP TABLE IF EXISTS occupations_backup');
    await db.execute('CREATE TABLE occupations_backup AS SELECT * FROM occupations');
    
    // Replace production table
    await db.execute('DROP TABLE occupations');
    await db.execute('ALTER TABLE occupations_normalized RENAME TO occupations');
    
    console.log('✅ Production table updated successfully');
    
    // Clean up backup after successful deployment
    await db.execute('DROP TABLE occupations_backup');
    
  } catch (error) {
    console.error('❌ Table swap failed:', error);
    
    // Restore from backup if swap failed
    try {
      await db.execute('DROP TABLE IF EXISTS occupations');
      await db.execute('ALTER TABLE occupations_backup RENAME TO occupations');
      console.log('⚠️  Restored from backup due to swap failure');
    } catch (restoreError) {
      console.error('💥 CRITICAL: Failed to restore backup:', restoreError);
    }
    
    throw error;
  }
}

async function validateData() {
  console.log('🔍 Validating normalized data...');
  
  const stats = await db.execute(`
    SELECT 
      category,
      COUNT(*) as count,
      COUNT(CASE WHEN parent_code IS NOT NULL THEN 1 END) as with_parent
    FROM occupations_normalized 
    GROUP BY category 
    ORDER BY count DESC
  `);
  
  console.log('📊 Category distribution:');
  stats.rows.forEach(row => {
    console.log(`  ${row.category}: ${row.count} total, ${row.with_parent} with parent`);
  });
  
  const totalCount = await db.execute('SELECT COUNT(*) as count FROM occupations_normalized');
  console.log(`\n✅ Total occupations: ${totalCount.rows[0].count}`);
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 Starting Sunday Night BLS Data Update...\n');
  console.log(`📅 Base Year: ${CURRENT_BASE_YEAR}`);
  console.log(`📅 Projection Year: ${CURRENT_PROJECTION_YEAR}`);
  console.log(`💰 Wage Year: ${CURRENT_WAGE_YEAR}\n`);
  
  try {
    // Step 1: Create normalized schema
    await createNormalizedSchema();
    
    // Step 2: Download and process national data
    const nationalBuffer = await downloadAndExtractXLSX(BLS_OEWS_NAT_ZIP_URL, XLSX_NAT_FILENAME);
    const nationalOccupations = await processOccupationData(nationalBuffer, true);
    
    // Step 3: Download and process state data
    const stateBuffer = await downloadAndExtractXLSX(BLS_OEWS_STATE_ZIP_URL, XLSX_STATE_FILENAME);
    const stateOccupations = await processOccupationData(stateBuffer, false);
    
    // Step 4: Merge national and state data
    console.log('🔗 Merging national and state data...');
    for (const [code, stateOcc] of stateOccupations) {
      if (nationalOccupations.has(code)) {
        const nationalOcc = nationalOccupations.get(code);
        nationalOcc.regions = stateOcc.regions;
      }
    }
    
    // Step 5: Insert normalized data
    await insertNormalizedData(nationalOccupations);
    
    // Step 6: Validate data
    await validateData();
    
    // Step 7: Swap to production
    await swapToProductionTable();
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n🎉 Sunday night update completed successfully in ${duration} seconds!`);
    console.log('📊 Database now contains clean, normalized BLS data ready for Rate Calculator queries.');
    
  } catch (error) {
    console.error('💥 Sunday night update failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
