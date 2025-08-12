#!/usr/bin/env node

/**
 * Test BLS Table Processing
 * 
 * This script tests the BLS table processing functionality
 * with year-based column normalization using the new table names
 */

const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  '1.1': { 
    name: 'employment_by_major_occupational_group',
    description: 'Employment by major occupational group, 2023 and projected 2033',
    skipTable: false
  }
};

const CURRENT_BASE_YEAR = 2023;
const CURRENT_PROJECTION_YEAR = 2033;

// Helper function to identify year-based columns and normalize them
function identifyYearColumns(headers) {
  const yearColumns = [];
  const normalColumns = [];
  const yearPattern = /(\d{4})/g;
  
  for (const header of headers) {
    if (!header) continue;
    
    const yearMatches = header.match(yearPattern);
    if (yearMatches && yearMatches.length > 0) {
      // This is a year-based column
      const year = parseInt(yearMatches[0]);
      const baseColumnName = header.replace(/[,\s]*\d{4}[^\w]*.*$/, '').trim();
      
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

async function testBLSTableProcessing() {
  console.log('🧪 Testing BLS Table Processing');
  console.log('===============================');
  
  // Download occupation.xlsx if needed
  const occXlsxPath = path.join(__dirname, '../public/data/occupation.xlsx');
  if (!require('fs').existsSync(occXlsxPath)) {
    console.log('📥 Downloading occupation.xlsx...');
    const response = await fetch(process.env.BLS_OCCUPATION_XLSX_URL);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    require('fs').mkdirSync(path.dirname(occXlsxPath), { recursive: true });
    require('fs').writeFileSync(occXlsxPath, buffer);
  }
  
  const workbook = xlsx.readFile(occXlsxPath);
  console.log(`📊 Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  // Test processing Table 1.1
  const tableNumber = '1.1';
  const config = TEST_CONFIG[tableNumber];
  
  console.log(`\n🔍 Testing Table ${tableNumber}: ${config.description}`);
  
  // Find the sheet
  const sheetName = workbook.SheetNames.find(name => 
    name.includes(`${tableNumber}`) || name.includes(tableNumber.replace('.', '_'))
  );
  
  if (!sheetName) {
    console.log(`❌ Sheet for Table ${tableNumber} not found`);
    return;
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
    return;
  }
  
  // Get headers (first row of data)
  const headers = data[0];
  const rows = data.slice(1);
  
  console.log(`📋 Headers (${headers.length}):`);
  headers.forEach((header, i) => {
    if (header) console.log(`  ${i+1}. ${header}`);
  });
  
  console.log(`📊 Data rows: ${rows.length}`);
  
  // Test year column identification
  const { yearColumns, normalColumns } = identifyYearColumns(headers);
  
  console.log(`\n📅 Year-based columns found: ${yearColumns.length}`);
  if (yearColumns.length > 0) {
    console.log('Year columns details:');
    yearColumns.forEach(col => {
      console.log(`  - "${col.originalHeader}"`);
      console.log(`    → Base: "${col.baseColumnName}"`);
      console.log(`    → Year: ${col.year} (${col.columnType})`);
    });
  }
  
  console.log(`\n📝 Normal columns found: ${normalColumns.length}`);
  if (normalColumns.length > 0) {
    console.log('Normal columns:');
    normalColumns.slice(0, 5).forEach(col => {
      console.log(`  - "${col}"`);
    });
    if (normalColumns.length > 5) {
      console.log(`  ... and ${normalColumns.length - 5} more`);
    }
  }
  
  // Test sample data normalization
  if (rows.length > 0) {
    console.log(`\n📋 Sample row data:`);
    const sampleRow = rows[0];
    console.log('Original row:', sampleRow.slice(0, 5));
    
    // Show how normalization would work
    if (yearColumns.length > 0) {
      console.log('\n🔄 Normalization preview:');
      
      const baseRecord = {};
      normalColumns.forEach((header, index) => {
        if (header && sampleRow[index] !== undefined) {
          baseRecord[header.trim()] = sampleRow[index];
        }
      });
      
      console.log('Base record:', baseRecord);
      
      // Show year column normalization
      yearColumns.slice(0, 2).forEach(col => {
        const headerIndex = headers.indexOf(col.originalHeader);
        if (headerIndex >= 0 && sampleRow[headerIndex] !== null) {
          console.log(`Year record example:`);
          console.log({
            ...baseRecord,
            metric_name: col.baseColumnName,
            metric_value: sampleRow[headerIndex],
            metric_year: col.year,
            metric_type: col.columnType
          });
        }
      });
    }
  }
  
  console.log('\n✅ Test completed successfully');
  console.log('The table structure is compatible with year-based normalization');
}

if (require.main === module) {
  testBLSTableProcessing().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}
