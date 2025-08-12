// Check what BLS tables actually exist in the database
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkExistingTables() {
  console.log('📋 CHECKING EXISTING DATABASE TABLES');
  console.log('=====================================\n');
  
  const result = await db.execute(`
    SELECT name, sql FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `);
  
  console.log('All database tables:');
  for (const row of result.rows) {
    console.log(`\n📊 ${row.name}`);
    
    // Get row count
    try {
      const countResult = await db.execute(`SELECT COUNT(*) as count FROM ${row.name}`);
      console.log(`   Rows: ${countResult.rows[0].count}`);
    } catch (e) {
      console.log(`   Rows: Unable to count - ${e.message}`);
    }
    
    // Show sample data for BLS-related tables
    if (row.name.includes('bls') || row.name === 'occupation_data' || row.name === 'occupations' || row.name === 'projections') {
      try {
        const sampleResult = await db.execute(`SELECT * FROM ${row.name} LIMIT 1`);
        if (sampleResult.rows.length > 0) {
          console.log('   Sample columns:', Object.keys(sampleResult.rows[0]).join(', '));
        }
      } catch (e) {
        console.log(`   Columns: Unable to sample - ${e.message}`);
      }
    }
  }
  
  // Check for Project Manager data specifically
  console.log('\n🔍 CHECKING PROJECT MANAGER DATA');
  console.log('=================================\n');
  
  const pmResult = await db.execute({
    sql: `
      SELECT code, name, occupation_type, category 
      FROM occupations 
      WHERE name LIKE '%Project%' OR name LIKE '%Manager%'
      ORDER BY name
      LIMIT 10
    `,
    args: []
  });
  
  console.log(`Found ${pmResult.rows.length} occupations containing 'Project' or 'Manager':`);
  pmResult.rows.forEach(row => {
    console.log(`  ${row.code}: ${row.name} (${row.category || 'unknown'})`);
  });
  
  // Check Missouri data in occupation_data
  console.log('\n🗺️ CHECKING MISSOURI DATA IN OCCUPATION_DATA');
  console.log('==============================================\n');
  
  const moResult = await db.execute({
    sql: `
      SELECT DISTINCT region, region_name, COUNT(*) as occupation_count
      FROM occupation_data 
      WHERE region_name LIKE '%Missouri%' OR region = 'MO'
      GROUP BY region, region_name
      ORDER BY region_name
    `,
    args: []
  });
  
  console.log(`Found ${moResult.rows.length} Missouri region entries in occupation_data:`);
  moResult.rows.forEach(row => {
    console.log(`  ${row.region}: ${row.region_name} (${row.occupation_count} occupations)`);
  });
  
  // Sample Project Manager data in Missouri
  if (pmResult.rows.length > 0 && moResult.rows.length > 0) {
    const sampleOccCode = pmResult.rows[0].code;
    const sampleRegion = moResult.rows[0].region;
    
    console.log(`\n💼 SAMPLE DATA: ${pmResult.rows[0].name} in ${moResult.rows[0].region_name}`);
    console.log('='.repeat(80));
    
    const sampleData = await db.execute({
      sql: `
        SELECT * FROM occupation_data 
        WHERE occupation_code = ? AND region = ?
        LIMIT 1
      `,
      args: [sampleOccCode, sampleRegion]
    });
    
    if (sampleData.rows.length > 0) {
      console.log('Available data fields:');
      Object.entries(sampleData.rows[0]).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          console.log(`  ${key}: ${value}`);
        }
      });
    } else {
      console.log('❌ No data found for this occupation/region combination');
    }
  }
}

if (require.main === module) {
  (async () => {
    try {
      await checkExistingTables();
    } catch (error) {
      console.error('❌ Script error:', error);
      process.exit(1);
    }
  })();
}
