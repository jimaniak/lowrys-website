const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function testHierarchyAPI() {
  console.log('🔍 Testing hierarchy API for Barbers...');
  
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {
    const occupationCode = '39-5011'; // Barbers
    
    // Test the hierarchy query
    console.log('\n📊 Testing hierarchy query...');
    const occupationResult = await db.execute({
      sql: 'SELECT * FROM occupations WHERE code = ?',
      args: [occupationCode]
    });

    if (occupationResult.rows.length === 0) {
      console.log('❌ Occupation not found');
      return;
    }

    const occupationData = occupationResult.rows[0];
    console.log('✅ Found occupation:', {
      code: occupationData.code,
      name: occupationData.name,
      major_group_code: occupationData.major_group_code,
      occupation_type: occupationData.occupation_type
    });

    const hierarchy = {
      detailed: {
        code: occupationData.code,
        name: occupationData.name,
        type: occupationData.occupation_type
      }
    };

    // Get major group
    if (occupationData.major_group_code) {
      console.log('\n🔍 Looking for major group:', occupationData.major_group_code);
      const majorResult = await db.execute({
        sql: 'SELECT code, name FROM occupations WHERE code = ?',
        args: [occupationData.major_group_code]
      });
      if (majorResult.rows.length > 0) {
        hierarchy.major = {
          code: majorResult.rows[0].code,
          name: majorResult.rows[0].name
        };
        console.log('✅ Found major group:', hierarchy.major);
      } else {
        console.log('❌ Major group not found');
      }
    }

    // Try to find minor group (code pattern like XX-XX00)
    const minorGroupCode = occupationData.code.substring(0, 5) + '00';
    console.log('\n🔍 Looking for minor group:', minorGroupCode);
    if (minorGroupCode !== occupationData.code) {
      const minorResult = await db.execute({
        sql: 'SELECT code, name FROM occupations WHERE code = ?',
        args: [minorGroupCode]
      });
      if (minorResult.rows.length > 0) {
        hierarchy.minor = {
          code: minorResult.rows[0].code,
          name: minorResult.rows[0].name
        };
        console.log('✅ Found minor group:', hierarchy.minor);
      } else {
        console.log('❌ Minor group not found');
      }
    }

    // Try to find broad occupation (code pattern like XX-XXX0)
    const broadOccupationCode = occupationData.code.substring(0, 6) + '0';
    console.log('\n🔍 Looking for broad occupation:', broadOccupationCode);
    if (broadOccupationCode !== occupationData.code && broadOccupationCode !== minorGroupCode) {
      const broadResult = await db.execute({
        sql: 'SELECT code, name FROM occupations WHERE code = ?',
        args: [broadOccupationCode]
      });
      if (broadResult.rows.length > 0) {
        hierarchy.broad = {
          code: broadResult.rows[0].code,
          name: broadResult.rows[0].name
        };
        console.log('✅ Found broad occupation:', hierarchy.broad);
      } else {
        console.log('❌ Broad occupation not found');
      }
    }

    console.log('\n🎯 Final hierarchy structure:');
    console.log(JSON.stringify(hierarchy, null, 2));
    
  } catch (error) {
    console.error('❌ Hierarchy test failed:', error);
  }
  
  process.exit(0);
}

testHierarchyAPI();
