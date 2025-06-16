const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Function to safely convert Excel data to number
function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[,$]/g, ''));
    return isNaN(num) ? null : num;
  }
  return null;
}

// Function to safely convert Excel data to string
function toString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

// Function to process a worksheet and extract data
function processWorksheet(worksheet, sheetName) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (jsonData.length < 2) return [];
  
  const headers = jsonData[0];
  const data = [];
  
  // Find the occupation code column (usually first column)
  const codeColumnIndex = headers.findIndex(h => 
    h && (h.toString().toLowerCase().includes('code') || h.toString().toLowerCase().includes('soc'))
  );
  
  if (codeColumnIndex === -1) {
    console.warn(`No code column found in sheet: ${sheetName}`);
    return [];
  }
  
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    const code = toString(row[codeColumnIndex]);
    
    if (!code || code.length < 7) continue; // Skip invalid codes
    
    const rowData = {
      code: code,
      sheetName: sheetName
    };
    
    // Map headers to data
    headers.forEach((header, index) => {
      if (index !== codeColumnIndex && header) {
        const key = header.toString().toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        
        let value = row[index];
        
        // Try to convert to number for numeric fields
        if (key.includes('percent') || key.includes('change') || key.includes('opening') || 
            key.includes('2022') || key.includes('2032') || key.includes('employment')) {
          const numValue = toNumber(value);
          if (numValue !== null) {
            value = numValue;
          }
        } else {
          value = toString(value);
        }
        
        rowData[key] = value;
      }
    });
    
    data.push(rowData);
  }
  
  return data;
}

// Main function to process occupation data
function processOccupationData() {
  const occupationFile = path.join(__dirname, '..', 'public', 'data', 'occupation.xlsx');
  const hierarchicalFile = path.join(__dirname, '..', 'public', 'data', 'bls-benchmarks-hierarchical.json');
  const outputFile = path.join(__dirname, '..', 'public', 'data', 'bls-benchmarks-hierarchical-with-projections.json');
  
  if (!fs.existsSync(occupationFile)) {
    console.error('Occupation file not found:', occupationFile);
    return;
  }
  
  if (!fs.existsSync(hierarchicalFile)) {
    console.error('Hierarchical file not found:', hierarchicalFile);
    return;
  }
  
  console.log('Processing occupation data...');
  
  // Read the Excel file
  const workbook = XLSX.readFile(occupationFile);
  const allOccupationData = new Map();
  
  // Process each worksheet
  workbook.SheetNames.forEach(sheetName => {
    console.log(`Processing sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = processWorksheet(worksheet, sheetName);
    
    sheetData.forEach(item => {
      const code = item.code;
      if (!allOccupationData.has(code)) {
        allOccupationData.set(code, {});
      }
      
      // Merge data from this sheet
      const existing = allOccupationData.get(code);
      Object.assign(existing, item);
    });
  });
  
  console.log(`Processed ${allOccupationData.size} occupation records`);
  
  // Read the hierarchical BLS data
  const hierarchicalData = JSON.parse(fs.readFileSync(hierarchicalFile, 'utf8'));
  
  // Function to recursively merge projections data
  function mergeProjections(obj) {
    if (obj.detailed_occupations) {
      for (const [code, occupation] of Object.entries(obj.detailed_occupations)) {
        if (allOccupationData.has(code)) {
          const projectionData = allOccupationData.get(code);
          
          // Create projections object
          const projections = {};
          
          // Map common projection fields
          const fieldMappings = {
            'projected_percent': ['projected_percent_change', 'percent_change', 'growth_rate'],
            'projected_change': ['projected_change', 'numeric_change', 'employment_change'],
            'projected_openings': ['projected_openings', 'annual_openings', 'openings'],
            'projected_2022': ['employment_2022', '2022_employment', 'base_employment'],
            'projected_2032': ['employment_2032', '2032_employment', 'projected_employment'],
            'typical_education': ['typical_education', 'education_level', 'education_required'],
            'work_experience': ['work_experience', 'experience_required'],
            'on_the_job_training': ['on_the_job_training', 'training_required']
          };
          
          // Try to find matching fields
          Object.keys(projectionData).forEach(key => {
            if (key === 'code' || key === 'sheetName') return;
            
            // Direct mapping
            if (fieldMappings[key]) {
              projections[key] = projectionData[key];
            } else {
              // Try to find best match
              for (const [targetKey, sourceKeys] of Object.entries(fieldMappings)) {
                if (sourceKeys.includes(key)) {
                  projections[targetKey] = projectionData[key];
                  break;
                }
              }
            }
          });
          
          // Add projections to occupation if we found any data
          if (Object.keys(projections).length > 0) {
            occupation.projections = projections;
          }
          
          // Check for special flags (fastest growing/declining)
          if (projectionData.sheetName) {
            const sheetName = projectionData.sheetName.toLowerCase();
            if (sheetName.includes('fastest') || sheetName.includes('growing')) {
              occupation.fastestGrowing = true;
            }
            if (sheetName.includes('declining') || sheetName.includes('decline')) {
              occupation.fastestDeclining = true;
            }
          }
        }
      }
    }
    
    // Recursively process nested objects
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        mergeProjections(value);
      }
    }
  }
  
  // Merge projections data into hierarchical structure
  console.log('Merging projections data...');
  for (const [refreshDate, data] of Object.entries(hierarchicalData)) {
    mergeProjections(data);
  }
  
  // Write the merged data
  fs.writeFileSync(outputFile, JSON.stringify(hierarchicalData, null, 2));
  console.log(`Merged data written to: ${outputFile}`);
  
  // Generate summary
  let projectionCount = 0;
  let fastestGrowingCount = 0;
  let fastestDecliningCount = 0;
  
  function countProjections(obj) {
    if (obj.detailed_occupations) {
      for (const occupation of Object.values(obj.detailed_occupations)) {
        if (occupation.projections) projectionCount++;
        if (occupation.fastestGrowing) fastestGrowingCount++;
        if (occupation.fastestDeclining) fastestDecliningCount++;
      }
    }
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        countProjections(value);
      }
    }
  }
  
  for (const data of Object.values(hierarchicalData)) {
    countProjections(data);
  }
  
  console.log(`Summary:`);
  console.log(`- Occupations with projections: ${projectionCount}`);
  console.log(`- Fastest growing occupations: ${fastestGrowingCount}`);
  console.log(`- Fastest declining occupations: ${fastestDecliningCount}`);
}

// Run the processing
if (require.main === module) {
  processOccupationData();
}

module.exports = { processOccupationData };
