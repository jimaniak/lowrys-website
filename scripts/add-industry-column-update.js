// Script to add industry column to existing seo_intake_forms table
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

// Database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addIndustryColumn() {
  try {
    console.log('🔧 Adding industry column to seo_intake_forms table...');
    
    // Add industry column
    await db.execute(`
      ALTER TABLE seo_intake_forms 
      ADD COLUMN industry TEXT DEFAULT 'pest-control'
    `);
    
    console.log('✅ Successfully added industry column!');
    
    // Create index for industry column
    console.log('📊 Creating index for industry column...');
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_seo_intake_industry ON seo_intake_forms(industry)
    `);
    
    console.log('✅ Industry index created!');
    
    // Verify the column was added
    const schemaResult = await db.execute('PRAGMA table_info(seo_intake_forms)');
    console.log('📋 Updated table schema:');
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`);
    });

  } catch (error) {
    console.error('❌ Error adding industry column:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Run the update
addIndustryColumn()
  .then(() => {
    console.log('🎉 Industry column setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
