// Quick script to fix parent_code relationships
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  console.log('🔧 Quick fix for parent_code relationships...\n');
  
  // Clear all parent_code values first
  await client.execute('UPDATE occupations SET parent_code = NULL');
  console.log('✅ Cleared all parent codes\n');
  
  // Get some sample occupation codes to fix
  const occupations = await client.execute(`
    SELECT code, name FROM occupations 
    WHERE code LIKE '11-%' 
    ORDER BY code 
    LIMIT 20
  `);
  
  console.log('📋 Processing Management occupations...');
  
  for (const row of occupations.rows) {
    const code = row.code;
    const name = row.name;
    
    let parentCode = null;
    let level = '';
    
    if (code.endsWith('-0000')) {
      // Major Group (11-0000)
      parentCode = null;
      level = 'Major';
    } else if (code.match(/-\d000$/)) {
      // Minor Group (11-1000, 11-2000, etc.)
      parentCode = code.substring(0, 2) + '-0000';
      level = 'Minor';
    } else {
      // Detailed Occupation (11-1011, etc.)
      const parts = code.split('-');
      if (parts.length === 2 && parts[1].length >= 1) {
        parentCode = parts[0] + '-' + parts[1].charAt(0) + '000';
        level = 'Detailed';
      }
    }
    
    if (parentCode !== null) {
      await client.execute({
        sql: 'UPDATE occupations SET parent_code = ? WHERE code = ?',
        args: [parentCode, code]
      });
    }
    
    console.log(`  ${level}: ${code} → Parent: ${parentCode || 'ROOT'}`);
  }
  
  console.log('\n🎉 Fixed parent relationships for Management occupations');
  await client.close();
})();
