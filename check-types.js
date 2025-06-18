const { db } = require('./src/lib/database');

async function checkOccupationTypes() {
  console.log('🔍 Checking occupation types in database...');
  
  try {
    // Check distinct occupation types
    const typesResult = await db.execute('SELECT DISTINCT occupation_type FROM occupations ORDER BY occupation_type');
    
    console.log('\n📊 Available occupation types:');
    typesResult.rows.forEach(row => {
      console.log(`  - "${row.occupation_type}"`);
    });
    
    // Check some examples of each type
    console.log('\n📝 Examples by type:');
    for (const typeRow of typesResult.rows) {
      const type = typeRow.occupation_type;
      const examplesResult = await db.execute({
        sql: 'SELECT code, name FROM occupations WHERE occupation_type = ? ORDER BY code LIMIT 3',
        args: [type]
      });
      
      console.log(`\n  ${type}:`);
      examplesResult.rows.forEach(row => {
        console.log(`    ${row.code} - ${row.name}`);
      });
    }
    
    // Check the hierarchy example you mentioned
    console.log('\n🏗️ Checking hierarchy for 15-1212...');
    const hierarchyResult = await db.execute({
      sql: 'SELECT code, name, occupation_type FROM occupations WHERE code IN (?, ?, ?, ?) ORDER BY code',
      args: ['15-1212', '15-1210', '15-1200', '15-0000']
    });
    
    hierarchyResult.rows.forEach(row => {
      console.log(`  ${row.code} - ${row.name} (${row.occupation_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkOccupationTypes();
