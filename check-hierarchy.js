const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkHierarchicalData() {
  console.log('🔍 Checking hierarchical occupation data...');
  
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {
    // Check what columns we have in occupations table
    const schemaResult = await db.execute('PRAGMA table_info(occupations)');
    console.log('\n📋 Occupations table columns:');
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type}`);
    });
    
    // Check a specific occupation like Actuaries to see hierarchical data
    const actuariesResult = await db.execute({
      sql: 'SELECT * FROM occupations WHERE name LIKE ? LIMIT 1',
      args: ['%Actuaries%']
    });
    
    if (actuariesResult.rows.length > 0) {
      const actuaries = actuariesResult.rows[0];
      console.log('\n🎯 Sample occupation (Actuaries):');
      console.log(`  - Code: ${actuaries.code}`);
      console.log(`  - Name: ${actuaries.name}`);
      console.log(`  - Major Group Code: ${actuaries.major_group_code}`);
      console.log(`  - Occupation Type: ${actuaries.occupation_type}`);
      
      // Check if we have uplink or hierarchy data
      Object.keys(actuaries).forEach(key => {
        if (key.toLowerCase().includes('group') || key.toLowerCase().includes('parent') || key.toLowerCase().includes('uplink')) {
          console.log(`  - ${key}: ${actuaries[key]}`);
        }
      });
    }
    
    // Check if we have records for the hierarchy levels (like 15-0000, 15-2000, 15-2010)
    console.log('\n🏗️ Checking hierarchy for Actuaries (15-2011):');
    const hierarchyChecks = await Promise.all([
      db.execute({ sql: 'SELECT code, name, occupation_type FROM occupations WHERE code = ?', args: ['15-0000'] }), // Major Group
      db.execute({ sql: 'SELECT code, name, occupation_type FROM occupations WHERE code = ?', args: ['15-2000'] }), // Minor Group  
      db.execute({ sql: 'SELECT code, name, occupation_type FROM occupations WHERE code = ?', args: ['15-2010'] }), // Broad
      db.execute({ sql: 'SELECT code, name, occupation_type FROM occupations WHERE code = ?', args: ['15-2011'] })  // Detailed
    ]);
    
    hierarchyChecks.forEach((result, index) => {
      const level = ['Major Group (15-0000)', 'Minor Group (15-2000)', 'Broad (15-2010)', 'Detailed (15-2011)'][index];
      if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log(`  ✅ ${level}: ${row.name} (${row.occupation_type || 'NULL'})`);
      } else {
        console.log(`  ❌ ${level}: Not found`);
      }
    });
    
  } catch (error) {
    console.error('❌ Query failed:', error);
  }
  
  process.exit(0);
}

checkHierarchicalData();
