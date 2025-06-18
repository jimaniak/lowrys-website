const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function testAPIEndpoint() {
  console.log('🔍 Testing API endpoint logic...');
  
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {    // Simulate the exact API call
    const majorGroup = 'ALL'; // or null
    let occupationsQuery = `
      SELECT DISTINCT code, name, major_group_code, occupation_type 
      FROM occupations 
      WHERE (occupation_type != 'Summary' OR occupation_type IS NULL)
      AND occupation_type IS NOT NULL
    `;
    let occupationsArgs = [];
    
    if (majorGroup && majorGroup !== 'ALL') {
      occupationsQuery += ' AND major_group_code = ?';
      occupationsArgs.push(majorGroup);
    }
    
    occupationsQuery += ' ORDER BY name';
    
    console.log('Query:', occupationsQuery);
    console.log('Args:', occupationsArgs);
    
    const occupationsResult = await db.execute({ 
      sql: occupationsQuery, 
      args: occupationsArgs 
    });
    
    console.log(`\n✅ Found ${occupationsResult.rows.length} occupations for API`);
    
    // Show first few results
    occupationsResult.rows.slice(0, 5).forEach(row => {
      console.log(`  - ${row.code}: ${row.name} (${row.occupation_type || 'NULL'})`);
    });
    
    // Check if Actuaries is in the results
    const actuaries = occupationsResult.rows.find(row => row.name.includes('Actuaries'));
    if (actuaries) {
      console.log(`\n🎯 Found Actuaries: ${actuaries.code} - ${actuaries.name} (${actuaries.occupation_type})`);
    } else {
      console.log('\n❌ Actuaries not found in results');
    }
    
    // Check if Actors is in the results
    const actors = occupationsResult.rows.find(row => row.name.includes('Actors'));
    if (actors) {
      console.log(`🎭 Found Actors: ${actors.code} - ${actors.name} (${actors.occupation_type})`);
    } else {
      console.log('❌ Actors not found in results');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
  
  process.exit(0);
}

testAPIEndpoint();
