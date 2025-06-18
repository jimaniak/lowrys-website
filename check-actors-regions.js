const { db } = require('./src/lib/database');

async function checkActorsRegions() {
  console.log('🎭 Checking available regions for Actors...');
  
  try {
    const occupationCode = '27-2011';
    
    // Get all regions with data for Actors
    const regionsResult = await db.execute({
      sql: 'SELECT DISTINCT region as code, region_name as name FROM occupation_data WHERE occupation_code = ? ORDER BY region_name',
      args: [occupationCode]
    });
    
    console.log('Available regions for Actors:');
    regionsResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.code} - ${row.name}`);
    });
    
    // Check if US data exists
    const usData = regionsResult.rows.find(r => r.code === 'US');
    if (usData) {
      console.log('\n✅ US (national) data is available');
      
      // Get the US wage data
      const usWageResult = await db.execute({
        sql: 'SELECT * FROM occupation_data WHERE occupation_code = ? AND region = ?',
        args: [occupationCode, 'US']
      });
      
      if (usWageResult.rows.length > 0) {
        const wage = usWageResult.rows[0];
        console.log('US wage data:', {
          mean_annual: wage.mean_annual,
          mean_hourly: wage.mean_hourly,
          median_annual: wage.median_annual,
          median_hourly: wage.median_hourly
        });
      }
    } else {
      console.log('\n❌ No US (national) data available');
    }
    
    // Check which regions have actual wage data (not just asterisks)
    console.log('\nRegions with actual wage data (not asterisks):');
    for (const region of regionsResult.rows) {
      const wageResult = await db.execute({
        sql: 'SELECT mean_annual, mean_hourly, median_annual, median_hourly FROM occupation_data WHERE occupation_code = ? AND region = ?',
        args: [occupationCode, region.code]
      });
      
      if (wageResult.rows.length > 0) {
        const wage = wageResult.rows[0];
        const hasRealData = wage.mean_annual !== '*' || wage.mean_hourly !== '*' || wage.median_annual !== '*' || wage.median_hourly !== '*';
        
        if (hasRealData) {
          console.log(`  ✅ ${region.code} - ${region.name}:`, {
            mean_annual: wage.mean_annual,
            mean_hourly: wage.mean_hourly,
            median_annual: wage.median_annual,
            median_hourly: wage.median_hourly
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkActorsRegions();
