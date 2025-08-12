// Check and fix accidentally added columns
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkAndFixColumns() {
  try {
    console.log('🔍 Checking occupation_data table...');
    
    // Check occupation_data table columns
    const occupationDataInfo = await db.execute('PRAGMA table_info(occupation_data)');
    const occupationDataColumns = occupationDataInfo.rows.map(row => row.name);
    
    console.log('📋 occupation_data columns:', occupationDataColumns.join(', '));
    
    // Check if we accidentally added columns to occupation_data
    const hasCategory = occupationDataColumns.includes('category');
    const hasProjectedWage = occupationDataColumns.includes('projected_median_annual_wage');
    const hasProjectedYear = occupationDataColumns.includes('projected_median_annual_wage_year');
    
    console.log('\n❓ Accidentally added to occupation_data?');
    console.log(`  category: ${hasCategory ? '⚠️ YES - NEED TO REMOVE' : '✅ NO'}`);
    console.log(`  projected_median_annual_wage: ${hasProjectedWage ? '⚠️ YES - NEED TO REMOVE' : '✅ NO'}`);
    console.log(`  projected_median_annual_wage_year: ${hasProjectedYear ? '⚠️ YES - NEED TO REMOVE' : '✅ NO'}`);
    
    // Remove accidentally added columns if they exist
    if (hasCategory) {
      console.log('\n🗑️ Removing category from occupation_data...');
      await db.execute('ALTER TABLE occupation_data DROP COLUMN category');
      console.log('✅ Removed category from occupation_data');
    }
    
    if (hasProjectedWage) {
      console.log('🗑️ Removing projected_median_annual_wage from occupation_data...');
      await db.execute('ALTER TABLE occupation_data DROP COLUMN projected_median_annual_wage');
      console.log('✅ Removed projected_median_annual_wage from occupation_data');
    }
    
    if (hasProjectedYear) {
      console.log('🗑️ Removing projected_median_annual_wage_year from occupation_data...');
      await db.execute('ALTER TABLE occupation_data DROP COLUMN projected_median_annual_wage_year');
      console.log('✅ Removed projected_median_annual_wage_year from occupation_data');
    }
    
    console.log('\n🔍 Now checking occupations table...');
    
    // Check occupations table columns
    const occupationsInfo = await db.execute('PRAGMA table_info(occupations)');
    const occupationsColumns = occupationsInfo.rows.map(row => row.name);
    
    console.log('📋 occupations columns:', occupationsColumns.join(', '));
    
    const occupationsHasCategory = occupationsColumns.includes('category');
    const occupationsHasProjectedWage = occupationsColumns.includes('projected_median_annual_wage');
    const occupationsHasProjectedYear = occupationsColumns.includes('projected_median_annual_wage_year');
    
    console.log('\n📊 occupations table status:');
    console.log(`  category: ${occupationsHasCategory ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  projected_median_annual_wage: ${occupationsHasProjectedWage ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  projected_median_annual_wage_year: ${occupationsHasProjectedYear ? '✅ EXISTS' : '❌ MISSING'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.close();
  }
}

checkAndFixColumns();
