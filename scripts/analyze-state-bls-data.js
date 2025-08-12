#!/usr/bin/env node

/**
 * State-level BLS Data Analysis Script
 * Examines the state_M2023_dl.xlsx workbook to understand its structure
 * and determine if it contains actual vs forecasted data
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const unzipper = require('unzipper');

// BLS State OEWS URL for 2023
const BLS_OEWS_STATE_ZIP_URL = 'https://www.bls.gov/oes/special.requests/oesm23st.zip';
const XLSX_STATE_FILENAME = 'oesm23st/state_M2023_dl.xlsx';

async function downloadAndExtractStateXLSX() {
  console.log(`📥 Downloading state-level BLS data from ${BLS_OEWS_STATE_ZIP_URL}...`);
  
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

function analyzeStateWorkbook(buffer) {
  console.log('\n📊 ANALYZING STATE-LEVEL BLS WORKBOOK');
  console.log('=====================================');
  
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  console.log(`📄 Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  // Analyze the main data sheet (usually the first one)
  const mainSheetName = workbook.SheetNames[0];
  console.log(`\n🔍 Analyzing main sheet: "${mainSheetName}"`);
  
  const worksheet = workbook.Sheets[mainSheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  
  if (!data || data.length === 0) {
    console.log('❌ No data found in the main sheet');
    return;
  }
  
  // Get column headers
  const headers = Object.keys(data[0]);
  console.log(`\n📋 COLUMN HEADERS (${headers.length} total):`);
  headers.forEach((header, index) => {
    console.log(`   ${index.toString().padStart(2, '0')}: "${header}"`);
  });
  
  // Analyze for year patterns and forecasting indicators
  console.log('\n🔍 YEAR AND FORECASTING ANALYSIS:');
  
  const yearColumns = [];
  const forecastIndicators = [];
  const actualDataColumns = [];
  
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase();
    
    // Look for year patterns
    const yearMatch = header.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      yearColumns.push({ header, year });
    }
    
    // Look for forecasting/projection indicators
    if (lowerHeader.includes('forecast') || 
        lowerHeader.includes('project') || 
        lowerHeader.includes('predict') ||
        lowerHeader.includes('future') ||
        lowerHeader.includes('2033') ||
        lowerHeader.includes('2024') ||
        lowerHeader.includes('2025')) {
      forecastIndicators.push(header);
    }
    
    // Look for actual data indicators
    if (lowerHeader.includes('2023') || 
        lowerHeader.includes('actual') ||
        lowerHeader.includes('current') ||
        lowerHeader.includes('employment') ||
        lowerHeader.includes('wage') ||
        lowerHeader.includes('salary')) {
      actualDataColumns.push(header);
    }
  });
  
  console.log(`\n📅 Year-based columns (${yearColumns.length}):`);
  yearColumns.forEach(col => {
    console.log(`   ${col.header} (Year: ${col.year})`);
  });
  
  console.log(`\n🔮 Potential forecast/projection columns (${forecastIndicators.length}):`);
  forecastIndicators.forEach(header => {
    console.log(`   ${header}`);
  });
  
  console.log(`\n📊 Actual data columns (${actualDataColumns.length}):`);
  actualDataColumns.slice(0, 10).forEach(header => {
    console.log(`   ${header}`);
  });
  if (actualDataColumns.length > 10) {
    console.log(`   ... and ${actualDataColumns.length - 10} more`);
  }
  
  // Sample some data rows to understand structure
  console.log('\n📄 SAMPLE DATA ROWS (first 3):');
  
  const sampleRows = data.slice(0, 3);
  sampleRows.forEach((row, rowIndex) => {
    console.log(`\n   Row ${rowIndex + 1}:`);
    
    // Show key identifying fields
    const keyFields = ['AREA', 'AREA_TITLE', 'OCC_CODE', 'OCC_TITLE', 'O_GROUP'];
    keyFields.forEach(field => {
      if (row[field] !== undefined) {
        const value = typeof row[field] === 'string' && row[field].length > 50 
          ? `${row[field].substring(0, 47)}...` 
          : row[field];
        console.log(`     ${field}: ${JSON.stringify(value)}`);
      }
    });
    
    // Show employment and wage data
    const dataFields = headers.filter(h => 
      h.includes('EMP') || h.includes('WAGE') || h.includes('SALARY') || h.includes('2023')
    ).slice(0, 5);
    
    if (dataFields.length > 0) {
      console.log(`     Data fields:`);
      dataFields.forEach(field => {
        if (row[field] !== undefined && row[field] !== '') {
          console.log(`       ${field}: ${row[field]}`);
        }
      });
    }
  });
  
  // Check for state/region information
  console.log('\n🗺️ REGIONAL DATA ANALYSIS:');
  
  const stateData = data.filter(row => row.AREA_TITLE && row.AREA_TITLE !== 'National');
  const uniqueStates = [...new Set(stateData.map(row => row.AREA_TITLE))].slice(0, 10);
  
  console.log(`   Total records: ${data.length}`);
  console.log(`   State-level records: ${stateData.length}`);
  console.log(`   Sample states: ${uniqueStates.join(', ')}${uniqueStates.length >= 10 ? '...' : ''}`);
  
  // Look for Missouri specifically
  const missouriData = data.filter(row => 
    row.AREA_TITLE && row.AREA_TITLE.toLowerCase().includes('missouri')
  );
  
  console.log(`\n🎯 MISSOURI DATA SAMPLE:`);
  if (missouriData.length > 0) {
    console.log(`   Missouri records found: ${missouriData.length}`);
    
    // Show a few Missouri occupations
    const sampleMissouri = missouriData.slice(0, 5);
    sampleMissouri.forEach((row, index) => {
      console.log(`\n   Missouri Record ${index + 1}:`);
      console.log(`     Area: ${row.AREA_TITLE}`);
      console.log(`     Occupation: ${row.OCC_TITLE}`);
      console.log(`     Code: ${row.OCC_CODE}`);
      
      // Show employment and wage data
      const empField = headers.find(h => h.includes('TOT_EMP') || h.includes('EMPLOYMENT'));
      const wageField = headers.find(h => h.includes('A_MEDIAN') || h.includes('WAGE'));
      
      if (empField && row[empField]) {
        console.log(`     Employment: ${row[empField]}`);
      }
      if (wageField && row[wageField]) {
        console.log(`     Median Wage: ${row[wageField]}`);
      }
    });
  } else {
    console.log(`   ❌ No Missouri data found in sample`);
  }
  
  // Conclusion about forecasting
  console.log('\n🎯 FORECASTING ANALYSIS CONCLUSION:');
  
  const hasForecasting = forecastIndicators.length > 0 || 
                        yearColumns.some(col => col.year > 2023);
  
  if (hasForecasting) {
    console.log('   ✅ This workbook APPEARS to contain forecasted data');
    console.log(`   📊 Found ${forecastIndicators.length} potential forecast indicators`);
    const futureYears = yearColumns.filter(col => col.year > 2023);
    if (futureYears.length > 0) {
      console.log(`   📅 Found data for future years: ${futureYears.map(y => y.year).join(', ')}`);
    }
  } else {
    console.log('   ❌ This workbook appears to contain ONLY actual/current data');
    console.log('   📊 No clear forecasting indicators found');
    console.log('   📅 All year columns appear to be for 2023 or earlier');
  }
  
  console.log(`\n📋 DATA TYPE SUMMARY:`);
  console.log(`   • Primary focus: ${yearColumns.length > 0 ? '2023 actual data' : 'Current employment/wage data'}`);
  console.log(`   • Geographic coverage: State-level breakdown`);
  console.log(`   • Data granularity: By occupation within each state`);
  console.log(`   • Forecasting: ${hasForecasting ? 'YES - includes projections' : 'NO - actual data only'}`);
}

async function main() {
  try {
    console.log('🔍 STATE-LEVEL BLS DATA ANALYSIS');
    console.log('================================');
    
    const buffer = await downloadAndExtractStateXLSX();
    analyzeStateWorkbook(buffer);
    
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error analyzing state data:', error.message);
    process.exit(1);
  }
}

main();
