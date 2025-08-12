// Quick check for database columns
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkColumns() {
  try {
    console.log('🔍 Checking database columns...');
    
    const result = await db.execute('PRAGMA table_info(occupations)');
    const columns = result.rows.map(row => row.name);
    
    console.log('📋 All columns:', columns.join(', '));
    
    const hasCategory = columns.includes('category');
    const hasProjectedWage = columns.includes('projected_median_annual_wage');
    const hasProjectedYear = columns.includes('projected_median_annual_wage_year');
    
    console.log('\n📊 Column Status:');
    console.log(`  category: ${hasCategory ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  projected_median_annual_wage: ${hasProjectedWage ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  projected_median_annual_wage_year: ${hasProjectedYear ? '✅ EXISTS' : '❌ MISSING'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.close();
  }
}

checkColumns();
