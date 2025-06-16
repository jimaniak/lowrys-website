const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Year-flexible column patterns for BLS data
const COLUMN_PATTERNS = {
  socCode: [
    /^soc\s*code$/i,
    /^soc$/i,
    /^code$/i,
    /^occupation\s*code$/i,
    /^occ_code$/i,
    /^occ\s*code$/i
  ],
  occupation: [
    /^occupation$/i,
    /^occupation\s*title$/i,
    /^title$/i,
    /^occ_title$/i
  ],
  // Flexible patterns for projection years (2023-33, 2024-34, etc.)
  projectedEmployment: [
    /^20\d{2}$/,  // Matches 2032, 2033, 2034, etc.
    /^projected\s*20\d{2}$/i,
    /^employment\s*20\d{2}$/i
  ],
  baseEmployment: [
    /^20\d{2}$/,  // Matches 2022, 2023, 2024, etc. (base year)
    /^base\s*20\d{2}$/i,
    /^employment\s*20\d{2}$/i
  ],
  change: [
    /^change.*20\d{2}.*20\d{2}$/i,  // Matches "Change, 2023-33" or similar
    /^numeric\s*change/i,
    /^employment\s*change/i
  ],
  percentChange: [
    /^percent.*change.*20\d{2}.*20\d{2}$/i,  // Matches "Percent change, 2023-33"
    /^%.*change/i,
    /^growth\s*rate/i
  ],
  openings: [
    /^annual.*openings.*20\d{2}.*20\d{2}$/i,  // Matches "Annual average openings, 2023-33"
    /^openings/i,
    /^job\s*openings/i
  ],
  education: [
    /^typical\s*education/i,
    /^education\s*needed/i,
    /^education\s*required/i,
    /^entry\s*education/i
  ],
  experience: [
    /^work\s*experience/i,
    /^experience\s*required/i,
    /^related\s*experience/i
  ],
  training: [
    /^on.*job\s*training/i,
    /^training/i,
    /^preparation/i
  ]
};

// Function to find column by pattern
function findColumnByPattern(headers, patterns) {
  for (const pattern of patterns) {
    const found = headers.find(header => pattern.test(header));
    if (found) return found;
  }
  return null;
}

// Function to find all columns matching a pattern (for years)
function findAllColumnsByPattern(headers, patterns) {
  const matches = [];
  for (const pattern of patterns) {
    const found = headers.filter(header => pattern.test(header));
    matches.push(...found);
  }
  return matches;
}

// Function to determine which year columns are base vs projected
function categorizeYearColumns(yearColumns) {
  const years = yearColumns
    .map(col => {
      const match = col.match(/20(\d{2})/);
      return match ? parseInt('20' + match[1]) : null;
    })
    .filter(year => year !== null)
    .sort();
  
  if (years.length >= 2) {
    return {
      baseYear: Math.min(...years),
      projectedYear: Math.max(...years),
      baseColumn: yearColumns.find(col => col.includes(Math.min(...years).toString())),
      projectedColumn: yearColumns.find(col => col.includes(Math.max(...years).toString()))
    };
  }
  
  return null;
}

// Function to normalize SOC code
function normalizeSocCode(code) {
  if (!code) return '';
  return code.toString().trim().replace(/\u2013|\u2014|–|—/g, '-');
}

// Function to detect and skip description rows
function findHeaderRow(sheet) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  
  // Check up to 10 rows to find headers
  for (let i = 0; i <= Math.min(10, range.e.r); i++) {
    const rowData = xlsx.utils.sheet_to_json(sheet, { range: i, header: 1, defval: '' });
    const keys = Object.keys(rowData[0] || {});
    
    console.log(`    Row ${i} keys:`, keys.slice(0, 5)); // Show first 5 keys for debugging
    
    // Skip completely empty rows
    if (keys.length === 0 || keys.every(key => !key || key.trim() === '')) {
      continue;
    }
    
    // Look for SOC code patterns (more flexible)
    const hasSOCCode = keys.some(key => {
      const keyStr = key.toString().trim();
      return /soc|code|occupation/i.test(keyStr) && keyStr.length > 1;
    });
    
    // Look for typical BLS data columns
    const hasDataColumns = keys.some(key => {
      const keyStr = key.toString().trim().toLowerCase();
      return keyStr.includes('employment') || 
             keyStr.includes('change') || 
             keyStr.includes('percent') || 
             keyStr.includes('openings') || 
             keyStr.includes('education') ||
             /20\d{2}/.test(keyStr); // Contains year like 2023, 2033
    });
    
    // Must have multiple meaningful columns
    const meaningfulKeys = keys.filter(key => key && key.toString().trim().length > 1);
    const hasMultipleColumns = meaningfulKeys.length >= 3;
    
    console.log(`    Row ${i}: SOC=${hasSOCCode}, Data=${hasDataColumns}, Cols=${hasMultipleColumns} (${meaningfulKeys.length})`);
    
    if (hasSOCCode && hasDataColumns && hasMultipleColumns) {
      console.log(`    Found header row at ${i}`);
      return i;
    }
  }
  
  console.log(`    No header row found, trying fallback approach`);
  
  // Fallback: look for any row with "SOC" or "Code" in column headers
  for (let i = 0; i <= Math.min(10, range.e.r); i++) {
    const rowData = xlsx.utils.sheet_to_json(sheet, { range: i, header: 1, defval: '' });
    const keys = Object.keys(rowData[0] || {});
    
    const hasAnyCode = keys.some(key => {
      const keyStr = key.toString().trim().toLowerCase();
      return keyStr.includes('soc') || keyStr.includes('code');
    });
    
    if (hasAnyCode && keys.length >= 2) {
      console.log(`    Using fallback header row at ${i}`);
      return i;
    }
  }
  
  return -1;
}

// Enhanced data extraction to capture all important fields from each BLS table
function extractTableData(row, headers, sheetName) {
  const data = { tableSource: sheetName };
  
  // Map important data fields based on BLS table structure
  const fieldMappings = {
    // Employment and projections data
    employment: findColumnByPattern(headers, /employment|jobs/i),
    employment_2023: findColumnByPattern(headers, /2023.*employment|employment.*2023/i),
    employment_2033: findColumnByPattern(headers, /2033.*employment|employment.*2033/i),
    employment_change: findColumnByPattern(headers, /change.*employment|employment.*change/i),
    employment_change_numeric: findColumnByPattern(headers, /numeric.*change|change.*numeric/i),
    employment_change_percent: findColumnByPattern(headers, /percent.*change|change.*percent/i),
    
    // Job openings and growth
    annual_openings: findColumnByPattern(headers, /annual.*opening|opening.*annual/i),
    total_openings: findColumnByPattern(headers, /total.*opening|opening.*total/i),
    replacement_openings: findColumnByPattern(headers, /replacement.*opening/i),
    growth_openings: findColumnByPattern(headers, /growth.*opening/i),
    
    // Growth rates and rankings
    growth_rate: findColumnByPattern(headers, /growth.*rate|rate.*growth/i),
    growth_rank: findColumnByPattern(headers, /growth.*rank|rank.*growth/i),
    fastest_growing: findColumnByPattern(headers, /fastest.*grow/i),
    fastest_declining: findColumnByPattern(headers, /fastest.*declin/i),
    
    // Education and training requirements
    education: findColumnByPattern(headers, /education.*need|typical.*education/i),
    training: findColumnByPattern(headers, /training.*need|typical.*training/i),
    experience: findColumnByPattern(headers, /experience.*need|work.*experience/i),
    
    // Wages and income data
    median_annual_wage: findColumnByPattern(headers, /median.*annual.*wage|annual.*median.*wage/i),
    mean_annual_wage: findColumnByPattern(headers, /mean.*annual.*wage|average.*annual.*wage/i),
    wage_percentile_10: findColumnByPattern(headers, /10th.*percentile|percentile.*10/i),
    wage_percentile_25: findColumnByPattern(headers, /25th.*percentile|percentile.*25/i),
    wage_percentile_75: findColumnByPattern(headers, /75th.*percentile|percentile.*75/i),
    wage_percentile_90: findColumnByPattern(headers, /90th.*percentile|percentile.*90/i),
    
    // Industry and geographic data
    industry: findColumnByPattern(headers, /industry/i),
    industry_title: findColumnByPattern(headers, /industry.*title/i),
    geographic_area: findColumnByPattern(headers, /geographic|area.*title|location/i),
    
    // Occupation characteristics
    occupation_title: findColumnByPattern(headers, /occupation.*title|title/i),
    occupation_group: findColumnByPattern(headers, /occupation.*group|major.*group/i),
    occupation_category: findColumnByPattern(headers, /category|classification/i),
    
    // Special flags and indicators
    stem_occupation: findColumnByPattern(headers, /stem/i),
    green_occupation: findColumnByPattern(headers, /green/i),
    bright_outlook: findColumnByPattern(headers, /bright.*outlook/i),
    
    // Separations and turnover data
    total_separations: findColumnByPattern(headers, /total.*separation/i),
    quits: findColumnByPattern(headers, /quit/i),
    layoffs: findColumnByPattern(headers, /layoff/i),
    other_separations: findColumnByPattern(headers, /other.*separation/i),
    
    // Occupational utilization and factors
    utilization_factor: findColumnByPattern(headers, /utilization.*factor/i),
    occupational_factor: findColumnByPattern(headers, /occupational.*factor/i)
  };
  
  // Extract data for each mapped field
  Object.entries(fieldMappings).forEach(([key, columnName]) => {
    if (columnName && row[columnName] !== undefined && row[columnName] !== '') {
      data[key] = row[columnName];
    }
  });
  
  // Add sheet-specific enhancements based on BLS table types
  if (sheetName.includes('1.1') || sheetName.toLowerCase().includes('employment')) {
    data.tableType = 'employment_by_major_group';
  } else if (sheetName.includes('1.2') || sheetName.toLowerCase().includes('projection')) {
    data.tableType = 'occupational_projections';
    data.isProjectionData = true;
  } else if (sheetName.includes('1.3') || sheetName.toLowerCase().includes('fastest.*grow')) {
    data.tableType = 'fastest_growing';
    data.isFastestGrowing = true;
  } else if (sheetName.includes('1.4') || sheetName.toLowerCase().includes('most.*opening')) {
    data.tableType = 'most_openings';
    data.hasMostOpenings = true;
  } else if (sheetName.includes('1.5') || sheetName.toLowerCase().includes('fastest.*declin')) {
    data.tableType = 'fastest_declining';
    data.isFastestDeclining = true;
  } else if (sheetName.includes('1.6') || sheetName.toLowerCase().includes('largest.*decline')) {
    data.tableType = 'largest_declines';
    data.hasLargestDecline = true;
  } else if (sheetName.includes('1.7') || sheetName.toLowerCase().includes('worker.*character')) {
    data.tableType = 'worker_characteristics';
  } else if (sheetName.includes('1.8') || sheetName.toLowerCase().includes('industry.*matrix')) {
    data.tableType = 'industry_matrix';
  } else if (sheetName.includes('1.9') || sheetName.toLowerCase().includes('industry.*occupation')) {
    data.tableType = 'industry_occupation_matrix';
  } else if (sheetName.includes('1.10') || sheetName.toLowerCase().includes('separation')) {
    data.tableType = 'separations_and_openings';
  } else if (sheetName.includes('1.11') || sheetName.toLowerCase().includes('stem')) {
    data.tableType = 'stem_occupations';
    data.isStem = true;
  } else if (sheetName.includes('1.12') || sheetName.toLowerCase().includes('utilization')) {
    data.tableType = 'utilization_factors';
  }
  
  return data;
}

// Main function to process occupation data
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
  
  // Store all occupation data by SOC code
  const occupationData = new Map();
  
  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n=== Processing sheet: ${sheetName} ===`);
    
    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet['!ref']) {
      console.log(`  Sheet ${sheetName} is empty`);
      continue;
    }
    
    // Find the header row
    const headerRowIndex = findHeaderRow(sheet);
    
    if (headerRowIndex === -1) {
      console.log(`  Could not find header row in sheet ${sheetName}`);
      continue;
    }
    
    console.log(`  Found header row at index ${headerRowIndex}`);
    
    // Extract data starting from header row
    const data = xlsx.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: '' });
    
    if (data.length === 0) {
      console.log(`  No data rows found in sheet ${sheetName}`);
      continue;
    }
    
    const headers = Object.keys(data[0]);
    console.log(`  Headers:`, headers);
    
    // Find relevant columns using flexible patterns
    const columns = {
      socCode: findColumnByPattern(headers, COLUMN_PATTERNS.socCode),
      occupation: findColumnByPattern(headers, COLUMN_PATTERNS.occupation),
      change: findColumnByPattern(headers, COLUMN_PATTERNS.change),
      percentChange: findColumnByPattern(headers, COLUMN_PATTERNS.percentChange),
      openings: findColumnByPattern(headers, COLUMN_PATTERNS.openings),
      education: findColumnByPattern(headers, COLUMN_PATTERNS.education),
      experience: findColumnByPattern(headers, COLUMN_PATTERNS.experience),
      training: findColumnByPattern(headers, COLUMN_PATTERNS.training)
    };
    
    // Handle year columns specially
    const yearColumns = findAllColumnsByPattern(headers, COLUMN_PATTERNS.projectedEmployment.concat(COLUMN_PATTERNS.baseEmployment));
    const yearInfo = categorizeYearColumns(yearColumns);
    
    if (yearInfo) {
      columns.baseEmployment = yearInfo.baseColumn;
      columns.projectedEmployment = yearInfo.projectedColumn;
      console.log(`  Detected years: ${yearInfo.baseYear} -> ${yearInfo.projectedYear}`);
    }
    
    console.log(`  Mapped columns:`, columns);
    
    if (!columns.socCode) {
      console.log(`  No SOC code column found in sheet ${sheetName}`);
      continue;
    }
    
    // Process each row
    let processedCount = 0;
    for (const row of data) {
      const socCode = normalizeSocCode(row[columns.socCode]);
      
      if (!socCode || !/^\d{2}-\d{4}$/.test(socCode)) {
        continue;
      }
      
      // Store or merge data for this SOC code
      if (!occupationData.has(socCode)) {
        occupationData.set(socCode, { sheets: {} });
      }
      
      const existing = occupationData.get(socCode);
      
      // Create structured data for this sheet
      const sheetData = {
        occupation: columns.occupation ? row[columns.occupation] : null,
        baseEmployment: columns.baseEmployment ? row[columns.baseEmployment] : null,
        projectedEmployment: columns.projectedEmployment ? row[columns.projectedEmployment] : null,
        change: columns.change ? row[columns.change] : null,
        percentChange: columns.percentChange ? row[columns.percentChange] : null,
        openings: columns.openings ? row[columns.openings] : null,
        education: columns.education ? row[columns.education] : null,
        experience: columns.experience ? row[columns.experience] : null,
        training: columns.training ? row[columns.training] : null,
        rawData: row
      };
      
      existing.sheets[sheetName] = sheetData;
      processedCount++;
    }
    
    console.log(`  Processed ${processedCount} rows from ${sheetName}`);
  }
  
  console.log(`\nTotal unique SOC codes found: ${occupationData.size}`);
  
  // Check if we have data for 11-3021
  if (occupationData.has('11-3021')) {
    console.log('\n=== Found data for 11-3021 ===');
    const data = occupationData.get('11-3021');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('\nNo data found for 11-3021');
    // Check similar codes
    const similarCodes = Array.from(occupationData.keys()).filter(code => code.startsWith('11-30'));
    console.log('Similar codes found:', similarCodes);
  }
  
  // Load existing hierarchical data
  console.log('\nLoading hierarchical BLS data...');
  const hierarchicalData = JSON.parse(fs.readFileSync(hierarchicalPath, 'utf8'));
  
  // Merge occupation data into hierarchical structure
  console.log('Merging occupation data into hierarchical structure...');
  let mergedCount = 0;
  
  function mergeIntoHierarchy(obj) {
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
                      
                      // Extract projections from the most relevant sheet (usually Table 1.2)
                      let projections = null;
                      const relevantSheets = ['Table 1.2', 'Table1.2', '1.2', 'Projections'];
                      
                      for (const sheetName of relevantSheets) {
                        if (occData.sheets[sheetName]) {
                          const sheet = occData.sheets[sheetName];
                          projections = {
                            projected_2022: sheet.baseEmployment,
                            projected_2032: sheet.projectedEmployment,
                            projected_change: sheet.change,
                            projected_percent: sheet.percentChange,
                            projected_openings: sheet.openings,
                            typical_education: sheet.education,
                            work_experience: sheet.experience,
                            on_job_training: sheet.training,
                            summary: sheet.occupation
                          };
                          break;
                        }
                      }
                      
                      // If no specific sheet found, use the first available
                      if (!projections) {
                        const firstSheet = Object.values(occData.sheets)[0];
                        if (firstSheet) {
                          projections = {
                            projected_2022: firstSheet.baseEmployment,
                            projected_2032: firstSheet.projectedEmployment,
                            projected_change: firstSheet.change,
                            projected_percent: firstSheet.percentChange,
                            projected_openings: firstSheet.openings,
                            typical_education: firstSheet.education,
                            work_experience: firstSheet.experience,
                            on_job_training: firstSheet.training,
                            summary: firstSheet.occupation
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
  }
  
  mergeIntoHierarchy(hierarchicalData);
  
  console.log(`\nMerged occupation data for ${mergedCount} detailed occupations`);
  
  // Write the merged data
  fs.writeFileSync(outputPath, JSON.stringify(hierarchicalData, null, 2));
  console.log('Merged data written to:', outputPath);
  
  console.log('\nProcessing complete!');
}

// Run the processing
processOccupationData();
