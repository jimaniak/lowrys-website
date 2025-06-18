const { db } = require('./src/lib/database');

async function testActuariesData() {
  console.log('📊 Testing Actuaries data availability...');
  
  try {
    // First, find the Actuaries occupation
    console.log('\n🔍 Finding Actuaries occupation...');
    const occupationResult = await db.execute({
      sql: "SELECT * FROM occupations WHERE name LIKE '%actuar%' ORDER BY name",
      args: []
    });

    if (occupationResult.rows.length === 0) {
      console.log('❌ No Actuaries occupation found');
      return;
    }

    console.log('Found Actuaries occupations:');
    occupationResult.rows.forEach(row => {
      console.log(`  - Code: ${row.code}, Name: ${row.name}, Major Group: ${row.major_group_code}`);
    });

    const actuariesCode = occupationResult.rows[0].code; // Use the first match
    
    // Check available regions for Actuaries
    console.log(`\n🌍 Checking available regions for ${actuariesCode}...`);
    const regionsResult = await db.execute({
      sql: 'SELECT DISTINCT region as code, region_name as name FROM occupation_data WHERE occupation_code = ? ORDER BY region_name',
      args: [actuariesCode]
    });

    console.log(`Found ${regionsResult.rows.length} regions with data:`);
    regionsResult.rows.forEach(row => {
      console.log(`  - ${row.code}: ${row.name}`);
    });

    // Check if US data exists
    const usData = regionsResult.rows.find(r => r.code === 'US');
    console.log(`\n🇺🇸 US data available: ${usData ? 'YES' : 'NO'}`);

    // Check wage data for US (or first available region)
    const testRegion = usData ? 'US' : regionsResult.rows[0]?.code;
    if (testRegion) {
      console.log(`\n💰 Checking wage data for ${testRegion}...`);
      const wageResult = await db.execute({
        sql: `SELECT 
                od.*, 
                o.name as occupation_name,
                od.region_name
              FROM occupation_data od
              JOIN occupations o ON od.occupation_code = o.code
              WHERE od.occupation_code = ? AND od.region = ?`,
        args: [actuariesCode, testRegion]
      });

      if (wageResult.rows.length > 0) {
        const wage = wageResult.rows[0];
        console.log('✅ Wage data found:', {
          region: wage.region_name,
          mean_annual: wage.mean_annual,
          mean_hourly: wage.mean_hourly,
          median_annual: wage.median_annual,
          median_hourly: wage.median_hourly,
          total_employment: wage.total_employment
        });
      } else {
        console.log('❌ No wage data found for this region');
      }
    }

    // Check projections
    console.log(`\n📈 Checking projections for ${actuariesCode}...`);
    const projResult = await db.execute({
      sql: `SELECT * FROM projections WHERE occupation_code = ? ORDER BY base_year DESC LIMIT 1`,
      args: [actuariesCode]
    });

    if (projResult.rows.length > 0) {
      const proj = projResult.rows[0];
      console.log('✅ Projections found:', {
        employment_change: proj.employment_change,
        employment_percent_change: proj.employment_percent_change,
        annual_openings: proj.annual_openings,
        median_wage: proj.median_wage,
        typical_education: proj.typical_education
      });
    } else {
      console.log('❌ No projections found');
    }

    console.log('\n🎉 Actuaries test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

testActuariesData();
