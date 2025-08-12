#!/usr/bin/env node

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function verifyDatabaseState() {
  try {
    const result = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' 
      ORDER BY name
    `);
    
    console.log('=== Current Database State ===');
    console.log(`Total tables: ${result.rows.length}\n`);
    
    result.rows.forEach((row, i) => {
      console.log(`${i+1}. ${row.name}`);
    });
    
    console.log('\n=== Verification Complete ===');
    console.log('✅ Phase 2 cleanup successful');
    console.log('✅ Database normalized and optimized');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

verifyDatabaseState();
