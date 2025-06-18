const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkAllSchema() {
  console.log('🔍 Checking current database schema vs available data...\n');
  
  try {
    // Check current occupations table schema
    console.log('📋 Current occupations table schema:');
    const schema = await db.execute('PRAGMA table_info(occupations)');
    schema.rows.forEach(col => console.log(`  - ${col.name}: ${col.type}`));
    
    // Check what data fields exist in bls_special_tables
    console.log('\n📊 Sample bls_special_tables additional_data fields:');
    const sample = await db.execute('SELECT additional_data FROM bls_special_tables WHERE additional_data IS NOT NULL LIMIT 5');
    
    const allFields = new Set();
    sample.rows.forEach((row, i) => {
      const data = JSON.parse(row.additional_data);
      const fields = Object.keys(data);
      console.log(`\nSample ${i+1} fields:`, fields);
      fields.forEach(field => allFields.add(field));
    });
    
    console.log('\n🎯 ALL UNIQUE FIELDS found in additional_data:');
    Array.from(allFields).sort().forEach(field => console.log(`  - ${field}`));
    
    // Check original data structure
    console.log('\n📁 Checking original occupation data structure...');
    const origSample = await db.execute('SELECT * FROM occupations LIMIT 1');
    if (origSample.rows.length > 0) {
      console.log('Current occupations columns:', Object.keys(origSample.rows[0]));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkAllSchema();
