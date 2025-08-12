#!/usr/bin/env node

/**
 * BLS Table Structure Analysis Script
 * Examines headers and first 5 rows of each table to understand the data structure
 */

const xlsx = require('xlsx');
const path = require('path');

// BLS Tables to analyze
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

function analyzeTable(workbook, tableNumber, config) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 TABLE ${tableNumber}: ${config.name.toUpperCase()}`);
  console.log(`📝 Description: ${config.description}`);
  console.log(`${'='.repeat(80)}`);
  
  if (config.skipTable) {
    console.log(`⏭️  SKIPPED per configuration`);
    return;
  }
  
  // Find the sheet for this table
  const sheetName = workbook.SheetNames.find(name => 
    name.includes(`${tableNumber}`) || name.includes(tableNumber.replace('.', '_'))
  );
  
  if (!sheetName) {
    console.log(`❌ Sheet for Table ${tableNumber} not found`);
    console.log(`Available sheets: ${workbook.SheetNames.join(', ')}`);
    return;
  }
  
  console.log(`📄 Sheet Name: "${sheetName}"`);
  
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
    return;
  }
  
  // Get headers (first row of data)
  const headers = data[0];
  const rows = data.slice(1, 6); // First 5 data rows
  
  console.log(`📊 Data Summary:`);
  console.log(`   Total columns: ${headers.length}`);
  console.log(`   Total data rows: ${data.length - 1}`);
  console.log(`   Sample rows shown: ${Math.min(5, rows.length)}`);
  
  // Display headers
  console.log(`\n📋 COLUMN HEADERS (${headers.length} total):`);
  headers.forEach((header, index) => {
    const displayHeader = header || '[EMPTY]';
    console.log(`   ${index.toString().padStart(2, '0')}: "${displayHeader}"`);
  });
  
  // Display first 5 rows
  console.log(`\n📄 FIRST 5 DATA ROWS:`);
  
  rows.forEach((row, rowIndex) => {
    console.log(`\n   Row ${rowIndex + 1}:`);
    headers.forEach((header, colIndex) => {
      const value = row[colIndex];
      const displayHeader = (header || `[COL_${colIndex}]`).substring(0, 30);
      
      let displayValue;
      if (value === null || value === undefined) {
        displayValue = '[NULL]';
      } else if (typeof value === 'string') {
        // Truncate long strings and clean up whitespace
        displayValue = value.trim().substring(0, 50);
        if (value.length > 50) displayValue += '...';
        displayValue = `"${displayValue}"`;
      } else {
        displayValue = value.toString();
      }
      
      console.log(`     ${displayHeader.padEnd(32, ' ')}: ${displayValue}`);
    });
  });
  
  // Identify potential year columns vs text columns
  console.log(`\n🔍 COLUMN ANALYSIS:`);
  
  const yearColumns = [];
  const textColumns = [];
  const numericColumns = [];
  
  headers.forEach((header, index) => {
    if (!header) {
      textColumns.push({ index, header: '[EMPTY]', type: 'empty' });
      return;
    }
    
    const lowerHeader = header.toLowerCase();
    const hasYear = /\d{4}/.test(header);
    const isMetadata = lowerHeader.includes('matrix') || 
                     lowerHeader.includes('title') ||
                     lowerHeader.includes('code') ||
                     lowerHeader.includes('type');
    
    // Check sample values to determine if mostly numeric
    const sampleValues = rows.map(row => row[index]).filter(v => v !== null && v !== undefined);
    const numericValues = sampleValues.filter(v => typeof v === 'number' || (!isNaN(parseFloat(v)) && isFinite(v)));
    const isNumeric = sampleValues.length > 0 && (numericValues.length / sampleValues.length) > 0.7;
    
    if (hasYear && !isMetadata && isNumeric) {
      yearColumns.push({ index, header, type: 'year_metric' });
    } else if (isNumeric && !hasYear) {
      numericColumns.push({ index, header, type: 'numeric' });
    } else {
      textColumns.push({ index, header, type: 'text' });
    }
  });
  
  console.log(`\n   📅 Year-based metric columns (${yearColumns.length}):`);
  yearColumns.forEach(col => {
    console.log(`      ${col.index.toString().padStart(2, '0')}: "${col.header}"`);
  });
  
  console.log(`\n   📝 Text/metadata columns (${textColumns.length}):`);
  textColumns.forEach(col => {
    console.log(`      ${col.index.toString().padStart(2, '0')}: "${col.header}"`);
  });
  
  console.log(`\n   🔢 Other numeric columns (${numericColumns.length}):`);
  numericColumns.forEach(col => {
    console.log(`      ${col.index.toString().padStart(2, '0')}: "${col.header}"`);
  });
}

console.log('🔍 BLS TABLE STRUCTURE ANALYSIS');
console.log('===============================');

const xlsxPath = path.join(__dirname, '..', 'public', 'data', 'occupation.xlsx');

try {
  const workbook = xlsx.readFile(xlsxPath);
  console.log(`📁 Loaded workbook: ${xlsxPath}`);
  console.log(`📊 Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  // Analyze each table
  for (const [tableNumber, config] of Object.entries(BLS_TABLES_CONFIG)) {
    analyzeTable(workbook, tableNumber, config);
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ ANALYSIS COMPLETE');
  console.log(`${'='.repeat(80)}`);
  
} catch (error) {
  console.error('❌ Error analyzing tables:', error.message);
  process.exit(1);
}
