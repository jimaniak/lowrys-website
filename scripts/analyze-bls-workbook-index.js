#!/usr/bin/env node

/**
 * BLS Occupation Workbook Index Analyzer
 * 
 * This script examines the occupation.xlsx workbook to find:
 * 1. An index sheet with table descriptions
 * 2. Table names and descriptions for better naming
 * 3. Structure of each table for processing
 */

const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function analyzeOccupationWorkbook() {
  const occXlsxPath = path.join(__dirname, '../public/data/occupation.xlsx');
  
  // Download if not exists
  if (!require('fs').existsSync(occXlsxPath)) {
    console.log('📥 Downloading occupation.xlsx...');
    const response = await fetch(process.env.BLS_OCCUPATION_XLSX_URL);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    require('fs').mkdirSync(path.dirname(occXlsxPath), { recursive: true });
    require('fs').writeFileSync(occXlsxPath, buffer);
  }
  
  const workbook = xlsx.readFile(occXlsxPath);
  console.log('📊 BLS Occupation Workbook Analysis');
  console.log('===================================');
  console.log(`Total sheets: ${workbook.SheetNames.length}`);
  console.log(`Sheet names: ${workbook.SheetNames.join(', ')}`);
  
  // Look for index/contents sheet
  const indexSheets = workbook.SheetNames.filter(name => 
    /index|contents|list|table.*list|overview/i.test(name)
  );
  
  console.log(`\n🔍 Potential index sheets: ${indexSheets.join(', ') || 'None found'}`);
  
  // Check each sheet to understand structure
  const tableInfo = {};
  
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n📄 Sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    
    // Get first few rows to understand structure
    const data = xlsx.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: null,
      range: 0  // Start from first row
    });
    
    if (data && data.length > 0) {
      console.log(`  Rows: ${data.length}`);
      console.log(`  First row: ${JSON.stringify(data[0]?.slice(0, 5) || [])}`);
      if (data.length > 1) {
        console.log(`  Second row: ${JSON.stringify(data[1]?.slice(0, 5) || [])}`);
      }
      
      // Look for table descriptions in the first few rows
      const firstFewRows = data.slice(0, 5).flat().filter(Boolean);
      const possibleDescriptions = firstFewRows.filter(cell => 
        typeof cell === 'string' && 
        cell.length > 10 && 
        (cell.toLowerCase().includes('table') || 
         cell.toLowerCase().includes('employment') ||
         cell.toLowerCase().includes('occupation') ||
         cell.toLowerCase().includes('projection'))
      );
      
      if (possibleDescriptions.length > 0) {
        console.log(`  Possible descriptions: ${possibleDescriptions.slice(0, 2).join('; ')}`);
      }
      
      // Check if this looks like a table index
      if (indexSheets.includes(sheetName) || 
          sheetName.toLowerCase().includes('contents') ||
          sheetName.toLowerCase().includes('index')) {
        
        console.log(`  🏷️  Analyzing as potential index sheet...`);
        
        // Look for table numbers and descriptions
        for (let i = 0; i < Math.min(data.length, 20); i++) {
          const row = data[i];
          if (!row) continue;
          
          const rowText = row.join(' ').toLowerCase();
          if (rowText.includes('table') && /1\.\d+/.test(rowText)) {
            console.log(`    Row ${i}: ${row.join(' | ')}`);
            
            // Extract table number and description
            const tableMatch = rowText.match(/table\s*(1\.\d+)[:\s-]*(.*)/i);
            if (tableMatch) {
              const tableNum = tableMatch[1];
              const description = tableMatch[2]?.trim().replace(/[,.\s]+$/, '') || '';
              tableInfo[tableNum] = {
                sheetName,
                description,
                fullText: row.join(' ')
              };
            }
          }
        }
      }
      
      // Check if this looks like a data table (Table 1.x)
      const tableMatch = sheetName.match(/.*1[._](\d+).*/);
      if (tableMatch) {
        const tableNum = `1.${tableMatch[1]}`;
        if (!tableInfo[tableNum]) {
          tableInfo[tableNum] = {};
        }
        tableInfo[tableNum].dataSheet = sheetName;
        tableInfo[tableNum].hasData = true;
        
        // Try to extract description from first few rows
        const descriptionRows = data.slice(0, 3).flat().filter(Boolean);
        const longText = descriptionRows.find(cell => 
          typeof cell === 'string' && cell.length > 20
        );
        if (longText && !tableInfo[tableNum].description) {
          tableInfo[tableNum].description = longText.slice(0, 100);
        }
      }
    }
  }
  
  console.log('\n📋 Table Mapping Found:');
  console.log('========================');
  
  const sortedTables = Object.keys(tableInfo).sort((a, b) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    return aNum - bNum;
  });
  
  for (const tableNum of sortedTables) {
    const info = tableInfo[tableNum];
    console.log(`\nTable ${tableNum}:`);
    console.log(`  Description: ${info.description || 'Not found'}`);
    console.log(`  Data Sheet: ${info.dataSheet || 'Not found'}`);
    console.log(`  Has Data: ${info.hasData ? 'Yes' : 'No'}`);
    if (info.fullText) {
      console.log(`  Full Text: ${info.fullText.slice(0, 200)}...`);
    }
  }
  
  // Generate suggested table names
  console.log('\n🏷️  Suggested Table Names:');
  console.log('===========================');
  
  const tableNameSuggestions = {};
  
  for (const tableNum of sortedTables) {
    const info = tableInfo[tableNum];
    let suggestedName = `table_${tableNum.replace('.', '_')}`;
    
    if (info.description) {
      // Generate name from description
      const desc = info.description.toLowerCase()
        .replace(/table\s*\d+\.\d+[:\s-]*/i, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const words = desc.split(' ').slice(0, 4); // Take first 4 words
      if (words.length > 0) {
        suggestedName = words.join('_');
      }
    }
    
    tableNameSuggestions[tableNum] = suggestedName;
    console.log(`  ${tableNum}: ${suggestedName}`);
    console.log(`    Based on: ${info.description || 'Default naming'}`);
  }
  
  return {
    tableInfo,
    tableNameSuggestions,
    sheetNames: workbook.SheetNames
  };
}

// Run analysis
if (require.main === module) {
  analyzeOccupationWorkbook()
    .then(result => {
      console.log('\n✅ Analysis complete');
      
      // Save results for use in automation script
      const fs = require('fs');
      fs.writeFileSync(
        path.join(__dirname, 'bls-table-mapping.json'),
        JSON.stringify(result, null, 2)
      );
      console.log('💾 Results saved to bls-table-mapping.json');
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { analyzeOccupationWorkbook };
