const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Function to get raw cell values directly from a row
function getRawRowValues(sheet, rowIndex) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  const rowValues = [];
  
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = xlsx.utils.encode_cell({ r: rowIndex, c: col });
    const cell = sheet[cellRef];
    const value = cell ? (cell.v || cell.w || '') : '';
    rowValues.push(value.toString().trim());
  }
  
  return rowValues;
}

// Function to find header row by examining raw cell values
function findHeaderRow(sheet) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  
  console.log(`    Scanning ${Math.min(15, range.e.r + 1)} rows for headers...`);
  
  for (let i = 0; i <= Math.min(15, range.e.r); i++) {
    const rawValues = getRawRowValues(sheet, i);
    const nonEmptyValues = rawValues.filter(v => v !== '');
    
    if (nonEmptyValues.length === 0) continue;
    
    console.log(`    Row ${i}:`, nonEmptyValues.slice(0, 6).join(' | '));
    
    // Look for SOC code pattern
    const hasSOCCode = nonEmptyValues.some(value => 
      /soc.*code|^soc$|^code$/i.test(value)
    );
    
    // Look for typical BLS headers
    const hasTypicalHeaders = nonEmptyValues.some(value => 
      /occupation|employment|change|percent|openings|education|2023|2033/i.test(value)
    );
    
    const hasEnoughColumns = nonEmptyValues.length >= 4;
    
    console.log(`      SOC=${hasSOCCode}, Headers=${hasTypicalHeaders}, Cols=${hasEnoughColumns} (${nonEmptyValues.length})`);
    
    if ((hasSOCCode || hasTypicalHeaders) && hasEnoughColumns) {
      console.log(`    ✓ Found header row at index ${i}`);
      return { rowIndex: i, headers: nonEmptyValues };
    }
  }
  
  console.log(`    ✗ No clear header row found`);
  return null;
}

// Function to process data using raw cell access
function processSheetData(sheet, headerInfo) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  const data = [];
  
  // Start from the row after headers
  for (let row = headerInfo.rowIndex + 1; row <= range.e.r; row++) {
    const rawValues = getRawRowValues(sheet, row);
    const rowData = {};
    
    // Map values to headers
    for (let col = 0; col < Math.min(rawValues.length, headerInfo.headers.length); col++) {
      if (headerInfo.headers[col]) {
        rowData[headerInfo.headers[col]] = rawValues[col];
      }
    }
    
    // Only include rows with meaningful data
    const nonEmptyValues = Object.values(rowData).filter(v => v && v.toString().trim() !== '');
    if (nonEmptyValues.length >= 2) {
      data.push(rowData);
    }
  }
  
  return data;
}

// Function to find SOC code column
function findSOCCodeColumn(headers) {
  const socPatterns = [
    /soc.*code/i, 
    /^soc$/i, 
    /^code$/i, 
    /occupation.*code/i,
    /national.*employment.*matrix.*code/i,  // For BLS format
    /matrix.*code/i,
    /employment.*matrix.*occupation.*code/i
  ];
  
  for (const pattern of socPatterns) {
    const found = headers.find(header => pattern.test(header));
    if (found) return found;
  }
  
  return null;
}

// Function to normalize SOC code
function normalizeSocCode(code) {
  if (!code) return '';
  return code.toString().trim().replace(/\u2013|\u2014|–|—/g, '-');
}

// Main processing function
function processOccupationData() {
  const occupationPath = path.join(__dirname, '../public/data/occupation.xlsx');
  const hierarchicalPath = path.join(__dirname, '../public/data/bls-benchmarks-hierarchical.json');
  const outputPath = path.join(__dirname, '../public/data/bls-benchmarks-hierarchical-with-projections.json');
  
  if (!fs.existsSync(occupationPath)) {
    console.error('Occupation file not found:', occupationPath);
    return;
  }
  
  if (!fs.existsSync(hierarchicalPath)) {
    console.error('Hierarchical BLS data not found:', hierarchicalPath);
    return;
  }
  
  console.log('Reading occupation data from:', occupationPath);
  const workbook = xlsx.readFile(occupationPath);
  
  console.log('Available sheets:', workbook.SheetNames);
  
  const occupationData = new Map();
  
  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n=== Processing sheet: ${sheetName} ===`);
    
    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet['!ref']) {
      console.log(`  Sheet ${sheetName} is empty`);
      continue;
    }
    
    // Find header row using raw cell access
    const headerInfo = findHeaderRow(sheet);
    
    if (!headerInfo) {
      console.log(`  Could not find header row in sheet ${sheetName}`);
      continue;
    }
    
    console.log(`  Headers found:`, headerInfo.headers);
    
    // Process the data
    const data = processSheetData(sheet, headerInfo);
    console.log(`  Found ${data.length} data rows`);
    
    if (data.length === 0) {
      continue;
    }
    
    // Find SOC code column
    const socColumn = findSOCCodeColumn(headerInfo.headers);
    
    if (!socColumn) {
      console.log(`  No SOC code column found. Available columns:`, headerInfo.headers);
      continue;
    }
    
    console.log(`  Using SOC code column: ${socColumn}`);
    
    // Process each data row
    let processedCount = 0;
    for (const row of data) {
      const socCode = normalizeSocCode(row[socColumn]);
      
      if (!socCode || !/^\d{2}-\d{4}$/.test(socCode)) {
        continue;
      }
      
      // Store data for this SOC code
      if (!occupationData.has(socCode)) {
        occupationData.set(socCode, { sheets: {} });
      }
      
      const existing = occupationData.get(socCode);
      existing.sheets[sheetName] = row;
      processedCount++;
    }
    
    console.log(`  Processed ${processedCount} valid SOC codes from ${sheetName}`);
  }
  
  console.log(`\nTotal unique SOC codes found: ${occupationData.size}`);
  
  // Check for our target code
  if (occupationData.has('11-3021')) {
    console.log('\n=== Found data for 11-3021 ===');
    const data = occupationData.get('11-3021');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('\nNo data found for 11-3021');
    const similarCodes = Array.from(occupationData.keys()).filter(code => code.startsWith('11-30'));
    console.log('Similar codes found:', similarCodes);
    
    // Show a few examples of what we did find
    const allCodes = Array.from(occupationData.keys()).slice(0, 10);
    console.log('Sample codes found:', allCodes);
  }
  
  // Load hierarchical data and merge
  if (occupationData.size > 0) {
    console.log('\nLoading hierarchical BLS data...');
    const hierarchicalData = JSON.parse(fs.readFileSync(hierarchicalPath, 'utf8'));
    
    // Merge function
    function mergeIntoHierarchy(obj) {
      let mergedCount = 0;
      
      for (const [dateKey, dateData] of Object.entries(obj)) {
        for (const [majorCode, majorData] of Object.entries(dateData)) {
          if (majorData.minor_groups) {
            for (const [minorCode, minorData] of Object.entries(majorData.minor_groups)) {
              if (minorData.broad_occupations) {
                for (const [broadCode, broadData] of Object.entries(minorData.broad_occupations)) {
                  if (broadData.detailed_occupations) {
                    for (const [detailedCode, detailedData] of Object.entries(broadData.detailed_occupations)) {
                      const normalizedCode = normalizeSocCode(detailedCode);
                      if (occupationData.has(normalizedCode)) {
                        const occData = occupationData.get(normalizedCode);
                          // Add projections from the most relevant sheet
                        const relevantSheets = ['Table 1.2', 'Table1.2', '1.2'];
                        let projections = null;
                        
                        for (const sheetName of relevantSheets) {
                          if (occData.sheets[sheetName]) {
                            const sheet = occData.sheets[sheetName];
                            projections = {
                              summary: sheet['2023 National Employment Matrix title'] || sheet.Occupation || sheet.occupation || sheet.Title,
                              projected_2023: sheet['Employment, 2023'],
                              projected_2033: sheet['Employment, 2033'],
                              projected_change: sheet['Employment change, numeric, 2023-33'] || sheet['Change, 2023-33'] || sheet['Numeric change'] || sheet['Change'],
                              projected_percent: sheet['Employment change, percent, 2023-33'] || sheet['Percent change, 2023-33'] || sheet['Percent change'],
                              projected_openings: sheet['Occupational openings, 2023-33 annual average'] || sheet['Annual average openings, 2023-33'] || sheet['Openings'],
                              typical_education: sheet['Typical education needed for entry'] || sheet['Education'],
                              work_experience: sheet['Work experience in a related occupation'] || sheet['Experience'],
                              on_job_training: sheet['Typical on-the-job training needed to attain competency in the occupation'] || sheet['Training'],
                              median_wage: sheet['Median annual wage, dollars, 2024[1]'] || sheet['Median annual wage, dollars, 2023[1]']
                            };
                            break;
                          }
                        }
                        
                        // If no Table 1.2 data, use any other sheet data
                        if (!projections) {
                          const firstSheet = Object.values(occData.sheets)[0];
                          if (firstSheet) {
                            projections = {
                              summary: firstSheet['2023 National Employment Matrix title'] || firstSheet['2023 National Employment Matrix occupation title'] || firstSheet.occupation,
                              projected_2023: firstSheet['Employment, 2023'],
                              projected_2033: firstSheet['Employment, 2033'],
                              projected_change: firstSheet['Employment change, numeric, 2023-33'] || firstSheet['Employment change, numeric, 2023–33'],
                              projected_percent: firstSheet['Employment change, percent, 2023-33'] || firstSheet['Employment change, percent, 2023–33'],
                              projected_openings: firstSheet['Occupational openings, 2023-33 annual average'] || firstSheet['Occupational openings, 2023–33 annual average'],
                              typical_education: firstSheet['Typical education needed for entry'],
                              work_experience: firstSheet['Work experience in a related occupation'],
                              on_job_training: firstSheet['Typical on-the-job training needed to attain competency in the occupation'],
                              median_wage: firstSheet['Median annual wage, dollars, 2024[1]'] || firstSheet['Median annual wage, dollars, 2023[1]'],
                              factors: firstSheet['Factors affecting occupational utilization']
                            };
                          }
                        }
                        
                        if (projections) {
                          detailedData.projections = projections;
                          detailedData.occupationData = occData;
                          mergedCount++;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      return mergedCount;
    }
    
    const mergedCount = mergeIntoHierarchy(hierarchicalData);
    console.log(`Merged occupation data for ${mergedCount} detailed occupations`);
    
    // Write merged data
    fs.writeFileSync(outputPath, JSON.stringify(hierarchicalData, null, 2));
    console.log('Merged data written to:', outputPath);
  }
  
  console.log('\nProcessing complete!');
}

// Run the processing
processOccupationData();
