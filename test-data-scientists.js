const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function testDataScientists() {
  console.log('🔍 Testing Data Scientists search...');
  
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {
    // Search for Data Scientists
    console.log('\n📊 Searching for Data Scientists...');
    const result = await db.execute({
      sql: `SELECT code, name, occupation_type 
            FROM occupations 
            WHERE occupation_type IS NOT NULL 
            AND occupation_type != 'Summary'
            AND name LIKE '%Data%'
            ORDER BY name`,
      args: []
    });
    
    console.log(`✅ Found ${result.rows.length} occupations with 'Data' in the name:`);
    result.rows.forEach(row => {
      console.log(`  - ${row.code}: ${row.name} (${row.occupation_type})`);
    });
    
    // Specifically look for "Data Scientists"
    const dataScientists = result.rows.find(row => 
      row.name.toLowerCase().includes('data scientist')
    );
    
    if (dataScientists) {
      console.log(`\n🎯 Found Data Scientists: ${dataScientists.code} - ${dataScientists.name}`);
      
      // Test if it has wage data
      const wageData = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM occupation_data WHERE occupation_code = ?',
        args: [dataScientists.code]
      });
      
      console.log(`📊 Wage data records: ${wageData.rows[0].count}`);
      
      // Test if it has projections
      const projData = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM projections WHERE occupation_code = ?',
        args: [dataScientists.code]
      });
      
      console.log(`📈 Projection records: ${projData.rows[0].count}`);
    } else {
      console.log('\n❌ No Data Scientists found');
    }
    
  } catch (error) {
    console.error('❌ Data Scientists test failed:', error);
  }
  
  process.exit(0);
}

testDataScientists();
