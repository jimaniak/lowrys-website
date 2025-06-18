const { db } = require('./src/lib/database');

async function checkOccupationTypes() {
  console.log('🔍 Checking occupation types in database...');
  
  try {
    // Check what occupation_type values we have
    const typesResult = await db.execute({
      sql: 'SELECT DISTINCT occupation_type, COUNT(*) as count FROM occupations WHERE occupation_type IS NOT NULL GROUP BY occupation_type ORDER BY count DESC'
    });
    
    console.log('\n📊 Occupation types found:');
    typesResult.rows.forEach(row => {
      console.log(`  - ${row.occupation_type}: ${row.count} occupations`);
    });
    
    // Check the specific example: 15-1212
    console.log('\n🔎 Checking example occupation 15-1212...');
    const exampleResult = await db.execute({
      sql: 'SELECT * FROM occupations WHERE code = ?',
      args: ['15-1212']
    });
    
    if (exampleResult.rows.length > 0) {
      const occ = exampleResult.rows[0];
      console.log('Example occupation:', {
        code: occ.code,
        name: occ.name,
        occupation_type: occ.occupation_type,
        major_group_code: occ.major_group_code
      });
    } else {
      console.log('❌ Example occupation 15-1212 not found');
    }
    
    // Check some hierarchy examples
    console.log('\n🌳 Checking hierarchy examples...');
    const hierarchyResult = await db.execute({
      sql: `SELECT code, name, occupation_type 
            FROM occupations 
            WHERE code IN ('15-0000', '15-1200', '15-1210', '15-1212') 
            ORDER BY code`
    });
    
    hierarchyResult.rows.forEach(row => {
      console.log(`  ${row.code} (${row.occupation_type}): ${row.name}`);
    });
    
    // Check what we're currently filtering out
    console.log('\n❌ Currently filtered out (ending in -0000):');
    const filteredResult = await db.execute({
      sql: `SELECT code, name, occupation_type 
            FROM occupations 
            WHERE code LIKE '%-0000' 
            ORDER BY code 
            LIMIT 10`
    });
    
    filteredResult.rows.forEach(row => {
      console.log(`  ${row.code} (${row.occupation_type}): ${row.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkOccupationTypes();
