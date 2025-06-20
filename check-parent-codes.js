const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  console.log('🔍 Checking specific hierarchy relationships...\n');
  
  // Check Management-related occupations
  const managementCodes = [
    '11-0000', // Management Occupations (should be root)
    '11-1000', // Top Executives (should be under 11-0000)
    '11-1011', // Chief Executives (should be under 11-1000)
    '11-2000', // Marketing and Sales Managers (should be under 11-0000)
    '11-2021'  // Marketing Managers (should be under 11-2000)
  ];
  
  for (const code of managementCodes) {
    const result = await db.execute({
      sql: 'SELECT code, name, parent_code, occupation_type FROM occupations WHERE code = ?',
      args: [code]
    });
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log(`${row.code}: ${row.name}`);
      console.log(`  Type: ${row.occupation_type}`);
      console.log(`  Parent: ${row.parent_code || 'NULL (root)'}`);
      console.log('');
    }
  }
  
  await db.close();
})();
