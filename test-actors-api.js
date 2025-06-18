const { db } = require('./src/lib/database');

async function testActorsAPI() {
  console.log('🎭 Testing Actors API endpoints...');
  
  try {
    // Test wage data endpoint logic
    const occupationCode = '27-2011';
    const region = 'US';
    
    console.log('\n📊 Testing wage data query...');
    const wageResult = await db.execute({
      sql: `SELECT 
              od.*, 
              o.name as occupation_name,
              od.region_name
            FROM occupation_data od
            JOIN occupations o ON od.occupation_code = o.code
            WHERE od.occupation_code = ? AND od.region = ?`,
      args: [occupationCode, region]
    });

    if (wageResult.rows.length === 0) {
      console.log('❌ No wage data found');
      return;
    }

    const wageRow = wageResult.rows[0];
    console.log('Raw wage data:', {
      mean_annual: wageRow.mean_annual,
      mean_hourly: wageRow.mean_hourly,
      median_annual: wageRow.median_annual,
      median_hourly: wageRow.median_hourly,
      benefit_annual: wageRow.benefit_annual
    });

    // Test API logic for handling asterisk values
    const wageData = {
      occupationName: wageRow.occupation_name,
      regionName: wageRow.region_name,
      wage: {
        mean_annual: wageRow.mean_annual === '*' ? null : Number(wageRow.mean_annual),
        mean_hourly: wageRow.mean_hourly === '*' ? null : Number(wageRow.mean_hourly),
        median_annual: wageRow.median_annual === '*' ? null : Number(wageRow.median_annual),
        median_hourly: wageRow.median_hourly === '*' ? null : Number(wageRow.median_hourly)
      },
      benefits: {
        avg_annual: wageRow.benefit_annual === '*' ? null : Number(wageRow.benefit_annual)
      }
    };

    console.log('✅ Processed wage data:', wageData);

    // Test income calculation logic
    const income = wageData.wage.mean_annual || wageData.wage.median_annual || 0;
    const benefits = wageData.benefits.avg_annual || 0;
    
    console.log('✅ Income calculation:', { income, benefits });

    // Test projections
    console.log('\n📈 Testing projections query...');
    const projResult = await db.execute({
      sql: `
        SELECT 
          base_year,
          projection_year,
          employment,
          employment_change,
          employment_percent_change,
          annual_openings,
          median_wage,
          typical_education,
          work_experience,
          on_job_training,
          summary,
          projection_period
        FROM projections
        WHERE occupation_code = ?
        ORDER BY base_year DESC
        LIMIT 1
      `,
      args: [occupationCode]
    });

    if (projResult.rows.length > 0) {
      const projRow = projResult.rows[0];
      console.log('✅ Projections found:', {
        median_wage: projRow.median_wage,
        employment_change: projRow.employment_change,
        employment_percent_change: projRow.employment_percent_change
      });
    } else {
      console.log('❌ No projections found');
    }

    console.log('\n🎉 API test completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
  
  process.exit(0);
}

testActorsAPI();
