#!/usr/bin/env node

/**
 * State-level BLS Data Analysis Script
 * Downloads and examines the state_M2023_dl.xlsx workbook to understand:
 * 1. What data types it contains (actual vs forecasted)
 * 2. Regional/state breakdown capabilities
 * 3. Field descriptions and column definitions
 */

const { createClient } = require('@libsql/client');
const unzipper = require('unzipper');
const xlsx = require('xlsx');
require('dotenv').config({ path: '.env.local' });

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

function analyzeStateWorkbook(buffer) {
  console.log('🔍 ANALYZING STATE-LEVEL BLS WORKBOOK');
  console.log('====================================');
  
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  console.log(`📊 Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  // Check for field descriptions tab
  const descriptionSheets = workbook.SheetNames.filter(name => 
    name.toLowerCase().includes('description') || 
    name.toLowerCase().includes('field') ||
    name.toLowerCase().includes('legend') ||
    name.toLowerCase().includes('def')
  );
  
  if (descriptionSheets.length > 0) {
    console.log(`\n📋 FIELD DESCRIPTIONS FOUND:`);
    descriptionSheets.forEach(sheetName => {
      console.log(`\n--- ${sheetName} ---`);
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      data.slice(0, 20).forEach((row, index) => {
        if (row.some(cell => cell)) { // Only show non-empty rows
          console.log(`${index.toString().padStart(2, '0')}: ${row.join(' | ')}`);
        }
      });
    });
  }
  
  // Analyze the main data sheet
  const mainSheet = workbook.SheetNames[0];
  console.log(`\n📄 MAIN DATA SHEET: "${mainSheet}"`);
  
  const worksheet = workbook.Sheets[mainSheet];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  
  if (data.length > 0) {
    const headers = data[0];
    console.log(`\n📋 COLUMN HEADERS (${headers.length} total):`);
    headers.forEach((header, index) => {
      console.log(`   ${index.toString().padStart(2, '0')}: "${header || '[EMPTY]'}"`);
    });
    
    // Look for year-based columns and regional indicators
    console.log(`\n🔍 COLUMN ANALYSIS:`);
    
    const yearColumns = [];
    const regionColumns = [];
    const otherColumns = [];
    
    headers.forEach((header, index) => {
      if (!header) return;
      
      const lowerHeader = header.toLowerCase();
      const hasYear = /\d{4}/.test(header);
      const isRegional = lowerHeader.includes('state') || 
                        lowerHeader.includes('area') ||
                        lowerHeader.includes('region') ||
                        lowerHeader.includes('msa') ||
                        lowerHeader.includes('metropolitan');
      
      if (hasYear) {
        yearColumns.push({ index, header });
      } else if (isRegional) {
        regionColumns.push({ index, header });
      } else {
        otherColumns.push({ index, header });
      }
    });
    
    console.log(`\n   📅 Year-based columns (${yearColumns.length}):`);
    yearColumns.forEach(col => {
      console.log(`      ${col.index.toString().padStart(2, '0')}: "${col.header}"`);
    });
    
    console.log(`\n   🗺️  Regional/Geographic columns (${regionColumns.length}):`);
    regionColumns.forEach(col => {
      console.log(`      ${col.index.toString().padStart(2, '0')}: "${col.header}"`);
    });
    
    console.log(`\n   📝 Other columns (${otherColumns.length}):`);
    otherColumns.slice(0, 10).forEach(col => { // Show first 10 to avoid clutter
      console.log(`      ${col.index.toString().padStart(2, '0')}: "${col.header}"`);
    });
    if (otherColumns.length > 10) {
      console.log(`      ... and ${otherColumns.length - 10} more`);
    }
    
    // Sample first 5 rows
    console.log(`\n📄 SAMPLE DATA (First 5 rows):`);
    const sampleRows = data.slice(1, 6);
    
    sampleRows.forEach((row, rowIndex) => {
      console.log(`\n   Row ${rowIndex + 1}:`);
      
      // Show regional data
      regionColumns.forEach(col => {
        const value = row[col.index];
        if (value !== null && value !== undefined) {
          console.log(`     ${col.header}: "${value}"`);
        }
      });
      
      // Show occupation data
      const occTitleCol = headers.findIndex(h => h && h.toLowerCase().includes('title'));
      const occCodeCol = headers.findIndex(h => h && h.toLowerCase().includes('code'));
      
      if (occTitleCol >= 0 && row[occTitleCol]) {
        console.log(`     Occupation: "${row[occTitleCol]}"`);
      }
      if (occCodeCol >= 0 && row[occCodeCol]) {
        console.log(`     Code: "${row[occCodeCol]}"`);
      }
      
      // Show year-based metrics
      yearColumns.slice(0, 3).forEach(col => { // Show first 3 year columns
        const value = row[col.index];
        if (value !== null && value !== undefined) {
          console.log(`     ${col.header}: ${value}`);
        }
      });
    });
    
    // Check for Missouri data specifically
    console.log(`\n🔍 MISSOURI DATA CHECK:`);
    const missouriRows = data.filter(row => {
      return regionColumns.some(col => {
        const value = row[col.index];
        return value && value.toString().toLowerCase().includes('missouri');
      });
    });
    
    console.log(`   Found ${missouriRows.length} rows with Missouri data`);
    
    if (missouriRows.length > 0) {
      console.log(`\n   Sample Missouri rows:`);
      missouriRows.slice(0, 3).forEach((row, index) => {
        console.log(`\n     Missouri Row ${index + 1}:`);
        regionColumns.forEach(col => {
          const value = row[col.index];
          if (value) console.log(`       ${col.header}: "${value}"`);
        });
        
        const occTitleCol = headers.findIndex(h => h && h.toLowerCase().includes('title'));
        if (occTitleCol >= 0 && row[occTitleCol]) {
          console.log(`       Occupation: "${row[occTitleCol]}"`);
        }
      });
    }
    
    // Check for Project Manager related data
    console.log(`\n🔍 PROJECT MANAGER DATA CHECK:`);
    const projectManagerRows = data.filter(row => {
      const occTitleCol = headers.findIndex(h => h && h.toLowerCase().includes('title'));
      if (occTitleCol >= 0) {
        const title = row[occTitleCol];
        if (title) {
          const titleStr = title.toString().toLowerCase();
          return (titleStr.includes('project') && titleStr.includes('manager')) ||
                 titleStr.includes('project management') ||
                 titleStr.includes('construction manager') ||
                 titleStr.includes('engineering manager') ||
                 titleStr.includes('program manager');
        }
      }
      return false;
    });
    
    console.log(`   Found ${projectManagerRows.length} rows with Project Manager-related data`);
    
    if (projectManagerRows.length > 0) {
      console.log(`\n   Sample Project Manager rows:`);
      projectManagerRows.slice(0, 3).forEach((row, index) => {
        console.log(`\n     PM Row ${index + 1}:`);
        headers.slice(0, 12).forEach((header, headerIndex) => {
          const value = row[headerIndex];
          if (value !== null && value !== undefined && header) {
            console.log(`       ${header}: "${value}"`);
          }
        });
      });
    } else {
      // Search for any manager-related titles
      console.log(`\n   Searching for any manager titles...`);
      const managerRows = data.filter(row => {
        const occTitleCol = headers.findIndex(h => h && h.toLowerCase().includes('title'));
        if (occTitleCol >= 0) {
          const title = row[occTitleCol];
          if (title) {
            const titleStr = title.toString().toLowerCase();
            return titleStr.includes('manager') && !titleStr.includes('general manager');
          }
        }
        return false;
      });
      
      console.log(`   Found ${managerRows.length} manager-related rows`);
      if (managerRows.length > 0) {
        console.log(`   Sample manager titles:`);
        managerRows.slice(0, 5).forEach((row, index) => {
          const occTitleCol = headers.findIndex(h => h && h.toLowerCase().includes('title'));
          if (occTitleCol >= 0 && row[occTitleCol]) {
            console.log(`     ${index + 1}. "${row[occTitleCol]}"`);
          }
        });
      }
    }
  }
  
  console.log(`\n✅ ANALYSIS COMPLETE`);
  console.log(`📊 Total data rows: ${data.length - 1}`);
  
  // Determine if this has forecasted data
  const hasForecasted = sheetHeaders.some(header => {
    if (!header) return false;
    const years = header.match(/\d{4}/g);
    return years && years.some(year => parseInt(year) > CURRENT_BASE_YEAR);
  });
  
  console.log(`🔮 Contains forecasted data: ${hasForecasted ? 'YES' : 'NO'}`);
  console.log(`📅 Base year: ${CURRENT_BASE_YEAR}`);
  
  if (hasForecasted) {
    const futureYears = [];
    sheetHeaders.forEach(header => {
      if (header) {
        const years = header.match(/\d{4}/g);
        if (years) {
          years.forEach(year => {
            const yearNum = parseInt(year);
            if (yearNum > CURRENT_BASE_YEAR && !futureYears.includes(yearNum)) {
              futureYears.push(yearNum);
            }
          });
        }
      }
    });
    console.log(`🔮 Future years found: ${futureYears.sort().join(', ')}`);
  }
}

async function main() {
  try {
    console.log('🚀 STATE-LEVEL BLS DATA ANALYSIS');
    console.log('=================================');
    
    const buffer = await downloadAndExtractXLSX(BLS_OEWS_STATE_ZIP_URL, XLSX_STATE_FILENAME);
    await analyzeStateWorkbook(buffer);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

main();
