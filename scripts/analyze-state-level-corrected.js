#!/usr/bin/env node

/**
 * State-Level BLS Data Analysis - Corrected Header Position
 * Examines the state_M2023_dl.xlsx workbook with proper header handling
 */

const xlsx = require('xlsx');
const path = require('path');
const { createClient } = require('@libsql/client');
const unzipper = require('unzipper');
require('dotenv').config({ path: '.env.local' });

// Create Turso client for downloading
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const CURRENT_BASE_YEAR = 2023;
const BLS_OEWS_STATE_ZIP_URL = `https://www.bls.gov/oes/special.requests/oesm${CURRENT_BASE_YEAR % 100}st.zip`;
const XLSX_STATE_FILENAME = `oesm${CURRENT_BASE_YEAR % 100}st/state_M${CURRENT_BASE_YEAR}_dl.xlsx`;

// Download and extract state-level workbook
async function downloadStateWorkbook() {
  console.log('📥 Downloading state-level BLS workbook...');
  
  const response = await fetch(BLS_OEWS_STATE_ZIP_URL);
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
        if (entry.path === XLSX_STATE_FILENAME) {
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
          reject(new Error(`File ${XLSX_STATE_FILENAME} not found in archive`));
        }
      });
  });
}

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
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'Puerto Rico': 'PR'
};

function analyzeStateWorkbook(buffer) {
  console.log('\n🔍 STATE-LEVEL BLS WORKBOOK ANALYSIS');
  console.log('====================================');
  
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  console.log(`📊 Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  // Analyze main data sheet (usually the first one)
  const mainSheetName = workbook.SheetNames[0];
  console.log(`\n📄 Analyzing main sheet: "${mainSheetName}"`);
  
  const worksheet = workbook.Sheets[mainSheetName];
  
  // IMPORTANT: State workbooks have headers on ROW 1 (not row 2 like occupation workbook)
  const data = xlsx.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: null
  });
  
  if (!data || data.length === 0) {
    console.log('❌ No data found');
    return;
  }
  
  // Get headers (first row) and sample data
  const headers = data[0];
  const sampleRows = data.slice(1, 6); // First 5 data rows
  
  console.log(`\n📋 HEADERS (${headers.length} columns):`);
  headers.forEach((header, index) => {
    console.log(`   ${index.toString().padStart(2, '0')}: "${header || '[EMPTY]'}"`);
  });
  
  console.log(`\n📊 DATA SUMMARY:`);
  console.log(`   Total rows: ${data.length - 1} (excluding header)`);
  console.log(`   Sample rows shown: ${Math.min(5, sampleRows.length)}`);
  
  // Show sample data
  console.log(`\n📄 SAMPLE DATA (first 5 rows):`);
  sampleRows.forEach((row, rowIndex) => {
    console.log(`\n   Row ${rowIndex + 1}:`);
    headers.forEach((header, colIndex) => {
      const value = row[colIndex];
      const displayHeader = (header || `[COL_${colIndex}]`).substring(0, 25);
      
      let displayValue;
      if (value === null || value === undefined) {
        displayValue = '[NULL]';
      } else if (typeof value === 'string') {
        displayValue = `"${value.trim().substring(0, 40)}"`;
        if (value.length > 40) displayValue = displayValue.slice(0, -1) + '..."';
      } else {
        displayValue = value.toString();
      }
      
      console.log(`     ${displayHeader.padEnd(27, ' ')}: ${displayValue}`);
    });
  });
  
  // Look for Missouri data specifically
  console.log(`\n🏛️  MISSOURI DATA SEARCH:`);
  let missouriRows = data.filter((row, index) => {
    if (index === 0) return false; // Skip header
    return row.some(cell => 
      cell && typeof cell === 'string' && 
      (cell.toLowerCase().includes('missouri') || cell.toLowerCase().includes('mo'))
    );
  });
  
  console.log(`   Found ${missouriRows.length} rows containing Missouri data`);
  
  if (missouriRows.length > 0) {
    console.log('\n   Sample Missouri rows:');
    missouriRows.slice(0, 3).forEach((row, index) => {
      console.log(`\n   Missouri Row ${index + 1}:`);
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        if (value !== null && value !== undefined) {
          const displayHeader = (header || `[COL_${colIndex}]`).substring(0, 25);
          let displayValue = typeof value === 'string' ? `"${value}"` : value.toString();
          console.log(`     ${displayHeader.padEnd(27, ' ')}: ${displayValue}`);
        }
      });
    });
  }
  
  // Look for Project Manager data
  console.log(`\n👔 PROJECT MANAGER DATA SEARCH:`);
  let projectManagerRows = data.filter((row, index) => {
    if (index === 0) return false; // Skip header
    return row.some(cell => 
      cell && typeof cell === 'string' && 
      (cell.toLowerCase().includes('project manager') || 
       cell.toLowerCase().includes('program manager') ||
       cell.toLowerCase().includes('management analyst'))
    );
  });
  
  console.log(`   Found ${projectManagerRows.length} rows with project/program manager data`);
  
  if (projectManagerRows.length > 0) {
    console.log('\n   Sample Project Manager rows:');
    projectManagerRows.slice(0, 3).forEach((row, index) => {
      console.log(`\n   PM Row ${index + 1}:`);
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        if (value !== null && value !== undefined) {
          const displayHeader = (header || `[COL_${colIndex}]`).substring(0, 25);
          let displayValue = typeof value === 'string' ? `"${value}"` : value.toString();
          console.log(`     ${displayHeader.padEnd(27, ' ')}: ${displayValue}`);
        }
      });
    });
  }
  
  // Check for Field Descriptions sheet
  console.log(`\n📋 FIELD DESCRIPTIONS ANALYSIS:`);
  const fieldDescSheet = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('field') || 
    name.toLowerCase().includes('description') ||
    name.toLowerCase().includes('layout')
  );
  
  if (fieldDescSheet) {
    console.log(`   Found field descriptions sheet: "${fieldDescSheet}"`);
    
    const descWorksheet = workbook.Sheets[fieldDescSheet];
    const descData = xlsx.utils.sheet_to_json(descWorksheet, { 
      header: 1,
      defval: null
    });
    
    console.log(`\n   Field Descriptions (first 10 rows):`);
    descData.slice(0, 10).forEach((row, index) => {
      if (row && row.some(cell => cell)) {
        console.log(`     ${index + 1}: ${row.join(' | ')}`);
      }
    });
  } else {
    console.log(`   No field descriptions sheet found`);
    console.log(`   Available sheets: ${workbook.SheetNames.join(', ')}`);
  }
  
  // Analyze column types for forecasting capability
  console.log(`\n🔮 FORECASTING DATA ANALYSIS:`);
  console.log('   Analyzing if state data contains forecasted/projected values...');
  
  // Look for year patterns in headers
  const yearColumns = headers.filter(header => 
    header && typeof header === 'string' && /\d{4}/.test(header)
  );
  
  console.log(`   Year-based columns found: ${yearColumns.length}`);
  yearColumns.forEach(col => {
    console.log(`     - "${col}"`);
  });
  
  // Look for projection/forecast keywords
  const forecastColumns = headers.filter(header => 
    header && typeof header === 'string' && 
    (header.toLowerCase().includes('project') || 
     header.toLowerCase().includes('forecast') ||
     header.toLowerCase().includes('2033') ||
     header.toLowerCase().includes('2034'))
  );
  
  console.log(`   Forecast-related columns: ${forecastColumns.length}`);
  forecastColumns.forEach(col => {
    console.log(`     - "${col}"`);
  });
  
  if (forecastColumns.length === 0 && yearColumns.length > 0) {
    console.log('   🔍 State data appears to contain ONLY CURRENT/ACTUAL data (no forecasts)');
  } else if (forecastColumns.length > 0) {
    console.log('   🔮 State data contains FORECASTED data');
  } else {
    console.log('   ❓ Unable to determine if forecasted data is present');
  }
}

// Main execution
(async () => {
  try {
    console.log('🚀 Starting State-Level BLS Data Analysis');
    console.log('=========================================');
    
    const buffer = await downloadStateWorkbook();
    analyzeStateWorkbook(buffer);
    
    console.log('\n✅ Analysis Complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
