// Enhanced BLS automation script with direct Turso database updates
// This extends the existing update-bls-benchmarks.js to write directly to Turso
// Run with: node scripts/update-bls-to-turso.js

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

// State name to code mapping (from your existing script)
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
const BLS_OEWS_NAT_ZIP_URL = 'https://www.bls.gov/oes/special.requests/oesm23nat.zip';
const BLS_OEWS_STATE_ZIP_URL = 'https://www.bls.gov/oes/special.requests/oesm23st.zip';
const XLSX_NAT_FILENAME = 'oesm23nat/national_M2023_dl.xlsx';
const XLSX_STATE_FILENAME = 'oesm23st/state_M2023_dl.xlsx';

async function downloadAndExtractXLSX(url, filename) {
  console.log('Downloading BLS OEWS ZIP:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download BLS OEWS ZIP: ' + res.status);
  const buffer = Buffer.from(await res.arrayBuffer());
  
  const directory = await unzipper.Open.buffer(buffer);
  console.log('Files in ZIP:', directory.files.map(f => f.path));
  
  const file = directory.files.find(f => f.path === filename);
  if (!file) throw new Error('XLSX file not found in ZIP: ' + filename);
  
  const xlsxBuffer = await file.buffer();
  return xlsxBuffer;
}

function parseRegionFromAreaName(areaName) {
  if (!areaName || areaName === 'U.S.') return { region: 'US', regionName: 'United States' };
  
  // Extract state from area name
  const stateName = areaName.includes(',') ? areaName.split(',')[1].trim() : areaName;
  const stateCode = STATE_NAME_TO_CODE[stateName] || stateName;
  
  return {
    region: stateCode,
    regionName: areaName
  };
}

async function clearExistingData() {
  console.log('Clearing existing data from Turso...');
  await db.execute('DELETE FROM occupation_data');
  await db.execute('DELETE FROM occupation_projections');
  await db.execute('DELETE FROM occupation_hierarchies');
  await db.execute('DELETE FROM occupations');
  await db.execute('DELETE FROM major_groups');
  console.log('Existing data cleared.');
}

async function insertMajorGroups(majorGroups) {
  console.log(`Inserting ${majorGroups.size} major groups...`);
  for (const [code, name] of majorGroups) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO major_groups (code, name) VALUES (?, ?)',
      args: [code, name]
    });
  }
}

async function insertOccupations(occupations) {
  console.log(`Inserting ${occupations.size} occupations...`);
  for (const occupation of occupations.values()) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO occupations (code, name, major_group_code) VALUES (?, ?, ?)',
      args: [occupation.code, occupation.name, occupation.majorGroup]
    });
  }
}

async function insertOccupationData(occupationData) {
  console.log(`Inserting ${occupationData.length} occupation data records...`);
  const batchSize = 100;
  
  for (let i = 0; i < occupationData.length; i += batchSize) {
    const batch = occupationData.slice(i, i + batchSize);
    
    for (const data of batch) {
      await db.execute({
        sql: `INSERT INTO occupation_data 
              (occupation_code, region, region_name, mean_annual, mean_hourly, 
               median_annual, median_hourly, benefit_annual) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          data.occupationCode,
          data.region,
          data.regionName,
          data.meanAnnual,
          data.meanHourly,
          data.medianAnnual,
          data.medianHourly,
          data.benefitAnnual
        ]
      });
    }
    
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(occupationData.length / batchSize)}`);
  }
}

async function processProjections() {
  // Process projections data (similar to your existing script)
  const projectionsPath = path.join(__dirname, '../public/data/bls-projections.xlsx');
  
  if (fs.existsSync(projectionsPath)) {
    console.log('Processing BLS projections data...');
    const projWorkbook = xlsx.readFile(projectionsPath);
    
    // Extract projections data from Excel
    // (Implementation would mirror your existing projection processing)
    console.log('Projections processing complete (placeholder for now)');
  } else {
    console.warn('No projections file found at', projectionsPath);
  }
}

async function updateBLSToTurso() {
  try {
    console.log('Starting BLS data update to Turso...');
    
    // Step 1: Clear existing data
    await clearExistingData();
    
    // Step 2: Download and process national data
    console.log('Processing national BLS data...');
    const natBuffer = await downloadAndExtractXLSX(BLS_OEWS_NAT_ZIP_URL, XLSX_NAT_FILENAME);
    const natWorkbook = xlsx.read(natBuffer);
    const natData = xlsx.utils.sheet_to_json(natWorkbook.Sheets[natWorkbook.SheetNames[0]]);
    
    // Step 3: Download and process state data
    console.log('Processing state BLS data...');
    const stateBuffer = await downloadAndExtractXLSX(BLS_OEWS_STATE_ZIP_URL, XLSX_STATE_FILENAME);
    const stateWorkbook = xlsx.read(stateBuffer);
    const stateData = xlsx.utils.sheet_to_json(stateWorkbook.Sheets[stateWorkbook.SheetNames[0]]);
    
    // Step 4: Combine and process all data
    const allData = [...natData, ...stateData];
    console.log(`Processing ${allData.length} total records...`);
    
    // Step 5: Extract major groups, occupations, and data
    const majorGroups = new Map();
    const occupations = new Map();
    const occupationData = [];
    
    for (const record of allData) {
      const occCode = record['OCC_CODE'];
      const occTitle = record['OCC_TITLE'];
      const areaName = record['AREA_NAME'] || record['AREA'];
      
      if (!occCode || !occTitle) continue;
      
      // Extract major group
      const majorCode = occCode.slice(0, 2) + '-0000';
      const majorRecord = allData.find(r => r['OCC_CODE'] === majorCode);
      const majorName = majorRecord ? majorRecord['OCC_TITLE'] : 'Other';
      
      if (!majorGroups.has(majorCode)) {
        majorGroups.set(majorCode, majorName);
      }
      
      // Extract occupation
      if (!occupations.has(occCode)) {
        occupations.set(occCode, {
          code: occCode,
          name: occTitle,
          majorGroup: majorCode
        });
      }
      
      // Extract region info
      const { region, regionName } = parseRegionFromAreaName(areaName);
      
      // Extract salary data
      occupationData.push({
        occupationCode: occCode,
        region: region,
        regionName: regionName,
        meanAnnual: parseInt(record['A_MEAN']) || null,
        meanHourly: parseFloat(record['H_MEAN']) || null,
        medianAnnual: parseInt(record['A_MEDIAN']) || null,
        medianHourly: parseFloat(record['H_MEDIAN']) || null,
        benefitAnnual: null // Calculate if benefit data is available
      });
    }
    
    // Step 6: Insert data into Turso
    await insertMajorGroups(majorGroups);
    await insertOccupations(occupations);
    await insertOccupationData(occupationData);
    
    // Step 7: Process projections (if available)
    await processProjections();
    
    // Step 8: Verify results
    console.log('\\nVerifying database update...');
    const counts = await db.execute('SELECT COUNT(*) as count FROM occupation_data');
    console.log(`Total records in database: ${counts.rows[0].count}`);
    
    const majorGroupCount = await db.execute('SELECT COUNT(*) as count FROM major_groups');
    console.log(`Major groups: ${majorGroupCount.rows[0].count}`);
    
    const occupationCount = await db.execute('SELECT COUNT(*) as count FROM occupations');
    console.log(`Occupations: ${occupationCount.rows[0].count}`);
    
    console.log('\\n✅ BLS data successfully updated in Turso database!');
    console.log('\\n📊 Summary:');
    console.log(`   • Major groups: ${majorGroups.size}`);
    console.log(`   • Occupations: ${occupations.size}`);
    console.log(`   • Data records: ${occupationData.length}`);
    console.log(`   • Total database records: ${counts.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ BLS update to Turso failed:', error);
    process.exit(1);
  }
}

// Run the update
updateBLSToTurso();
