// Test script to validate OEWS data processing functionality
require('dotenv').config({ path: '.env.local' });
const xlsx = require('xlsx');
const fs = require('fs');

// Mock data for testing
const mockOEWSData = [
  {
    'OCC_CODE': '11-1011',
    'OCC_TITLE': 'Chief Executives',
    'TOT_EMP': '249870',
    'A_MEDIAN': '123456',
    'AREA_TITLE': 'Missouri',
    'AREA_TYPE': 'State'
  },
  {
    'OCC_CODE': '11-3021',
    'OCC_TITLE': 'Computer and Information Systems Managers',
    'TOT_EMP': '482800',
    'A_MEDIAN': '165300',
    'AREA_TITLE': 'Missouri',
    'AREA_TYPE': 'State'
  }
];

// State mapping for testing
const STATE_NAME_TO_CODE = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

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

function extractYearFromOEWSFilename(filename) {
  // Examples: "state_M2023_dl.xlsx", "national_M2023_dl.xlsx"
  const yearMatch = filename.match(/M(\d{4})/);
  return yearMatch ? parseInt(yearMatch[1]) : 2023;
}

async function testProcessOEWSData() {
  console.log('🧪 Testing OEWS Data Processing Logic');
  console.log('=====================================');
  
  // Test year extraction
  const testFilenames = [
    'state_M2023_dl.xlsx',
    'national_M2024_dl.xlsx',
    'invalid_filename.xlsx'
  ];
  
  console.log('\n📅 Testing Year Extraction:');
  testFilenames.forEach(filename => {
    const year = extractYearFromOEWSFilename(filename);
    console.log(`  ${filename} → Year: ${year}`);
  });
  
  // Test region parsing
  const testRegions = [
    'Missouri',
    'New York',
    'California (Metropolitan Statistical Area)',
    '',
    'Invalid Region Name'
  ];
  
  console.log('\n🌎 Testing Region Parsing:');
  testRegions.forEach(region => {
    const { region: code, regionName } = parseRegionFromAreaName(region);
    console.log(`  "${region}" → Code: ${code}, Name: ${regionName}`);
  });
  
  // Test OEWS data normalization
  console.log('\n📊 Testing OEWS Data Normalization:');
  const sourceYear = 2023;
  const isNational = false;
  
  // Mock occupation table map (simplified)
  const occupationTableMap = {
    '11-1011': { occupation_type: 'LINE_ITEM', category: 'OCCUPATION', parent_code: '11-1010' },
    '11-3021': { occupation_type: 'LINE_ITEM', category: 'OCCUPATION', parent_code: '11-3020' }
  };
  
  const normalized = [];
  
  for (const row of mockOEWSData) {
    const code = (row['OCC_CODE'] || '').trim();
    if (!code || code === 'OCC_CODE') continue;
    
    const name = (row['OCC_TITLE'] || '').trim();
    const areaName = row['AREA_TITLE'] || '';
    const employment = row['TOT_EMP'] ? parseInt(row['TOT_EMP'].toString().replace(/[^\d]/g, '')) || null : null;
    const wage = row['A_MEDIAN'] ? parseInt(row['A_MEDIAN'].toString().replace(/[^\d]/g, '')) || null : null;
    
    // Parse region from area name
    const { region, regionName } = parseRegionFromAreaName(areaName);
    
    // Get occupation info from Table 1.2 if available
    const occInfo = occupationTableMap[code] || {};
    const occupation_type = occInfo.occupation_type || '';
    const category = occInfo.category || 'OTHER';
    const parent_code = occInfo.parent_code || null;

    // Create normalized record for OEWS data
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
  
  console.log(`✅ Normalized ${normalized.length} OEWS records`);
  console.log('\n📋 Sample Normalized Records:');
  normalized.forEach((record, index) => {
    console.log(`\nRecord ${index + 1}:`);
    console.log(`  Code: ${record.code} - ${record.name}`);
    console.log(`  Region: ${record.region_code} (${record.region_name})`);
    console.log(`  Year: ${record.data_year} (${record.data_type})`);
    console.log(`  Employment: ${record.employment?.toLocaleString() || 'N/A'}`);
    console.log(`  Wage: $${record.median_annual_wage?.toLocaleString() || 'N/A'}`);
    console.log(`  Category: ${record.category} (${record.occupation_type})`);
  });
  
  console.log('\n🎯 Test Query Examples:');
  console.log('Find all Project Managers in Missouri:');
  console.log(`  SELECT * FROM bls_state_oews WHERE name LIKE '%Manager%' AND region_code = 'MO' AND data_year = 2023`);
  
  console.log('\nFind employment trends for Computer Systems Managers:');
  console.log(`  SELECT region_name, employment, median_annual_wage FROM bls_state_oews WHERE code = '11-3021' ORDER BY region_name`);
  
  console.log('\n✅ OEWS Processing Test Complete!');
}

// Run the test
testProcessOEWSData().catch(console.error);
