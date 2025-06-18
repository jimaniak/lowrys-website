const { db } = require('./src/lib/database');

async function checkOccupationTypes() {
  console.log('🔍 Checking occupation types in database...');
  
  try {
    // Check what occupation_type values exist
    const typesResult = await db.execute(`
      SELECT DISTINCT occupation_type, COUNT(*) as count 
      FROM occupations 
      GROUP BY occupation_type 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Occupation Types:');
    typesResult.rows.forEach(row => {
      console.log(`  ${row.occupation_type}: ${row.count} occupations`);
    });
    
    // Check some examples of each type
    console.log('\n📋 Examples by type:');
    for (const typeRow of typesResult.rows) {
      const examples = await db.execute({
        sql: `SELECT code, name FROM occupations WHERE occupation_type = ? LIMIT 3`,
        args: [typeRow.occupation_type]
      });
      
      console.log(`\n  ${typeRow.occupation_type}:`);
      examples.rows.forEach(ex => {
        console.log(`    ${ex.code} - ${ex.name}`);
      });
    }
    
    // Check specifically for codes ending in -0000
    console.log('\n🔍 Checking codes ending in -0000:');
    const zeroCodesResult = await db.execute(`
      SELECT code, name, occupation_type 
      FROM occupations 
      WHERE code LIKE '%-0000' 
      ORDER BY code 
      LIMIT 10
    `);
    
    zeroCodesResult.rows.forEach(row => {
      console.log(`  ${row.code} - ${row.name} [${row.occupation_type}]`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkOccupationTypes();
