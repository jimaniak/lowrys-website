const { createClient } = require('@libsql/client');
const path = require('path');

async function checkOccupationCount() {
  try {
    const db = createClient({
      url: `file:${path.join(__dirname, 'public/data/occupations.db')}`
    });

    // First, let's see what tables exist
    const tablesResult = await db.execute(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `);
    console.log('Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ${row.name}`);
    });

    await db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOccupationCount();
