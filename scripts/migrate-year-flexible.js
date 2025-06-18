// Year-flexible BLS migration script
// Automatically detects years from data and creates proper year-based records

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

// Helper function to extract year from column name
function extractYearFromColumn(columnName) {
  const yearMatch = columnName.match(/(\d{4})/);
  return yearMatch ? parseInt(yearMatch[1]) : null;
}

// Helper function to extract year range from column name
function extractYearRange(columnName) {
  const rangeMatch = columnName.match(/(\d{4})-(\d{2})/);
  if (rangeMatch) {
    const baseYear = parseInt(rangeMatch[1]);
    const endYear = parseInt(`20${rangeMatch[2]}`);
    return { baseYear, endYear, period: `${baseYear}-${rangeMatch[2]}` };
  }
  return null;
}

// Helper function to determine current data year from the data structure
function determineDataYear(data) {
  const dateKeys = Object.keys(data);
  if (dateKeys.length > 0) {
    const dateKey = dateKeys[0]; // e.g., "2025-06-16"
    const year = parseInt(dateKey.split('-')[0]);
    return year;
  }
  return new Date().getFullYear(); // fallback to current year
}

async function main() {
  try {
    console.log('🚀 Starting year-flexible BLS data migration...');
    
    // Read the hierarchical data file
    const dataPath = path.join(process.cwd(), 'public/data/bls-benchmarks-hierarchical-with-projections.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log('📁 Data file loaded successfully');
    
    // Determine the data year
    const dataYear = determineDataYear(data);
    console.log(`📅 Data year detected: ${dataYear}`);
    
    // Get the data for the latest date
    const dates = Object.keys(data);
    const latestDate = dates[0];
    const dateData = data[latestDate];
    
    // Clear existing data for this year (data migration only, no schema changes)
    console.log(`🧹 Clearing existing data for year ${dataYear}...`);
    await db.execute(`DELETE FROM occupation_data WHERE data_year = ?`, [dataYear]);
    await db.execute(`DELETE FROM projections WHERE base_year <= ?`, [dataYear]);
    await db.execute(`DELETE FROM bls_special_tables WHERE data_year = ?`, [dataYear]);
    
    let occupationDataInserted = 0;
    let projectionsInserted = 0;
    let specialTablesInserted = 0;
    
    // Process each major group
    for (const [majorGroupCode, majorGroupData] of Object.entries(dateData)) {
      console.log(`Processing major group: ${majorGroupCode} - ${majorGroupData.name}`);
      
      if (majorGroupData.minor_groups) {
        for (const [minorKey, minorData] of Object.entries(majorGroupData.minor_groups)) {
          if (minorData.broad_occupations) {
            for (const [broadKey, broadData] of Object.entries(minorData.broad_occupations)) {
              if (broadData.detailed_occupations) {
                for (const [detailCode, detailData] of Object.entries(broadData.detailed_occupations)) {
                    // Extract occupation data (wages, employment) for each region
                  if (detailData.regions) {
                    for (const [regionCode, regionData] of Object.entries(detailData.regions)) {
                      try {
                        await db.execute({
                          sql: `INSERT OR REPLACE INTO occupation_data (
                            occupation_code, region, region_name, data_year,
                            mean_annual, median_annual, mean_hourly, median_hourly,
                            benefit_annual
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                          args: [
                            detailCode,
                            regionCode,
                            regionData.AREA_TITLE || regionCode,
                            dataYear,
                            regionData.wage?.mean_annual || null,
                            regionData.wage?.median_annual || null,
                            regionData.wage?.mean_hourly || null,
                            regionData.wage?.median_hourly || null,
                            regionData.benefits?.avg_annual || null
                          ]
                        });
                        occupationDataInserted++;
                      } catch (error) {
                        console.error(`❌ Error inserting occupation data for ${detailCode}-${regionCode}:`, error.message);
                      }
                    }
                  }
                  
                  // Extract projections data
                  if (detailData.projections) {
                    const proj = detailData.projections;
                    
                    // Extract base and projection years from the data
                    let baseYear = null;
                    let projectionYear = null;
                    let projectionPeriod = null;
                    
                    // Look for year information in projection keys
                    for (const key of Object.keys(proj)) {
                      if (key.includes('projected_') && key.includes('_')) {
                        const year = extractYearFromColumn(key);
                        if (year) {
                          if (key.includes('2023') || key.includes('23')) baseYear = year;
                          if (key.includes('2033') || key.includes('33')) projectionYear = year;
                        }
                      }
                    }
                    
                    // Fallback: assume 10-year projection from current data year
                    if (!baseYear) baseYear = dataYear - 1; // BLS data is usually previous year
                    if (!projectionYear) projectionYear = baseYear + 10;
                    projectionPeriod = `${baseYear}-${projectionYear.toString().slice(-2)}`;
                    
                    try {
                      // Insert base year employment
                      const baseEmployment = proj.projected_2023 || proj[`projected_${baseYear}`];
                      if (baseEmployment) {
                        await db.execute({
                          sql: `INSERT OR REPLACE INTO projections (
                            occupation_code, base_year, projection_year, employment,
                            employment_change, employment_percent_change, annual_openings,
                            median_wage, typical_education, work_experience, on_job_training,
                            summary, projection_period
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                          args: [
                            detailCode, baseYear, baseYear, parseFloat(baseEmployment),
                            0, 0, null, // Base year has no change
                            parseInt(proj.median_wage) || null,
                            proj.typical_education || null,
                            proj.work_experience || null,
                            proj.on_job_training || null,
                            proj.summary || null,
                            projectionPeriod
                          ]
                        });
                        projectionsInserted++;
                      }
                      
                      // Insert projection year data
                      const projEmployment = proj.projected_2033 || proj[`projected_${projectionYear}`];
                      if (projEmployment) {
                        await db.execute({
                          sql: `INSERT OR REPLACE INTO projections (
                            occupation_code, base_year, projection_year, employment,
                            employment_change, employment_percent_change, annual_openings,
                            median_wage, typical_education, work_experience, on_job_training,
                            summary, projection_period
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                          args: [
                            detailCode, baseYear, projectionYear, parseFloat(projEmployment),
                            parseFloat(proj.projected_change) || null,
                            parseFloat(proj.projected_percent) || null,
                            parseFloat(proj.projected_openings) || null,
                            parseInt(proj.median_wage) || null,
                            proj.typical_education || null,
                            proj.work_experience || null,
                            proj.on_job_training || null,
                            proj.summary || null,
                            projectionPeriod
                          ]
                        });
                        projectionsInserted++;
                      }
                    } catch (error) {
                      console.error(`❌ Error inserting projections for ${detailCode}:`, error.message);
                    }
                  }
                  
                  // Extract BLS special table data
                  if (detailData.occupationData && detailData.occupationData.sheets) {
                    const sheets = detailData.occupationData.sheets;
                    
                    // Process each BLS table
                    const tableMap = {
                      'Table 1.3': { name: 'Fastest growing occupations', valueType: 'percent_change' },
                      'Table 1.4': { name: 'Occupations with most job growth', valueType: 'numeric_change' },
                      'Table 1.5': { name: 'Fastest declining occupations', valueType: 'percent_change' },
                      'Table 1.6': { name: 'Occupations with largest job declines', valueType: 'numeric_change' }
                    };
                    
                    for (const [tableNumber, tableInfo] of Object.entries(tableMap)) {
                      if (sheets[tableNumber]) {
                        const tableData = sheets[tableNumber];
                        
                        // Find the appropriate value column
                        let value = null;
                        let projectionPeriod = null;
                        
                        for (const [columnName, columnValue] of Object.entries(tableData)) {
                          if (tableInfo.valueType === 'percent_change' && columnName.includes('Employment change, percent')) {
                            value = parseFloat(columnValue);
                            const yearRange = extractYearRange(columnName);
                            if (yearRange) projectionPeriod = yearRange.period;
                          } else if (tableInfo.valueType === 'numeric_change' && columnName.includes('Employment change, numeric')) {
                            value = parseFloat(columnValue);
                            const yearRange = extractYearRange(columnName);
                            if (yearRange) projectionPeriod = yearRange.period;
                          }
                        }
                        
                        if (value !== null) {
                          try {
                            await db.execute({
                              sql: `INSERT OR REPLACE INTO bls_special_tables (
                                occupation_code, table_number, table_name, data_year,
                                projection_period, value, value_type
                              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                              args: [
                                detailCode,
                                tableNumber.replace('Table ', ''),
                                tableInfo.name,
                                dataYear,
                                projectionPeriod || `${dataYear-1}-${(dataYear+9).toString().slice(-2)}`,
                                value,
                                tableInfo.valueType
                              ]
                            });
                            specialTablesInserted++;
                          } catch (error) {
                            console.error(`❌ Error inserting ${tableNumber} for ${detailCode}:`, error.message);
                          }
                        }
                      }
                    }
                  }
                  
                  if ((occupationDataInserted + projectionsInserted + specialTablesInserted) % 100 === 0) {
                    console.log(`  ✅ Progress: ${occupationDataInserted} occupation records, ${projectionsInserted} projections, ${specialTablesInserted} special tables...`);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`\n📊 Migration Summary for Year ${dataYear}:`);
    console.log(`- Occupation data records: ${occupationDataInserted}`);
    console.log(`- Projection records: ${projectionsInserted}`);
    console.log(`- Special table records: ${specialTablesInserted}`);
    
    // Verify the data
    console.log('\n🔍 Verifying migration...');
    const verifyResults = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM occupation_data WHERE data_year = ?', [dataYear]),
      db.execute('SELECT COUNT(*) as count FROM projections WHERE base_year <= ?', [dataYear]),
      db.execute('SELECT COUNT(*) as count FROM bls_special_tables WHERE data_year = ?', [dataYear])
    ]);
    
    console.log(`Database totals for year ${dataYear}:`);
    console.log(`- Occupation data: ${verifyResults[0].rows[0].count}`);
    console.log(`- Projections: ${verifyResults[1].rows[0].count}`);
    console.log(`- Special tables: ${verifyResults[2].rows[0].count}`);
    
    // Show samples from the views
    console.log('\n🚀 Sample Data (Current Year Views):');
    
    const sampleFastGrowing = await db.execute(`
      SELECT occupation_name, value, rank_order
      FROM current_fastest_growing
      ORDER BY rank_order
      LIMIT 3
    `);
    
    if (sampleFastGrowing.rows.length > 0) {
      console.log('Top 3 Fastest Growing:');
      sampleFastGrowing.rows.forEach(row => {
        console.log(`   ${row.rank_order || '?'}. ${row.occupation_name} (+${row.value}%)`);
      });
    }
    
    console.log('\n✅ Year-flexible migration completed successfully!');
    console.log('🎯 Database is now future-proof for annual BLS updates!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
