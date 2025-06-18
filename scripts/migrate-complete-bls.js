// Complete migration script to extract projections and BLS table classifications
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

async function main() {
  try {
    console.log('🚀 Starting complete BLS data migration...');
    
    // Read the hierarchical data file
    const dataPath = path.join(process.cwd(), 'public/data/bls-benchmarks-hierarchical-with-projections.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log('📁 Data file loaded successfully');
    
    // Get the latest date key
    const dates = Object.keys(data);
    const latestDate = dates[0]; // Should be 2025-06-16
    console.log(`📅 Using data from: ${latestDate}`);
    
    const dateData = data[latestDate];
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.execute('DELETE FROM projections');
    await db.execute('DELETE FROM fastest_growing');
    await db.execute('DELETE FROM most_job_growth');
    await db.execute('DELETE FROM fastest_declining');
    await db.execute('DELETE FROM largest_job_declines');
    
    let projectionsInserted = 0;
    let table13Count = 0; // Fastest growing
    let table14Count = 0; // Most job growth
    let table15Count = 0; // Fastest declining
    let table16Count = 0; // Largest declines
    
    // Process each major group
    for (const [majorGroupCode, majorGroupData] of Object.entries(dateData)) {
      console.log(`Processing major group: ${majorGroupCode} - ${majorGroupData.name}`);
      
      // Navigate through the nested structure
      if (majorGroupData.minor_groups) {
        for (const [minorKey, minorData] of Object.entries(majorGroupData.minor_groups)) {
          if (minorData.broad_occupations) {
            for (const [broadKey, broadData] of Object.entries(minorData.broad_occupations)) {
              if (broadData.detailed_occupations) {
                for (const [detailCode, detailData] of Object.entries(broadData.detailed_occupations)) {                  // Extract projections data
                  if (detailData.projections) {
                    const proj = detailData.projections;
                    
                    try {
                      // Extract year information from the data
                      const projected2023 = parseFloat(proj.projected_2023) || null;
                      const projected2033 = parseFloat(proj.projected_2033) || null;
                      const projectedChange = parseFloat(proj.projected_change) || null;
                      const projectedPercent = parseFloat(proj.projected_percent) || null;
                      const projectedOpenings = parseFloat(proj.projected_openings) || null;
                      const medianWage = parseInt(proj.median_wage) || null;
                      
                      // Insert row for 2023 (base year)
                      if (projected2023 !== null) {
                        await db.execute({
                          sql: `INSERT OR REPLACE INTO projections (
                            occupation_code, 
                            projection_year,
                            employment_level,
                            projected_change, 
                            projected_percent_change, 
                            projected_openings, 
                            median_wage, 
                            typical_education, 
                            work_experience, 
                            on_job_training,
                            summary
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                          args: [
                            detailCode,
                            2023,
                            projected2023,
                            0, // Base year has no change
                            0, // Base year has no percent change
                            projectedOpenings, // Annual openings apply to all years
                            medianWage,
                            proj.typical_education || null,
                            proj.work_experience || null,
                            proj.on_job_training || null,
                            proj.summary || null
                          ]
                        });
                      }
                      
                      // Insert row for 2033 (projected year)
                      if (projected2033 !== null) {
                        await db.execute({
                          sql: `INSERT OR REPLACE INTO projections (
                            occupation_code, 
                            projection_year,
                            employment_level,
                            projected_change, 
                            projected_percent_change, 
                            projected_openings, 
                            median_wage, 
                            typical_education, 
                            work_experience, 
                            on_job_training,
                            summary
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                          args: [
                            detailCode,
                            2033,
                            projected2033,
                            projectedChange,
                            projectedPercent,
                            projectedOpenings,
                            medianWage,
                            proj.typical_education || null,
                            proj.work_experience || null,
                            proj.on_job_training || null,
                            proj.summary || null
                          ]
                        });
                      }
                      
                      projectionsInserted += 2; // We inserted 2 rows per occupation
                    } catch (error) {
                      console.error(`❌ Error inserting projections for ${detailCode}:`, error.message);
                    }
                  }
                  
                  // Extract BLS table classifications from occupationData.sheets
                  if (detailData.occupationData && detailData.occupationData.sheets) {
                    const sheets = detailData.occupationData.sheets;
                      // Table 1.3: Fastest growing occupations
                    if (sheets['Table 1.3']) {
                      try {
                        const tableData = sheets['Table 1.3'];
                        // Find the employment change percent column (flexible year matching)
                        const percentKey = Object.keys(tableData).find(key => 
                          key.includes('Employment change, percent') && key.includes('-')
                        );
                        const growthRate = percentKey ? parseFloat(tableData[percentKey]) : null;
                        
                        await db.execute({
                          sql: 'INSERT OR REPLACE INTO fastest_growing (occupation_code, growth_rate, rank_order) VALUES (?, ?, ?)',
                          args: [detailCode, growthRate, table13Count + 1]
                        });
                        table13Count++;
                      } catch (error) {
                        console.error(`❌ Error inserting Table 1.3 for ${detailCode}:`, error.message);
                      }
                    }
                    
                    // Table 1.4: Most job growth
                    if (sheets['Table 1.4']) {
                      try {
                        const tableData = sheets['Table 1.4'];
                        // Find the employment change numeric column (flexible year matching)
                        const numericKey = Object.keys(tableData).find(key => 
                          key.includes('Employment change, numeric') && key.includes('-')
                        );
                        const jobChange = numericKey ? parseFloat(tableData[numericKey]) : null;
                        
                        await db.execute({
                          sql: 'INSERT OR REPLACE INTO most_job_growth (occupation_code, job_change, rank_order) VALUES (?, ?, ?)',
                          args: [detailCode, jobChange, table14Count + 1]
                        });
                        table14Count++;
                      } catch (error) {
                        console.error(`❌ Error inserting Table 1.4 for ${detailCode}:`, error.message);
                      }
                    }
                    
                    // Table 1.5: Fastest declining occupations
                    if (sheets['Table 1.5']) {
                      try {
                        const tableData = sheets['Table 1.5'];
                        // Find the employment change percent column (flexible year matching)
                        const percentKey = Object.keys(tableData).find(key => 
                          key.includes('Employment change, percent') && key.includes('-')
                        );
                        const declineRate = percentKey ? parseFloat(tableData[percentKey]) : null;
                        
                        await db.execute({
                          sql: 'INSERT OR REPLACE INTO fastest_declining (occupation_code, decline_rate, rank_order) VALUES (?, ?, ?)',
                          args: [detailCode, declineRate, table15Count + 1]
                        });
                        table15Count++;
                      } catch (error) {
                        console.error(`❌ Error inserting Table 1.5 for ${detailCode}:`, error.message);
                      }
                    }
                    
                    // Table 1.6: Largest job declines
                    if (sheets['Table 1.6']) {
                      try {
                        const tableData = sheets['Table 1.6'];
                        // Find the employment change numeric column (flexible year matching)
                        const numericKey = Object.keys(tableData).find(key => 
                          key.includes('Employment change, numeric') && key.includes('-')
                        );
                        const jobDecline = numericKey ? parseFloat(tableData[numericKey]) : null;
                        
                        await db.execute({
                          sql: 'INSERT OR REPLACE INTO largest_job_declines (occupation_code, job_decline, rank_order) VALUES (?, ?, ?)',
                          args: [detailCode, jobDecline, table16Count + 1]
                        });
                        table16Count++;
                      } catch (error) {
                        console.error(`❌ Error inserting Table 1.6 for ${detailCode}:`, error.message);
                      }
                    }
                  }
                  
                  if ((projectionsInserted + table13Count + table14Count) % 50 === 0) {
                    console.log(`  ✅ Progress: ${projectionsInserted} projections, ${table13Count + table14Count + table15Count + table16Count} status records...`);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`- Projections inserted: ${projectionsInserted}`);
    console.log(`- Fastest growing (Table 1.3): ${table13Count}`);
    console.log(`- Most job growth (Table 1.4): ${table14Count}`);
    console.log(`- Fastest declining (Table 1.5): ${table15Count}`);
    console.log(`- Largest job declines (Table 1.6): ${table16Count}`);
    
    // Verify the data
    console.log('\n🔍 Verifying migration...');
    const verifyResults = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM projections'),
      db.execute('SELECT COUNT(*) as count FROM fastest_growing'),
      db.execute('SELECT COUNT(*) as count FROM most_job_growth'),
      db.execute('SELECT COUNT(*) as count FROM fastest_declining'),
      db.execute('SELECT COUNT(*) as count FROM largest_job_declines')
    ]);
    
    console.log(`Total records in database:`);
    console.log(`- Projections: ${verifyResults[0].rows[0].count}`);
    console.log(`- Fastest growing: ${verifyResults[1].rows[0].count}`);
    console.log(`- Most job growth: ${verifyResults[2].rows[0].count}`);
    console.log(`- Fastest declining: ${verifyResults[3].rows[0].count}`);
    console.log(`- Largest declines: ${verifyResults[4].rows[0].count}`);
    
    // Show samples
    console.log('\n🚀 Sample Data:');
    
    if (table13Count > 0) {
      const sampleFastGrowing = await db.execute(`
        SELECT o.name, fg.growth_rate, fg.rank_order
        FROM fastest_growing fg
        JOIN occupations o ON fg.occupation_code = o.code
        ORDER BY fg.rank_order
        LIMIT 3
      `);
      
      console.log('Top 3 Fastest Growing:');
      sampleFastGrowing.rows.forEach(row => {
        console.log(`   ${row.rank_order}. ${row.name} (+${row.growth_rate}%)`);
      });
    }
    
    if (table14Count > 0) {
      const sampleMostGrowth = await db.execute(`
        SELECT o.name, mjg.job_change, mjg.rank_order
        FROM most_job_growth mjg
        JOIN occupations o ON mjg.occupation_code = o.code
        ORDER BY mjg.rank_order
        LIMIT 3
      `);
      
      console.log('Top 3 Most Job Growth:');
      sampleMostGrowth.rows.forEach(row => {
        console.log(`   ${row.rank_order}. ${row.name} (+${row.job_change}K jobs)`);
      });
    }
    
    console.log('\n✅ Complete migration finished successfully!');
    console.log('🎯 The Job Outlook section should now show proper data with status badges!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
