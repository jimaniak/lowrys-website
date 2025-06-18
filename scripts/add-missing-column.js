#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'db', 'database.db');

console.log('Adding missing total_employment column to occupation_data table...');

try {
  // Open database connection
  const db = new Database(dbPath);
  
  // Check if column exists first
  const tableInfo = db.prepare("PRAGMA table_info(occupation_data)").all();
  const hasColumn = tableInfo.some(col => col.name === 'total_employment');
  
  if (hasColumn) {
    console.log('✓ total_employment column already exists');
  } else {
    console.log('Adding total_employment column...');
    
    // Add the missing column
    db.exec(`
      ALTER TABLE occupation_data 
      ADD COLUMN total_employment INTEGER NULL DEFAULT NULL;
    `);
    
    console.log('✓ Successfully added total_employment column');
  }
  
  // Verify the column was added
  const updatedTableInfo = db.prepare("PRAGMA table_info(occupation_data)").all();
  console.log('\nUpdated occupation_data table schema:');
  updatedTableInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'} - ${col.dflt_value ? `DEFAULT: ${col.dflt_value}` : 'NO DEFAULT'} ${col.pk ? '- PRIMARY KEY' : ''}`);
  });
  
  db.close();
  console.log('\n✓ Database connection closed');
  
} catch (error) {
  console.error('❌ Error adding column:', error.message);
  process.exit(1);
}
