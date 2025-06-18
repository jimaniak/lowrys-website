const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function testCleanAPIEndpoint() {
  console.log('🔍 Testing cleaned API endpoint logic (no NULLs)...');
  
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {
    // Simulate the cleaned API call
    const majorGroup = 'ALL';
    let occupationsQuery = 'SELECT * FROM occupations WHERE occupation_type IS NOT NULL AND occupation_type != ?';
    let occupationsArgs = ['Summary'];
    
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
    
    console.log(`\n✅ Found ${occupationsResult.rows.length} clean occupations for API`);
    
    // Show first few results
    occupationsResult.rows.slice(0, 5).forEach(row => {
      console.log(`  - ${row.code}: ${row.name} (${row.occupation_type})`);
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
    
    // Check occupation types
    const types = [...new Set(occupationsResult.rows.map(row => row.occupation_type))];
    console.log(`\n📊 Occupation types found: ${types.join(', ')}`);
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
  
  process.exit(0);
}

testCleanAPIEndpoint();
