const { db } = require('./src/lib/database');

async function checkActuaries() {
  console.log('🔍 Checking for Actuaries in occupations table...');
  
  try {
    // Search for Actuaries
    const result = await db.execute({
      sql: `SELECT * FROM occupations WHERE name LIKE '%Actuar%' ORDER BY name`,
      args: []
    });

    console.log(`Found ${result.rows.length} occupations with 'Actuar' in the name:`);
    result.rows.forEach(row => {
      console.log(`- Code: ${row.code}, Name: ${row.name}, Major Group: ${row.major_group_code}`);
    });

    // Check if any codes end in -0000 (should be filtered out)
    const summaryCheck = result.rows.filter(row => row.code.endsWith('-0000'));
    console.log(`\n${summaryCheck.length} summary codes (would be filtered out):`, summaryCheck.map(r => r.code));

    // Check detailed occupations only
    const detailedOnly = result.rows.filter(row => !row.code.endsWith('-0000'));
    console.log(`\n${detailedOnly.length} detailed occupations (would appear in dropdown):`, detailedOnly.map(r => r.name));
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkActuaries();
