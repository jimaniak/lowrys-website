// Add missing columns to occupations table (not occupation_data)
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addColumnsToOccupationsTable() {
  try {
    console.log('🔧 Adding missing columns to OCCUPATIONS table...\n');
    
    // Add category column
    try {
      await db.execute('ALTER TABLE occupations ADD COLUMN category TEXT');
      console.log('✅ Added category column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('✅ category column already exists');
      } else {
        throw e;
      }
    }
    
    // Add projected_median_annual_wage column
    try {
      await db.execute('ALTER TABLE occupations ADD COLUMN projected_median_annual_wage INTEGER');
      console.log('✅ Added projected_median_annual_wage column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('✅ projected_median_annual_wage column already exists');
      } else {
        throw e;
      }
    }
    
    // Add projected_median_annual_wage_year column
    try {
      await db.execute('ALTER TABLE occupations ADD COLUMN projected_median_annual_wage_year INTEGER');
      console.log('✅ Added projected_median_annual_wage_year column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('✅ projected_median_annual_wage_year column already exists');
      } else {
        throw e;
      }
    }
    
    console.log('\n🔍 Verifying columns were added...');
    
    // Verify columns were added
    const result = await db.execute('PRAGMA table_info(occupations)');
    const columns = result.rows.map(row => row.name);
    
    const hasCategory = columns.includes('category');
    const hasProjectedWage = columns.includes('projected_median_annual_wage');
    const hasProjectedYear = columns.includes('projected_median_annual_wage_year');
    
    console.log('📊 Final status:');
    console.log(`  category: ${hasCategory ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  projected_median_annual_wage: ${hasProjectedWage ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  projected_median_annual_wage_year: ${hasProjectedYear ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (hasCategory && hasProjectedWage && hasProjectedYear) {
      console.log('\n🎉 All columns successfully added to occupations table!');
    } else {
      console.log('\n⚠️ Some columns are still missing!');
    }
    
  } catch (error) {
    console.error('❌ Error adding columns:', error);
  } finally {
    await db.close();
  }
}

addColumnsToOccupationsTable();
