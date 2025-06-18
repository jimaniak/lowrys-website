const fs = require('fs');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrateProjectionsData() {
  console.log('Starting projections data migration...');

  try {
    // Read the hierarchical JSON file
    console.log('Reading hierarchical JSON file...');
    const rawData = fs.readFileSync('./public/data/bls-benchmarks-hierarchical-with-projections.json', 'utf8');
    const data = JSON.parse(rawData);
    
    console.log('Data structure:', Object.keys(data));
    
    // Clear existing projections data
    console.log('Clearing existing projections...');
    await db.execute('DELETE FROM projections');
    
    let projectionsCount = 0;
    
    // Process each major group
    for (const [majorGroupCode, majorGroupData] of Object.entries(data)) {
      if (majorGroupData && majorGroupData.detailedOccupations) {
        console.log(`Processing major group: ${majorGroupCode}`);
        
        // Process each detailed occupation
        for (const [occupationCode, occupationData] of Object.entries(majorGroupData.detailedOccupations)) {
          if (occupationData && occupationData.projections) {
            const proj = occupationData.projections;
            
            try {
              await db.execute({
                sql: `INSERT OR REPLACE INTO projections 
                      (occupation_code, projected_2023, projected_2033, projected_change, 
                       projected_percent_change, projected_openings, median_wage, 
                       typical_education, work_experience, on_job_training, factors) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  occupationCode,
                  parseFloat(proj.projected_2023) || null,
                  parseFloat(proj.projected_2033) || null,
                  parseFloat(proj.projected_change) || null,
                  parseFloat(proj.projected_percent) || null,
                  parseFloat(proj.projected_openings) || null,
                  parseInt(proj.median_wage) || null,
                  proj.typical_education || null,
                  proj.work_experience || null,
                  proj.on_job_training || null,
                  proj.factors || null
                ]
              });
              
              projectionsCount++;
              
              if (projectionsCount % 100 === 0) {
                console.log(`Processed ${projectionsCount} projections...`);
              }
              
            } catch (error) {
              console.error(`Error inserting projection for ${occupationCode}:`, error);
            }
          }
        }
      }
    }
    
    console.log(`Migration completed! Inserted ${projectionsCount} projections.`);
    
    // Test the data
    console.log('\nTesting projections data...');
    const testResult = await db.execute('SELECT COUNT(*) as count FROM projections');
    console.log(`Total projections in database: ${testResult.rows[0].count}`);
    
    // Test specific occupation
    const cisTest = await db.execute({
      sql: 'SELECT * FROM projections p JOIN occupations o ON p.occupation_code = o.code WHERE o.name LIKE ? LIMIT 1',
      args: ['%Computer and Information Systems Managers%']
    });
    
    if (cisTest.rows.length > 0) {
      console.log('Sample projection data (Computer and Information Systems Managers):');
      console.log(cisTest.rows[0]);
    } else {
      console.log('No projection data found for Computer and Information Systems Managers');
    }
    
  } catch (error) {
    console.error('Projections migration failed:', error);
  }
}

// Run migration
migrateProjectionsData();
