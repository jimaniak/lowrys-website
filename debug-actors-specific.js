const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function debugActors() {
  console.log('=== DEBUGGING ACTORS (27-2011) ===\n');
  
  try {
    // 1. Check if Actors occupation exists
    console.log('1. Checking if Actors occupation exists...');
    const occupation = await client.execute({
      sql: 'SELECT * FROM occupations WHERE occ_code = ?',
      args: ['27-2011']
    });
    console.log('Actors occupation:', occupation.rows);
    
    if (occupation.rows.length === 0) {
      console.log('❌ Actors occupation not found!');
      return;
    }
    
    // 2. Check projections for Actors
    console.log('\n2. Checking projections for Actors...');
    const projections = await client.execute({
      sql: 'SELECT * FROM projections WHERE occ_code = ?',
      args: ['27-2011']
    });
    console.log('Actors projections:', projections.rows);
    
    // 3. Check BLS special tables for Actors
    console.log('\n3. Checking BLS special tables for Actors...');
    const specialTables = await client.execute({
      sql: 'SELECT * FROM bls_special_tables WHERE occ_code = ?',
      args: ['27-2011']
    });
    console.log('Actors special tables:', specialTables.rows);
    
    // 4. Simulate the API call data structure
    console.log('\n4. Simulating API response structure...');
    const occupationData = occupation.rows[0];
    const projectionData = projections.rows[0];
    
    const apiResponse = {
      occupation: {
        code: occupationData.occ_code,
        title: occupationData.occ_title,
        employment_2023: occupationData.employment_2023,
        median_wage: occupationData.median_wage,
        hourly_wage_10th: occupationData.hourly_wage_10th,
        hourly_wage_90th: occupationData.hourly_wage_90th
      },
      projections: projectionData ? {
        employment_2023: projectionData.employment_2023,
        employment_2033: projectionData.employment_2033,
        employment_change: projectionData.employment_change,
        employment_change_percent: projectionData.employment_change_percent,
        openings_annual: projectionData.openings_annual
      } : null
    };
    
    console.log('API Response structure:', JSON.stringify(apiResponse, null, 2));
    
    // 5. Check for any null/undefined values that might cause errors
    console.log('\n5. Checking for problematic null/undefined values...');
    Object.entries(apiResponse.occupation).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        console.log(`⚠️  occupation.${key} is ${value}`);
      }
    });
    
    if (apiResponse.projections) {
      Object.entries(apiResponse.projections).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          console.log(`⚠️  projections.${key} is ${value}`);
        }
      });
    } else {
      console.log('⚠️  No projections data found for Actors');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

debugActors().then(() => {
  console.log('\n=== DEBUG COMPLETE ===');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
