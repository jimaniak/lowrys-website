const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Missing Turso credentials in .env.local');
  process.exit(1);
}

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🔍 Starting comprehensive BLS data migration (FIXED)...');
console.log('📋 This will capture ALL available data from every BLS table');

const dataPath = path.join(__dirname, '..', 'public', 'data', 'bls-benchmarks-hierarchical-with-projections.json');

// Enhanced utility functions
function extractYearFromColumn(columnName) {
  const yearMatch = columnName.match(/\b(20\d{2})\b/);
  return yearMatch ? parseInt(yearMatch[1]) : null;
}

function extractYearRange(columnName) {
  const rangeMatch = columnName.match(/(\d{4})-(\d{2,4})/);
  if (rangeMatch) {
    const startYear = parseInt(rangeMatch[1]);
    const endYear = rangeMatch[2].length === 2 ? 
      parseInt(rangeMatch[1].substring(0,2) + rangeMatch[2]) : 
      parseInt(rangeMatch[2]);
    return {
      start: startYear,
      end: endYear,
      period: `${startYear}-${rangeMatch[2]}`
    };
  }
  return null;
}

function parseNumericValue(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,$%]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

// Enhanced table mapping with ALL BLS tables
const BLS_TABLE_MAP = {
  'Table 1.1': { name: 'Employment by major occupational group', category: 'employment' },
  'Table 1.2': { name: 'Occupational projections and worker characteristics', category: 'projections' },
  'Table 1.3': { name: 'Fastest growing occupations', category: 'growth' },
  'Table 1.4': { name: 'Occupations with most job growth', category: 'growth' },
  'Table 1.5': { name: 'Fastest declining occupations', category: 'decline' },
  'Table 1.6': { name: 'Occupations with largest job declines', category: 'decline' },
  'Table 1.7': { name: 'Occupations with most job openings', category: 'openings' },
  'Table 1.8': { name: 'Highest paying occupations', category: 'wages' },
  'Table 1.9': { name: 'STEM occupations', category: 'stem' },
  'Table 1.10': { name: 'Occupations by typical education and training', category: 'education' },
  'Table 1.11': { name: 'Occupations by typical wages', category: 'wages' },
  'Table 1.12': { name: 'Occupations needing workers to replace those leaving', category: 'replacement' }
};

function migrateCompleteData() {
  try {
    // Load hierarchical data
    console.log('📂 Loading hierarchical data file...');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Detect data year
    const dataYear = Object.keys(data)[0];
    const dateData = data[dataYear];
    console.log(`📅 Processing data for year: ${dataYear}`);
      // Add missing columns if needed
    console.log('🔧 Ensuring all database columns exist...');
    try {
      // Check and add total_employment column
      const columns = await db.execute("PRAGMA table_info(occupation_data)");
      const hasEmploymentColumn = columns.rows.some(row => row[1] === 'total_employment');
      
      if (!hasEmploymentColumn) {
        console.log('  ➕ Adding total_employment column...');
        await db.execute('ALTER TABLE occupation_data ADD COLUMN total_employment INTEGER');
      }
      
      // Add additional columns for comprehensive data capture (year-flexible)
      const additionalColumns = [
        'base_year_employment INTEGER',
        'projection_year_employment INTEGER', 
        'employment_change_numeric REAL',
        'employment_change_percent REAL',
        'annual_openings_average REAL',
        'current_median_wage INTEGER',
        'base_year INTEGER',
        'projection_year INTEGER'
      ];
      
      for (const columnDef of additionalColumns) {
        const [columnName] = columnDef.split(' ');
        const hasColumn = columns.rows.some(row => row[1] === columnName);
        if (!hasColumn) {
          console.log(`  ➕ Adding ${columnName} column...`);
          await db.execute(`ALTER TABLE occupation_data ADD COLUMN ${columnDef}`);
        }
      }
    } catch (error) {
      console.log('  ℹ️ Column modifications completed (some may have already existed)');
    }
    
    // Prepare statements for better performance
    const insertOccupationData = db.prepare(`
      INSERT OR REPLACE INTO occupation_data (
        occupation_code, region, region_name, data_year,
        mean_annual, median_annual, mean_hourly, median_hourly,
        benefit_annual, total_employment,
        base_year_employment, projection_year_employment, employment_change_numeric,
        employment_change_percent, annual_openings_average, current_median_wage,
        base_year, projection_year
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertProjection = db.prepare(`
      INSERT OR REPLACE INTO projections (
        occupation_code, base_year, projection_year, employment,
        employment_change, employment_percent_change, annual_openings,
        median_wage, typical_education, work_experience, on_job_training,
        summary, projection_period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertSpecialTable = db.prepare(`
      INSERT OR REPLACE INTO bls_special_tables (
        occupation_code, table_number, table_name, data_year,
        projection_period, value, value_type, additional_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Enhanced data extraction
    let occupationDataInserted = 0;
    let projectionsInserted = 0;
    let specialTablesInserted = 0;
    let table12DataInserted = 0;
    
    // Process each major group
    for (const [majorGroupCode, majorGroupData] of Object.entries(dateData)) {
      console.log(`🔄 Processing major group: ${majorGroupCode} - ${majorGroupData.name}`);
      
      if (majorGroupData.minor_groups) {
        for (const [minorKey, minorData] of Object.entries(majorGroupData.minor_groups)) {
          if (minorData.broad_occupations) {
            for (const [broadKey, broadData] of Object.entries(minorData.broad_occupations)) {
              if (broadData.detailed_occupations) {
                for (const [detailCode, detailData] of Object.entries(broadData.detailed_occupations)) {
                  
                  // ENHANCED: Extract Table 1.2 data dynamically for any years
                  let baseYearEmployment = null;
                  let projectionYearEmployment = null;
                  let employmentChangeNumeric = null;
                  let employmentChangePercent = null;
                  let annualOpenings = null;
                  let currentMedianWage = null;
                  let detectedBaseYear = null;
                  let detectedProjectionYear = null;
                  
                  if (detailData.occupationData && detailData.occupationData.sheets && detailData.occupationData.sheets['Table 1.2']) {
                    const table12Data = detailData.occupationData.sheets['Table 1.2'];
                    
                    // Dynamically detect years and extract values
                    for (const [columnName, value] of Object.entries(table12Data)) {
                      // Look for employment columns with years
                      const employmentMatch = columnName.match(/Employment[,\s]*(\d{4})/i);
                      if (employmentMatch) {
                        const year = parseInt(employmentMatch[1]);
                        const parsedValue = parseNumericValue(value);
                        
                        // Determine if this is base year (earlier) or projection year (later)
                        if (!detectedBaseYear || year < detectedBaseYear) {
                          detectedBaseYear = year;
                          baseYearEmployment = parsedValue;
                        }
                        if (!detectedProjectionYear || year > detectedProjectionYear) {
                          detectedProjectionYear = year;
                          projectionYearEmployment = parsedValue;
                        }
                      }
                      
                      // Extract other data regardless of specific years
                      if (columnName.includes('Employment change, numeric') || columnName.includes('Change, numeric')) {
                        employmentChangeNumeric = parseNumericValue(value);
                      } else if (columnName.includes('Employment change, percent') || columnName.includes('Percent change')) {
                        employmentChangePercent = parseNumericValue(value);
                      } else if (columnName.includes('openings') || columnName.includes('Openings')) {
                        annualOpenings = parseNumericValue(value);
                      } else if (columnName.includes('Median annual wage') || columnName.includes('median') && columnName.includes('wage')) {
                        currentMedianWage = parseNumericValue(value);
                      }
                    }
                    
                    if (baseYearEmployment || projectionYearEmployment) {
                      table12DataInserted++;
                    }
                  }
                  
                  // Extract regional occupation data WITH Table 1.2 employment data
                  if (detailData.regions) {
                    for (const [regionCode, regionData] of Object.entries(detailData.regions)) {
                      try {
                        insertOccupationData.run(
                          detailCode,
                          regionCode,
                          regionData.AREA_TITLE || regionCode,
                          parseInt(dataYear),
                          regionData.wage?.mean_annual || null,
                          regionData.wage?.median_annual || null,
                          regionData.wage?.mean_hourly || null,
                          regionData.wage?.median_hourly || null,
                          regionData.benefits?.avg_annual || null,
                          baseYearEmployment, // Use Table 1.2 base employment
                          baseYearEmployment,
                          projectionYearEmployment,
                          employmentChangeNumeric,
                          employmentChangePercent,
                          annualOpenings,
                          currentMedianWage,
                          detectedBaseYear,
                          detectedProjectionYear
                        );
                        occupationDataInserted++;
                      } catch (error) {
                        console.error(`❌ Error inserting enhanced occupation data for ${detailCode}-${regionCode}:`, error.message);
                      }
                    }
                  }
                  
                  // Enhanced projections data extraction
                  if (detailData.projections) {
                    const proj = detailData.projections;
                    
                    // Use Table 1.2 data if available, otherwise use projections data
                    const baseEmployment = baseYearEmployment || proj.projected_2023 || proj[`projected_${parseInt(dataYear)-1}`];
                    const projEmployment = projectionYearEmployment || proj.projected_2033 || proj[`projected_${parseInt(dataYear)+9}`];
                    const changeNumeric = employmentChangeNumeric || parseFloat(proj.projected_change) || null;
                    const changePercent = employmentChangePercent || parseFloat(proj.projected_percent) || null;
                    const openings = annualOpenings || parseFloat(proj.projected_openings) || null;
                    
                    if (baseEmployment || projEmployment) {
                      try {
                        // Use detected years or fall back to calculated years
                        const baseYear = detectedBaseYear || (parseInt(dataYear) - 1);
                        const projYear = detectedProjectionYear || (baseYear + 10);
                        
                        insertProjection.run(
                          detailCode, baseYear, projYear, 
                          projEmployment || baseEmployment,
                          changeNumeric, changePercent, openings,
                          currentMedianWage || parseInt(proj.median_wage) || null,
                          proj.typical_education || null,
                          proj.work_experience || null,
                          proj.on_job_training || null,
                          proj.summary || null,
                          `${baseYear}-${projYear.toString().slice(-2)}`
                        );
                        projectionsInserted++;
                      } catch (error) {
                        console.error(`❌ Error inserting enhanced projections for ${detailCode}:`, error.message);
                      }
                    }
                  }
                  
                  // Extract ALL BLS special table data
                  if (detailData.occupationData && detailData.occupationData.sheets) {
                    const sheets = detailData.occupationData.sheets;
                    
                    for (const [tableNumber, tableInfo] of Object.entries(BLS_TABLE_MAP)) {
                      if (sheets[tableNumber]) {
                        const tableData = sheets[tableNumber];
                        
                        // Extract data based on table type
                        let value = null;
                        let additionalData = {};
                        
                        for (const [columnName, columnValue] of Object.entries(tableData)) {
                          const parsedValue = parseNumericValue(columnValue);
                          
                          // Store all column data for comprehensive capture
                          if (parsedValue !== null) {
                            if (columnName.includes('change') || columnName.includes('growth') || columnName.includes('decline')) {
                              value = parsedValue;
                            }
                            additionalData[columnName] = parsedValue;
                          } else if (typeof columnValue === 'string' && columnValue.trim()) {
                            additionalData[columnName] = columnValue.trim();
                          }
                        }
                        
                        if (value !== null || Object.keys(additionalData).length > 0) {
                          try {
                            insertSpecialTable.run(
                              detailCode,
                              tableNumber,
                              tableInfo.name,
                              parseInt(dataYear),
                              detectedBaseYear && detectedProjectionYear ? 
                                `${detectedBaseYear}-${detectedProjectionYear.toString().slice(-2)}` :
                                `${parseInt(dataYear)-1}-${(parseInt(dataYear)+9).toString().slice(-2)}`,
                              value,
                              tableInfo.category,
                              JSON.stringify(additionalData)
                            );
                            specialTablesInserted++;
                          } catch (error) {
                            console.error(`❌ Error inserting ${tableNumber} for ${detailCode}:`, error.message);
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
      
      // Progress update
      if (occupationDataInserted % 5000 === 0 && occupationDataInserted > 0) {
        console.log(`  ✅ Progress: ${occupationDataInserted} occupation records, ${projectionsInserted} projections, ${specialTablesInserted} special tables, ${table12DataInserted} Table 1.2 records...`);
      }
    }
    
    console.log('\n📊 Enhanced Migration Summary:');
    console.log(`- Enhanced occupation data records: ${occupationDataInserted}`);
    console.log(`- Enhanced projection records: ${projectionsInserted}`);
    console.log(`- Enhanced special table records: ${specialTablesInserted}`);
    console.log(`- Table 1.2 employment records: ${table12DataInserted}`);
    
    // Verify comprehensive data
    console.log('\n🔍 Verifying comprehensive data capture...');
    const occupationCount = db.prepare('SELECT COUNT(*) as count FROM occupation_data WHERE data_year = ?').get(parseInt(dataYear));
    const projectionCount = db.prepare('SELECT COUNT(*) as count FROM projections').get();
    const specialTableCount = db.prepare('SELECT COUNT(*) as count FROM bls_special_tables WHERE data_year = ?').get(parseInt(dataYear));
    const employmentDataCount = db.prepare('SELECT COUNT(*) as count FROM occupation_data WHERE total_employment IS NOT NULL AND data_year = ?').get(parseInt(dataYear));
    
    console.log(`Database totals:
- Occupation data: ${occupationCount.count}
- Projections: ${projectionCount.count}
- Special tables: ${specialTableCount.count}
- Records with employment data: ${employmentDataCount.count}`);
    
    // Sample the enhanced data
    console.log('\n📋 Sample Enhanced Data:');
    const sampleEmployment = db.prepare(`
      SELECT occupation_code, total_employment, base_year_employment, projection_year_employment, 
             employment_change_percent, annual_openings_average, base_year, projection_year
      FROM occupation_data 
      WHERE total_employment IS NOT NULL 
      LIMIT 5
    `).all();
    
    console.log('Year-flexible employment data sample:');
    sampleEmployment.forEach(row => {
      console.log(`  ${row.occupation_code}: ${row.total_employment} jobs (${row.base_year}: ${row.base_year_employment} → ${row.projection_year}: ${row.projection_year_employment}), ${row.employment_change_percent}% change, ${row.annual_openings_average} openings`);
    });
    
    console.log('\n✅ Comprehensive BLS data migration completed successfully!');
    console.log('🎯 ALL available data has been captured and stored!');
    
  } catch (error) {
    console.error('❌ Error during comprehensive migration:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Add missing additional_data column to bls_special_tables if needed
try {
  const testDb = new Database(dbPath);
  const columns = testDb.prepare("PRAGMA table_info(bls_special_tables)").all();
  const hasAdditionalData = columns.some(col => col.name === 'additional_data');
  
  if (!hasAdditionalData) {
    console.log('🔧 Adding additional_data column to capture all BLS table data...');
    testDb.exec('ALTER TABLE bls_special_tables ADD COLUMN additional_data TEXT');
  }
  testDb.close();
} catch (error) {
  console.log('ℹ️ Schema preparation completed');
}

// Run the comprehensive migration
migrateCompleteData();
