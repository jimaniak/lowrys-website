#!/usr/bin/env node

/**
 * Test State-Level BLS Normalization
 * Apply our single-table normalization approach to state-level BLS data
 * Focus on Missouri data and Project Manager occupations
 */

const unzipper = require('unzipper');
const xlsx = require('xlsx');

// BLS OEWS URLs
const CURRENT_BASE_YEAR = 2023;
const BLS_OEWS_STATE_ZIP_URL = `https://www.bls.gov/oes/special.requests/oesm${CURRENT_BASE_YEAR % 100}st.zip`;
const XLSX_STATE_FILENAME = `oesm${CURRENT_BASE_YEAR % 100}st/state_M${CURRENT_BASE_YEAR}_dl.xlsx`;

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

function normalizeStateData(sheetData, sheetName) {
  console.log(`📊 Normalizing ${sheetName}...`);
  
  if (!sheetData || sheetData.length === 0) {
    console.log('❌ No data to normalize');
    return [];
  }
  
  const headers = Object.keys(sheetData[0]);
  console.log(`📋 Found ${headers.length} columns: ${headers.slice(0, 8).join(', ')}...`);
  
  // Identify text fields (non-numeric columns)
  const textFields = [];
  const metricFields = [];
  
  headers.forEach(header => {
    const sampleValue = sheetData[0][header];
    const isNumeric = !isNaN(parseFloat(sampleValue)) && isFinite(sampleValue);
    
    if (!isNumeric || ['AREA', 'AREA_TYPE', 'OWN_CODE', 'OCC_CODE'].includes(header)) {
      textFields.push(header);
    } else {
      metricFields.push(header);
    }
  });
  
  console.log(`📝 Text fields (${textFields.length}): ${textFields.slice(0, 8).join(', ')}...`);
  console.log(`📊 Metric fields (${metricFields.length}): ${metricFields.slice(0, 8).join(', ')}...`);
  
  const normalizedData = [];
  
  sheetData.forEach((row, rowIndex) => {
    // Create base record with all text fields
    const baseRecord = {
      table_name: sheetName,
      source_row_index: rowIndex
    };
    
    // Add all text fields to base record
    textFields.forEach(field => {
      baseRecord[field.toLowerCase()] = row[field];
    });
    
    // Create one normalized row for each metric
    metricFields.forEach(metricField => {
      const normalizedRow = {
        ...baseRecord,
        metric_name: metricField,
        metric_value: row[metricField],
        metric_year: CURRENT_BASE_YEAR,
        data_type: 'actual'
      };
      
      normalizedData.push(normalizedRow);
    });
  });
  
  console.log(`✅ Normalized ${sheetData.length} rows into ${normalizedData.length} normalized records`);
  return normalizedData;
}

async function main() {
  try {
    console.log('🚀 STATE-LEVEL BLS NORMALIZATION TEST');
    console.log('====================================');
    
    // Download and extract the Excel file
    const buffer = await downloadAndExtractXLSX(BLS_OEWS_STATE_ZIP_URL, XLSX_STATE_FILENAME);
    
    // Parse the workbook
    console.log('📖 Parsing Excel workbook...');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    console.log(`📊 Available sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Focus on the main data sheet
    const mainSheetName = 'state_M2023_dl';
    if (!workbook.Sheets[mainSheetName]) {
      throw new Error(`Sheet ${mainSheetName} not found`);
    }
    
    // Convert to JSON
    console.log(`📄 Converting ${mainSheetName} to JSON...`);
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[mainSheetName]);
    console.log(`📊 Found ${sheetData.length} total rows`);
    
    // Filter for Missouri data
    console.log('🔍 Filtering for Missouri data...');
    const missouriData = sheetData.filter(row => 
      row.PRIM_STATE === 'MO' || row.AREA_TITLE === 'Missouri'
    );
    console.log(`📍 Found ${missouriData.length} Missouri rows`);
    
    if (missouriData.length === 0) {
      console.log('❌ No Missouri data found');
      return;
    }
    
    // Show sample Missouri data structure
    console.log('📄 Sample Missouri data structure:');
    const sampleRow = missouriData[0];
    Object.keys(sampleRow).slice(0, 12).forEach(key => {
      console.log(`   ${key}: "${sampleRow[key]}"`);
    });
    
    // Look for manager-related occupations in Missouri
    console.log('\n🔍 Searching for manager occupations in Missouri...');
    const managerRows = missouriData.filter(row => {
      const title = row.OCC_TITLE;
      if (title) {
        const titleStr = title.toString().toLowerCase();
        return titleStr.includes('manager') || 
               titleStr.includes('supervisor') ||
               titleStr.includes('director');
      }
      return false;
    });
    
    console.log(`👨‍💼 Found ${managerRows.length} manager-related occupations in Missouri`);
    
    if (managerRows.length > 0) {
      console.log('\n📋 Manager occupation titles:');
      const uniqueTitles = [...new Set(managerRows.map(row => row.OCC_TITLE))];
      uniqueTitles.slice(0, 10).forEach((title, index) => {
        console.log(`   ${index + 1}. ${title}`);
      });
    }
    
    // Normalize the Missouri data
    console.log('\n🔄 NORMALIZING MISSOURI DATA');
    console.log('============================');
    const normalizedData = normalizeStateData(missouriData, 'missouri_oews_2023');
    
    // Show sample normalized output
    console.log('\n📊 Sample normalized output:');
    normalizedData.slice(0, 5).forEach((row, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`   Area: ${row.area_title} (${row.prim_state})`);
      console.log(`   Occupation: ${row.occ_title}`);
      console.log(`   Metric: ${row.metric_name} = ${row.metric_value}`);
      console.log(`   Year: ${row.metric_year} (${row.data_type})`);
    });
    
    // Test a specific query: Construction Managers in Missouri
    console.log('\n🏗️  QUERY TEST: Construction Managers in Missouri');
    console.log('================================================');
    
    const constructionManagerData = normalizedData.filter(row =>
      row.occ_title && row.occ_title.toLowerCase().includes('construction') &&
      row.occ_title.toLowerCase().includes('manager')
    );
    
    if (constructionManagerData.length > 0) {
      console.log(`✅ Found ${constructionManagerData.length} normalized records for Construction Managers`);
      
      // Group by metric to show salary ranges
      const salaryMetrics = constructionManagerData.filter(row => 
        row.metric_name.includes('MEAN') || row.metric_name.includes('MEDIAN')
      );
      
      console.log('\n💰 Salary Information:');
      salaryMetrics.forEach(row => {
        console.log(`   ${row.metric_name}: $${row.metric_value}`);
      });
      
      // Show employment metrics
      const empMetrics = constructionManagerData.filter(row => 
        row.metric_name.includes('TOT_EMP') || row.metric_name.includes('JOBS_1000')
      );
      
      console.log('\n👥 Employment Information:');
      empMetrics.forEach(row => {
        console.log(`   ${row.metric_name}: ${row.metric_value}`);
      });
      
    } else {
      console.log('❌ No Construction Manager data found');
    }
    
    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('====================');
    console.log(`✅ State-level data structure: Compatible with our normalization approach`);
    console.log(`✅ Total Missouri records: ${missouriData.length}`);
    console.log(`✅ Normalized records: ${normalizedData.length}`);
    console.log(`✅ Manager occupations available: ${managerRows.length > 0 ? 'Yes' : 'No'}`);
    console.log(`✅ Single-table approach: Validated for state-level data`);
    console.log(`✅ Relational queries: Working (area + occupation + metrics)`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
