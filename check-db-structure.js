const { createClient } = require('@libsql/client');
const fs = require('fs');

// Read .env.local file
const envFile = fs.readFileSync('.env.local', 'utf8');
const TURSO_DATABASE_URL = envFile.match(/TURSO_DATABASE_URL=(.+)/)?.[1];
const TURSO_AUTH_TOKEN = envFile.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1];

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function checkDBStructure() {
  try {
    console.log('=== DATABASE TABLES ===');
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);
    
    console.log('Tables found:');
    tables.rows.forEach(row => console.log('- ' + row.name));
    
    console.log('\n=== OCCUPATIONS TABLE STRUCTURE ===');
    const occupationsSchema = await client.execute(`
      PRAGMA table_info(occupations);
    `);
    
    console.log('Occupations columns:');
    occupationsSchema.rows.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
    });
    
    console.log('\n=== SAMPLE OCCUPATION DATA ===');
    const sampleData = await client.execute(`
      SELECT * FROM occupations LIMIT 5;
    `);
    
    console.log('Sample rows:');
    sampleData.rows.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });
    
    console.log('\n=== MAJOR GROUPS TABLE STRUCTURE ===');
    const majorGroupsSchema = await client.execute(`
      PRAGMA table_info(major_groups);
    `);
    
    console.log('Major groups columns:');
    majorGroupsSchema.rows.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
    });
    
    console.log('\n=== SAMPLE MAJOR GROUPS DATA ===');
    const majorGroupsData = await client.execute(`
      SELECT * FROM major_groups LIMIT 10;
    `);
    
    console.log('Major groups:');
    majorGroupsData.rows.forEach((row, index) => {
      console.log(`${row.code}: ${row.title}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDBStructure();
