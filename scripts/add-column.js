const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'bls-data.db');
const db = new Database(dbPath);

try {
  console.log('Adding total_employment column to occupation_data table...');
  
  // Check if the column already exists
  const columns = db.prepare("PRAGMA table_info(occupation_data)").all();
  const hasColumn = columns.some(col => col.name === 'total_employment');
  
  if (hasColumn) {
    console.log('Column total_employment already exists');
  } else {
    db.exec('ALTER TABLE occupation_data ADD COLUMN total_employment INTEGER');
    console.log('Successfully added total_employment column');
  }
  
  // Verify the column was added
  const updatedColumns = db.prepare("PRAGMA table_info(occupation_data)").all();
  console.log('Current columns in occupation_data:');
  updatedColumns.forEach(col => {
    console.log(`  ${col.name} (${col.type})`);
  });
  
} catch (error) {
  console.error('Error adding column:', error);
} finally {
  db.close();
}
