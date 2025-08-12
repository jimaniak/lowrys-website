// Script to examine the occupation workbook's index tab and identify all BLS tables
// This will help us determine proper naming conventions for Tables 1.1-1.12

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
require('dotenv').config({ path: '.env.local' });

// Path to the occupation workbook
const OCCUPATION_XLSX_PATH = path.join(__dirname, '../public/data/occupation.xlsx');

function examineWorkbookIndex() {
  console.log('🔍 Examining occupation workbook index tab...\n');
  
  if (!fs.existsSync(OCCUPATION_XLSX_PATH)) {
    console.error('❌ occupation.xlsx not found at:', OCCUPATION_XLSX_PATH);
    console.log('Please download it first using the enhanced automation script or manually place it in public/data/');
    return;
  }

  try {
    const workbook = xlsx.readFile(OCCUPATION_XLSX_PATH);
    
    console.log('📋 All sheet names in workbook:');
    workbook.SheetNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
    console.log();

    // Look for index tab (various naming patterns)
    const indexSheetPatterns = [
      /^index$/i,
      /^contents$/i,
      /^table.*contents$/i,
      /^toc$/i,
      /readme/i
    ];

    let indexSheetName = null;
    for (const pattern of indexSheetPatterns) {
      indexSheetName = workbook.SheetNames.find(name => pattern.test(name));
      if (indexSheetName) break;
    }

    if (!indexSheetName) {
      // If no index found, check the first sheet
      indexSheetName = workbook.SheetNames[0];
      console.log(`⚠️  No explicit index sheet found, using first sheet: ${indexSheetName}`);
    } else {
      console.log(`📑 Found index sheet: ${indexSheetName}`);
    }

    // Read the index sheet
    const indexSheet = workbook.Sheets[indexSheetName];
    const indexData = xlsx.utils.sheet_to_json(indexSheet, { header: 1 });
    
    console.log('\n📊 Index sheet content:');
    console.log('Raw data (first 20 rows):');
    indexData.slice(0, 20).forEach((row, index) => {
      if (row && row.length > 0) {
        console.log(`  Row ${index + 1}: ${JSON.stringify(row)}`);
      }
    });

    // Look for table references
    console.log('\n🔍 Searching for table references...');
    const tableReferences = [];
    
    indexData.forEach((row, rowIndex) => {
      if (row && Array.isArray(row)) {
        row.forEach((cell, colIndex) => {
          if (typeof cell === 'string') {
            // Look for table patterns like "Table 1.1", "1.2", etc.
            const tableMatch = cell.match(/table\s+(\d+\.\d+)/i) || cell.match(/^(\d+\.\d+)/);
            if (tableMatch) {
              tableReferences.push({
                tableNumber: tableMatch[1],
                fullText: cell,
                row: rowIndex + 1,
                col: colIndex + 1,
                adjacentCells: row.slice(Math.max(0, colIndex - 1), colIndex + 3)
              });
            }
          }
        });
      }
    });

    if (tableReferences.length > 0) {
      console.log('\n📋 Found table references:');
      tableReferences.forEach(ref => {
        console.log(`  Table ${ref.tableNumber}: "${ref.fullText}" (Row ${ref.row}, Col ${ref.col})`);
        console.log(`    Adjacent cells: ${JSON.stringify(ref.adjacentCells)}`);
      });
    } else {
      console.log('❌ No table references found in index');
    }

    // Now check which sheets match these table patterns
    console.log('\n🔍 Matching sheets to table references...');
    const tableSheets = new Map();
    
    workbook.SheetNames.forEach(sheetName => {
      // Look for table patterns in sheet names
      const tableMatch = sheetName.match(/(\d+\.\d+)/) || sheetName.match(/table\s+(\d+\.\d+)/i);
      if (tableMatch) {
        tableSheets.set(tableMatch[1], sheetName);
      }
    });

    if (tableSheets.size > 0) {
      console.log('\n📊 Table sheets found:');
      const sortedTables = Array.from(tableSheets.entries()).sort((a, b) => {
        const [majorA, minorA] = a[0].split('.').map(Number);
        const [majorB, minorB] = b[0].split('.').map(Number);
        if (majorA !== majorB) return majorA - majorB;
        return minorA - minorB;
      });
      
      sortedTables.forEach(([tableNum, sheetName]) => {
        console.log(`  Table ${tableNum}: Sheet "${sheetName}"`);
      });

      // Examine the structure of each table
      console.log('\n🔍 Examining table structures...');
      sortedTables.forEach(([tableNum, sheetName]) => {
        console.log(`\n--- Table ${tableNum} (${sheetName}) ---`);
        
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        
        // Show first few rows to understand structure
        console.log('First 5 rows:');
        data.slice(0, 5).forEach((row, index) => {
          if (row && row.length > 0) {
            console.log(`  Row ${index + 1}: ${JSON.stringify(row.slice(0, 5))}${row.length > 5 ? '...' : ''}`);
          }
        });

        // Look for year-based columns
        if (data.length > 0) {
          const headers = data[0] || [];
          const yearColumns = headers.filter(header => 
            typeof header === 'string' && /\b(20\d{2}|19\d{2})\b/.test(header)
          );
          if (yearColumns.length > 0) {
            console.log(`  📅 Year-based columns found: ${yearColumns.join(', ')}`);
          }
        }
      });

    } else {
      console.log('❌ No table sheets found');
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`Total sheets: ${workbook.SheetNames.length}`);
    console.log(`Table references in index: ${tableReferences.length}`);
    console.log(`Table sheets identified: ${tableSheets.size}`);
    
    if (tableSheets.size > 0) {
      console.log('\n📊 Recommended table processing order:');
      const sortedTables = Array.from(tableSheets.entries()).sort((a, b) => {
        const [majorA, minorA] = a[0].split('.').map(Number);
        const [majorB, minorB] = b[0].split('.').map(Number);
        if (majorA !== majorB) return majorA - majorB;
        return minorA - minorB;
      });
      
      sortedTables.forEach(([tableNum, sheetName]) => {
        const normalizedTableName = `bls_table_${tableNum.replace('.', '_')}`;
        console.log(`  Table ${tableNum}: ${sheetName} → ${normalizedTableName}`);
      });
    }

  } catch (error) {
    console.error('❌ Error reading workbook:', error.message);
  }
}

// Export for use in other scripts
function getTableSheetMapping() {
  if (!fs.existsSync(OCCUPATION_XLSX_PATH)) {
    throw new Error(`occupation.xlsx not found at: ${OCCUPATION_XLSX_PATH}`);
  }

  const workbook = xlsx.readFile(OCCUPATION_XLSX_PATH);
  const tableSheets = new Map();
  
  workbook.SheetNames.forEach(sheetName => {
    const tableMatch = sheetName.match(/(\d+\.\d+)/) || sheetName.match(/table\s+(\d+\.\d+)/i);
    if (tableMatch) {
      tableSheets.set(tableMatch[1], sheetName);
    }
  });

  return tableSheets;
}

// Run if called directly
if (require.main === module) {
  examineWorkbookIndex();
}

module.exports = {
  examineWorkbookIndex,
  getTableSheetMapping
};
