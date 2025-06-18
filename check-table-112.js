const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkTable112() {
  console.log('🔍 Checking Table 1.12 data...');
  
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {
    // Check what's in Table 1.12
    const result = await db.execute({
      sql: `SELECT occupation_code, additional_data 
            FROM bls_special_tables 
            WHERE table_number = 'Table 1.12' 
            LIMIT 5`,
      args: []
    });
    
    console.log(`✅ Found ${result.rows.length} records from Table 1.12`);
    
    if (result.rows.length > 0) {
      result.rows.forEach((row, index) => {
        console.log(`\n📋 Record ${index + 1}:`);
        console.log(`Code: ${row.occupation_code}`);
        
        try {
          const data = JSON.parse(row.additional_data);
          console.log('Available fields:');
          Object.keys(data).forEach(key => {
            console.log(`  - ${key}: ${data[key]}`);
          });
          
          // Look specifically for factors
          if (data['Factors affecting occupational utilization']) {
            console.log(`\n🎯 Factors: ${data['Factors affecting occupational utilization']}`);
          }
        } catch (e) {
          console.log('  (Could not parse JSON data)');
        }
      });
    }
    
    // Test with Data Scientists specifically
    console.log('\n🔬 Checking Data Scientists (15-2051)...');
    const dataScientistResult = await db.execute({
      sql: `SELECT additional_data 
            FROM bls_special_tables 
            WHERE table_number = 'Table 1.12' 
            AND occupation_code = '15-2051'`,
      args: []
    });
    
    if (dataScientistResult.rows.length > 0) {
      const data = JSON.parse(dataScientistResult.rows[0].additional_data);
      console.log('✅ Data Scientists factors:');
      if (data['Factors affecting occupational utilization']) {
        console.log(`📝 ${data['Factors affecting occupational utilization']}`);
      } else {
        console.log('❌ No factors field found');
        console.log('Available fields:', Object.keys(data));
      }
    } else {
      console.log('❌ No Table 1.12 data found for Data Scientists');
    }
    
  } catch (error) {
    console.error('❌ Error checking Table 1.12:', error);
  }
  
  process.exit(0);
}

checkTable112();
