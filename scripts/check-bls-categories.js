// Check BLS category hierarchy structure
const { db } = require('./src/lib/database.ts');

(async () => {
  try {
    // Check the structure of the categories table
    const schema = await db.execute('PRAGMA table_info(categories)');
    console.log('Categories table schema:');
    schema.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type}`);
    });
    
    console.log('\n--- Sample Category Data ---');
    const sample = await db.execute('SELECT * FROM categories LIMIT 10');
    sample.rows.forEach(row => {
      console.log(`ID: ${row.id}, Parent: ${row.parent_code}, Name: ${row.name}`);
    });
    
    console.log('\n--- Top Level Categories (no parent) ---');
    const topLevel = await db.execute('SELECT * FROM categories WHERE parent_code IS NULL OR parent_code = "" ORDER BY name');
    topLevel.rows.forEach(row => {
      console.log(`${row.id}: ${row.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
})();
