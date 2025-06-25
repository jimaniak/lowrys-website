// Add industry column to existing seo_intake_forms table
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addIndustryColumn() {
  try {
    console.log('🔧 Adding industry column to seo_intake_forms table...');
    
    await db.execute(`ALTER TABLE seo_intake_forms ADD COLUMN industry TEXT DEFAULT 'pest-control'`);
    
    console.log('✅ Successfully added industry column!');
    
    // Verify the column was added
    const schemaResult = await db.execute('PRAGMA table_info(seo_intake_forms)');
    console.log('📋 Updated table schema:');
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
    });

  } catch (error) {
    if (error.message.includes('duplicate column')) {
      console.log('ℹ️  Industry column already exists!');
    } else {
      console.error('❌ Error adding industry column:', error);
      throw error;
    }
  } finally {
    await db.close();
  }
}

addIndustryColumn()
  .then(() => {
    console.log('🎉 Industry column setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
