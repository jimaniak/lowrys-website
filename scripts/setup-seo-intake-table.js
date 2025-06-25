// Script to create the SEO intake form table in Turso database
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

// Database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function setupSeoIntakeTable() {
  try {
    console.log('🔍 Checking if seo_intake_forms table exists...');
    
    // Check if table exists
    try {
      const checkResult = await db.execute(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='seo_intake_forms'
      `);
      
      if (checkResult.rows.length > 0) {
        console.log('✅ Table seo_intake_forms already exists!');
        
        // Test the table with a simple query
        const testResult = await db.execute('SELECT COUNT(*) as count FROM seo_intake_forms');
        console.log(`📊 Current records in table: ${testResult.rows[0]?.count || 0}`);
        return;
      }
    } catch (error) {
      console.log('❌ Table does not exist, proceeding with creation...');
    }

    console.log('🏗️  Creating seo_intake_forms table...');

    // Read and execute the schema
    const schemaPath = path.join(__dirname, '..', 'src', 'app', 'api', 'seo-intake', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
        await db.execute(statement.trim());
      }
    }
    
    console.log('✅ Successfully created seo_intake_forms table!');
    
    // Verify the table was created
    const verifyResult = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='seo_intake_forms'
    `);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Table creation verified!');
      
      // Show table schema
      const schemaResult = await db.execute('PRAGMA table_info(seo_intake_forms)');
      console.log('📋 Table schema:');
      schemaResult.rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
      });
    } else {
      console.log('❌ Table creation could not be verified');
    }

  } catch (error) {
    console.error('❌ Error setting up SEO intake table:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Run the setup
setupSeoIntakeTable()
  .then(() => {
    console.log('🎉 SEO intake table setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
