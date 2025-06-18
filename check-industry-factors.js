const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkIndustryFactors() {
  console.log('🔍 Checking industry-specific factors...');
  
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {
    // Check Cashiers (41-2011) across different industries
    const result = await db.execute({
      sql: `SELECT occupation_code, additional_data 
            FROM bls_special_tables 
            WHERE table_number = 'Table 1.12' 
            AND occupation_code = '41-2011'
            ORDER BY id`,
      args: []
    });
    
    console.log(`✅ Found ${result.rows.length} entries for Cashiers (41-2011)`);
    
    result.rows.forEach((row, index) => {
      console.log(`\n📋 Entry ${index + 1}:`);
      try {
        const data = JSON.parse(row.additional_data);
        console.log(`Industry: ${data['2023 National Employment Matrix industry title']} (${data['2023 National Employment Matrix industry code']})`);
        console.log(`Factors: ${data['Factors affecting occupational utilization']}`);
      } catch (e) {
        console.log('  (Could not parse JSON data)');
      }
    });
    
    // Check Data Scientists to see if they have multiple industry entries too
    console.log('\n🔬 Checking Data Scientists (15-2051)...');
    const dsResult = await db.execute({
      sql: `SELECT occupation_code, additional_data 
            FROM bls_special_tables 
            WHERE table_number = 'Table 1.12' 
            AND occupation_code = '15-2051'`,
      args: []
    });
    
    console.log(`✅ Found ${dsResult.rows.length} entries for Data Scientists`);
    if (dsResult.rows.length > 0) {
      const data = JSON.parse(dsResult.rows[0].additional_data);
      console.log(`Industry: ${data['2023 National Employment Matrix industry title']} (${data['2023 National Employment Matrix industry code']})`);
      console.log(`Factors: ${data['Factors affecting occupational utilization']}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking industry factors:', error);
  }
  
  process.exit(0);
}

checkIndustryFactors();
