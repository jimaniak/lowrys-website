const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function fixHierarchy() {
  try {
    console.log('Starting hierarchy fix...');
    
    // Clear all parent codes
    await client.execute('UPDATE occupations SET parent_code = NULL');
    console.log('Cleared parent codes');
    
    // Get all occupations
    const result = await client.execute('SELECT code, name FROM occupations WHERE code IS NOT NULL ORDER BY code');
    console.log('Found', result.rows.length, 'occupations');
    
    let count = 0;
    for (const row of result.rows) {
      const code = row.code;
      if (!code || !code.includes('-')) continue;
      
      let parentCode = null;
      
      if (code.endsWith('-0000')) {
        // Major Group - no parent
        parentCode = null;
      } else if (code.match(/-\d000$/)) {
        // Minor Group - parent is Major
        parentCode = code.substring(0, 2) + '-0000';
      } else {
        // Detailed - parent is Minor
        const parts = code.split('-');
        if (parts.length === 2 && parts[1].length >= 1) {
          parentCode = parts[0] + '-' + parts[1].charAt(0) + '000';
        }
      }
      
      if (parentCode !== null) {
        await client.execute({
          sql: 'UPDATE occupations SET parent_code = ? WHERE code = ?',
          args: [parentCode, code]
        });
        count++;
      }
    }
    
    console.log('Updated', count, 'parent relationships');
    console.log('Hierarchy fix completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixHierarchy();
