const { createClient } = require('@libsql/client');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function runSchema() {
  try {
    console.log('Connecting to Turso database...');
    console.log('URL:', process.env.TURSO_DATABASE_URL);
    
    const schema = fs.readFileSync('db/schema.sql', 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 100) + '...');
        await client.execute(statement);
      }
    }
    
    console.log('✅ Schema migration completed successfully!');
    
    // Test the connection by listing tables
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Created tables:', result.rows.map(row => row.name));
    
  } catch (error) {
    console.error('❌ Schema migration failed:', error);
    process.exit(1);
  }
}

runSchema();
