#!/usr/bin/env node

/**
 * Test script to verify BLS table normalization with data_type column
 */

const { createClient } = require('@libsql/client');
const xlsx = require('xlsx');
require('dotenv').config({ path: '.env.local' });

// Current data years 
const CURRENT_BASE_YEAR = 2023;

// Test the year column identification and normalization logic
function testYearColumnIdentification() {
  console.log('=== Testing Year Column Identification ===\n');
  
  // Sample headers from BLS tables
  const testHeaders = [
    '2023 National Employment Matrix code',
    'Occupation title',
    'Employment, 2023',
    'Employment, 2033', 
    'Median annual wage, dollars, 2023[1]',
    'Change, 2023–33',
    'Percent change, 2023–33',
    'Openings due to growth, 2023–33',
    'Replacements, 2023–33'
  ];
  
  const { yearColumns, normalColumns } = identifyYearColumns(testHeaders);
  
  console.log('📅 Year-based columns found:');
  yearColumns.forEach(col => {
    console.log(`  - "${col.originalHeader}" → "${col.baseColumnName}" (${col.year}, ${col.columnType})`);
  });
  
  console.log('\n📝 Normal columns:');
  normalColumns.forEach(col => {
    console.log(`  - "${col}"`);
  });
  
  console.log('\n🔍 Expected data_type values:');
  yearColumns.forEach(col => {
    const dataType = col.isBaseYear ? 'actual' : 
                    col.isFutureYear ? 'forecasted' : 'other';
    console.log(`  - ${col.baseColumnName} (${col.year}): ${dataType}`);
  });
  
  return { yearColumns, normalColumns };
}

// Helper function from the main script
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
      
      // Extract base column name
      let baseColumnName = header;
      baseColumnName = baseColumnName.replace(/[,\s]*\d{4}.*$/, '').trim();
      baseColumnName = baseColumnName.replace(/[,\s]*dollars?\s*$/, '').trim();
      baseColumnName = baseColumnName.replace(/[,\s]*\$?\s*$/, '').trim();
      
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

// Test normalization with sample data
function testDataNormalization() {
  console.log('\n=== Testing Data Normalization ===\n');
  
  // Sample row data
  const sampleRow = [
    '11-1011', // code
    'Chief Executives', // title
    '200000', // Employment, 2023
    '210000', // Employment, 2033
    '185950', // Median wage, 2023
    '10000', // Change 2023-33
    '5.0', // Percent change
    '2000', // Openings due to growth
    '8000'  // Replacements
  ];
  
  const headers = [
    '2023 National Employment Matrix code',
    'Occupation title',
    'Employment, 2023',
    'Employment, 2033', 
    'Median annual wage, dollars, 2023[1]',
    'Change, 2023–33',
    'Percent change, 2023–33',
    'Openings due to growth, 2023–33',
    'Replacements, 2023–33'
  ];
  
  const { yearColumns, normalColumns } = identifyYearColumns(headers);
  
  // Simulate normalization process
  const baseRecord = {};
  
  // Add normal columns
  normalColumns.forEach((header, index) => {
    if (header && sampleRow[index] !== undefined) {
      baseRecord[header.trim()] = sampleRow[index];
    }
  });
  
  console.log('📋 Base record (normal columns):');
  console.log(JSON.stringify(baseRecord, null, 2));
  
  // Create normalized rows
  const normalizedRows = [];
  
  yearColumns.forEach(col => {
    const headerIndex = headers.indexOf(col.originalHeader);
    if (headerIndex >= 0 && sampleRow[headerIndex] !== null && sampleRow[headerIndex] !== undefined) {
      const dataType = col.isBaseYear ? 'actual' : 
                      col.isFutureYear ? 'forecasted' : 'other';
      
      const normalizedRecord = {
        ...baseRecord,
        metric_name: col.baseColumnName,
        metric_value: sampleRow[headerIndex],
        metric_year: col.year,
        data_type: dataType,
        table_number: '1.2',
        table_name: 'occupational_projections_2023_33',
        source_workbook: 'occupation'
      };
      
      normalizedRows.push(normalizedRecord);
    }
  });
  
  console.log('\n📊 Normalized rows:');
  normalizedRows.forEach((row, index) => {
    console.log(`\nRow ${index + 1}:`);
    console.log(`  Code: ${row['2023 National Employment Matrix code']}`);
    console.log(`  Title: ${row['Occupation title']}`);
    console.log(`  Metric: ${row.metric_name}`);
    console.log(`  Value: ${row.metric_value}`);
    console.log(`  Year: ${row.metric_year}`);
    console.log(`  Data Type: ${row.data_type}`);
  });
  
  console.log(`\n✅ Created ${normalizedRows.length} normalized records from 1 source row`);
  
  return normalizedRows;
}

// Test with actual BLS file if available
async function testWithActualBLSFile() {
  console.log('\n=== Testing with Actual BLS File ===\n');
  
  const fs = require('fs');
  const path = require('path');
  const occXlsxPath = path.join(__dirname, '../public/data/occupation.xlsx');
  
  if (!fs.existsSync(occXlsxPath)) {
    console.log('❌ occupation.xlsx not found, skipping actual file test');
    return;
  }
  
  try {
    const workbook = xlsx.readFile(occXlsxPath);
    console.log('📁 Available sheets:', workbook.SheetNames);
    
    // Try to find Table 1.2
    const table12Sheet = workbook.SheetNames.find(name => 
      name.includes('1.2') || name.includes('1_2')
    );
    
    if (!table12Sheet) {
      console.log('❌ Table 1.2 sheet not found');
      return;
    }
    
    console.log(`📄 Using sheet: ${table12Sheet}`);
    const worksheet = workbook.Sheets[table12Sheet];
    
    // Get headers from row 2
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    range.s.r = 1; // Start from row 2
    range.e.r = 2; // Only get first 2 rows (header + 1 data row)
    
    const data = xlsx.utils.sheet_to_json(worksheet, { 
      range: range,
      header: 1,
      defval: null
    });
    
    if (data.length >= 2) {
      const headers = data[0];
      const sampleRow = data[1];
      
      console.log('📋 Actual headers (first 5):');
      headers.slice(0, 5).forEach((header, i) => {
        console.log(`  ${i}: "${header}"`);
      });
      
      const { yearColumns, normalColumns } = identifyYearColumns(headers);
      
      console.log(`\n📅 Found ${yearColumns.length} year-based columns`);
      console.log(`📝 Found ${normalColumns.length} normal columns`);
      
      // Show expected normalization output
      if (yearColumns.length > 0) {
        console.log('\n🎯 Normalization preview:');
        yearColumns.slice(0, 3).forEach(col => {
          const dataType = col.isBaseYear ? 'actual' : 
                          col.isFutureYear ? 'forecasted' : 'other';
          console.log(`  "${col.originalHeader}" → ${col.baseColumnName} (${col.year}, ${dataType})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing with actual file:', error.message);
  }
}

// Main test execution
async function main() {
  console.log('🧪 BLS Table Normalization Test\n');
  
  // Test 1: Year column identification
  testYearColumnIdentification();
  
  // Test 2: Data normalization
  testDataNormalization();
  
  // Test 3: Actual BLS file (if available)
  await testWithActualBLSFile();
  
  console.log('\n✅ All tests completed');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testYearColumnIdentification, testDataNormalization };
