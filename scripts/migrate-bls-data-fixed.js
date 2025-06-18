// Fixed migration script to populate BLS tables from the actual hierarchical data structure
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
    console.log('🚀 Starting BLS data migration...');
    
    // Read the hierarchical data file
    const dataPath = path.join(process.cwd(), 'public/data/bls-benchmarks-hierarchical-with-projections.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log('📁 Data file loaded successfully');
    
    // Get the latest date key (should be 2025-06-16 based on what we saw)
    const dates = Object.keys(data);
    const latestDate = dates[0]; // Should be 2025-06-16
    console.log(`📅 Using data from: ${latestDate}`);
    
    const dateData = data[latestDate];
    
    // Clear existing projections data
    console.log('🧹 Clearing existing projections data...');
    await db.execute('DELETE FROM projections');
    
    let projectionsInserted = 0;
    let occupationsWithProjections = 0;
    
    // Process each major group
    for (const [majorGroupCode, majorGroupData] of Object.entries(dateData)) {
      console.log(`Processing major group: ${majorGroupCode} - ${majorGroupData.name}`);
      
      // Navigate through the minor groups and broad occupations to get to detailed occupations
      if (majorGroupData.minor_groups) {
        for (const [minorKey, minorData] of Object.entries(majorGroupData.minor_groups)) {
          if (minorData.broad_occupations) {
            for (const [broadKey, broadData] of Object.entries(minorData.broad_occupations)) {
              if (broadData.detailed_occupations) {
                for (const [detailCode, detailData] of Object.entries(broadData.detailed_occupations)) {
                  
                  // Check if this occupation has projections data
                  if (detailData.projections) {
                    const proj = detailData.projections;
                    occupationsWithProjections++;
                    
                    // Insert projections data
                    try {
                      await db.execute({
                        sql: `INSERT OR REPLACE INTO projections (
                          occupation_code, 
                          projected_2023, 
                          projected_2033, 
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
                          parseFloat(proj.projected_2023) || null,
                          parseFloat(proj.projected_2033) || null,
                          parseFloat(proj.projected_change) || null,
                          parseFloat(proj.projected_percent) || null,
                          parseFloat(proj.projected_openings) || null,
                          parseInt(proj.median_wage) || null,
                          proj.typical_education || null,
                          proj.work_experience || null,
                          proj.on_job_training || null,
                          proj.summary || null
                        ]
                      });
                      projectionsInserted++;
                      
                      if (projectionsInserted % 100 === 0) {
                        console.log(`  ✅ Inserted ${projectionsInserted} projections so far...`);
                      }
                    } catch (error) {
                      console.error(`❌ Error inserting projections for ${detailCode}:`, error.message);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`- Occupations with projections data: ${occupationsWithProjections}`);
    console.log(`- Projections records inserted: ${projectionsInserted}`);
    
    // Now create status tables based on growth rates
    console.log('\n🏷️ Creating status categorizations...');
    
    // Clear existing status tables
    await db.execute('DELETE FROM fastest_growing');
    await db.execute('DELETE FROM most_job_growth');
    await db.execute('DELETE FROM fastest_declining');
    await db.execute('DELETE FROM largest_job_declines');
    
    // Categorize occupations based on growth rates
    // Fastest growing (top growth percentages >= 8%)
    const fastestGrowingResult = await db.execute(`
      INSERT INTO fastest_growing (occupation_code, growth_rate, rank_order)
      SELECT occupation_code, projected_percent_change, 
             ROW_NUMBER() OVER (ORDER BY projected_percent_change DESC) as rank_order
      FROM projections 
      WHERE projected_percent_change >= 8.0
      ORDER BY projected_percent_change DESC
    `);
    
    // Most job growth (top absolute changes >= 50K)
    const mostJobGrowthResult = await db.execute(`
      INSERT INTO most_job_growth (occupation_code, job_change, rank_order)
      SELECT occupation_code, projected_change,
             ROW_NUMBER() OVER (ORDER BY projected_change DESC) as rank_order
      FROM projections 
      WHERE projected_change >= 50.0
      ORDER BY projected_change DESC
    `);
    
    // Fastest declining (worst growth percentages <= -8%)
    const fastestDecliningResult = await db.execute(`
      INSERT INTO fastest_declining (occupation_code, decline_rate, rank_order)
      SELECT occupation_code, projected_percent_change,
             ROW_NUMBER() OVER (ORDER BY projected_percent_change ASC) as rank_order
      FROM projections 
      WHERE projected_percent_change <= -8.0
      ORDER BY projected_percent_change ASC
    `);
    
    // Largest job declines (worst absolute changes <= -50K)
    const largestDeclinesResult = await db.execute(`
      INSERT INTO largest_job_declines (occupation_code, job_decline, rank_order)
      SELECT occupation_code, projected_change,
             ROW_NUMBER() OVER (ORDER BY projected_change ASC) as rank_order
      FROM projections 
      WHERE projected_change <= -50.0
      ORDER BY projected_change ASC
    `);
    
    console.log(`✅ Status tables populated:`);
    console.log(`   - Fastest growing: ${fastestGrowingResult.changes} occupations`);
    console.log(`   - Most job growth: ${mostJobGrowthResult.changes} occupations`);
    console.log(`   - Fastest declining: ${fastestDecliningResult.changes} occupations`);
    console.log(`   - Largest declines: ${largestDeclinesResult.changes} occupations`);
    
    // Verify the data
    console.log('\n🔍 Verifying migration...');
    const verifyResult = await db.execute('SELECT COUNT(*) as count FROM projections');
    console.log(`Total projections in database: ${verifyResult.rows[0].count}`);
    
    // Show a sample of fastest growing occupations
    const sampleFastGrowing = await db.execute(`
      SELECT o.name, p.projected_percent_change, fg.rank_order
      FROM fastest_growing fg
      JOIN occupations o ON fg.occupation_code = o.code
      JOIN projections p ON fg.occupation_code = p.occupation_code
      ORDER BY fg.rank_order
      LIMIT 5
    `);
    
    console.log('\n🚀 Top 5 Fastest Growing Occupations:');
    sampleFastGrowing.rows.forEach(row => {
      console.log(`   ${row.rank_order}. ${row.name} (+${row.projected_percent_change}%)`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
