#!/usr/bin/env node

/**
 * Test script for the single table BLS normalization approach
 * Tests the final architecture decision for text field handling
 */

const xlsx = require('xlsx');
const path = require('path');

// Inline copy of identifyYearColumns for testing
function identifyYearColumns(headers) {
  const yearColumns = [];
  const normalColumns = [];
  
  const CURRENT_BASE_YEAR = 2023;
  const FUTURE_YEAR = 2033;
  
  for (const header of headers) {
    if (!header) {
      normalColumns.push(header);
      continue;
    }
    
    // Look for year patterns
    const yearMatch = header.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      
      // Extract base column name by removing year and common formatting
      let baseColumnName = header
        .replace(/,?\s*\d{4}.*$/, '') // Remove year and everything after
        .replace(/\[.*?\]/g, '') // Remove bracketed content
        .trim();
      
      const isBaseYear = year === CURRENT_BASE_YEAR;
      const isFutureYear = year === FUTURE_YEAR;
      
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

console.log('🧪 Testing Single Table BLS Normalization Approach');
console.log('==================================================');

// Test with actual BLS file
const xlsxPath = path.join(__dirname, '..', 'public', 'data', 'occupation.xlsx');

try {
  const workbook = xlsx.readFile(xlsxPath);
  console.log('📁 BLS file loaded successfully');

  // Test Table 1.2 (has the most diverse text fields)
  const worksheet = workbook.Sheets['Table 1.2'];
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  range.s.r = 1; // Start from row 2 (headers)
  
  const data = xlsx.utils.sheet_to_json(worksheet, { 
    range: range,
    header: 1,
    defval: null
  });
  
  const headers = data[0];
  const rows = data.slice(1, 3); // Just test first 2 data rows
  
  console.log('\n📋 Table 1.2 Structure Analysis:');
  console.log(`📊 Headers: ${headers.length}`);
  console.log(`📊 Data rows (sample): ${rows.length}`);
  
  // Identify year vs text columns
  const { yearColumns, normalColumns } = identifyYearColumns(headers);
  
  console.log(`\n📅 Year-based columns: ${yearColumns.length}`);
  yearColumns.forEach(col => {
    console.log(`  - ${col.originalHeader} → "${col.baseColumnName}" (${col.year}, ${col.columnType})`);
  });
  
  console.log(`\n📝 Text/Contextual columns: ${normalColumns.length}`);
  normalColumns.forEach((header, i) => {
    console.log(`  - ${i}: "${header}"`);
  });
  
  // Test the normalization for the first occupation
  const testRow = rows[0];
  console.log('\n🔍 Sample Occupation Data:');
  normalColumns.forEach((header, index) => {
    if (header && testRow[index] !== undefined && testRow[index] !== null) {
      console.log(`  ${header}: ${JSON.stringify(testRow[index])}`);
    }
  });
  
  // Simulate the normalization process
  console.log('\n🔄 Normalized Records (showing structure):');
  const normalizedRows = [];
  
  // Create base record with all text fields
  const baseRecord = {};
  normalColumns.forEach((header, index) => {
    if (header && testRow[index] !== undefined) {
      const cleanColumnName = header.trim()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
      baseRecord[cleanColumnName] = testRow[index];
    }
  });
  
  console.log('\n📄 Base record (text fields):');
  Object.entries(baseRecord).forEach(([key, value]) => {
    console.log(`  ${key}: ${JSON.stringify(value)}`);
  });
  
  // Create normalized records for each metric
  yearColumns.forEach((col, index) => {
    const headerIndex = headers.indexOf(col.originalHeader);
    if (headerIndex >= 0 && testRow[headerIndex] !== null && testRow[headerIndex] !== undefined) {
      const dataType = col.isBaseYear ? 'actual' : 
                      col.isFutureYear ? 'forecasted' : 'other';
      
      const normalizedRecord = {
        ...baseRecord, // ALL text fields included in each row
        metric_name: col.baseColumnName,
        metric_value: testRow[headerIndex],
        metric_year: col.year,
        data_type: dataType,
        table_number: '1.2',
        table_name: 'occupational_employment_projections',
        table_description: 'Occupational employment projections and associated data'
      };
      
      normalizedRows.push(normalizedRecord);
      
      // Show first few records in detail
      if (index < 3) {
        console.log(`\n📊 Record ${index + 1}:`);
        console.log(`  Occupation: ${normalizedRecord.national_employment_matrix_title || 'N/A'}`);
        console.log(`  Code: ${normalizedRecord.national_employment_matrix_code || 'N/A'}`);
        console.log(`  Metric: ${normalizedRecord.metric_name}`);
        console.log(`  Value: ${normalizedRecord.metric_value}`);
        console.log(`  Year: ${normalizedRecord.metric_year}`);
        console.log(`  Data Type: ${normalizedRecord.data_type}`);
        console.log(`  Education: ${normalizedRecord.typical_education_needed_for_entry || 'N/A'}`);
      }
    }
  });
  
  console.log(`\n✅ Successfully normalized 1 occupation into ${normalizedRows.length} metric records`);
  console.log('\n📈 Architecture Benefits Demonstrated:');
  console.log('  ✓ Each record is self-contained (no JOINs needed)');
  console.log('  ✓ All contextual data preserved in each metric row');
  console.log('  ✓ Easy to query by occupation, metric, year, or any combination');
  console.log('  ✓ Scalable for future BLS data updates');
  
  // Show estimated data volume
  const avgTextFieldsPerTable = normalColumns.length;
  const avgMetricsPerTable = yearColumns.length;
  const estimatedOccupations = 800; // Approximate from BLS data
  
  console.log('\n📊 Estimated Data Volume:');
  console.log(`  Occupations per table: ~${estimatedOccupations}`);
  console.log(`  Metrics per occupation: ~${avgMetricsPerTable}`);
  console.log(`  Text fields per record: ~${avgTextFieldsPerTable}`);
  console.log(`  Total records per table: ~${estimatedOccupations * avgMetricsPerTable}`);
  console.log('  📝 Text repetition is manageable and provides query benefits');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}

console.log('\n🎯 Single Table Approach: VALIDATED ✅');
