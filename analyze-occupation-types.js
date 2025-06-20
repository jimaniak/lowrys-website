const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  console.log('🔍 Analyzing occupation_type field data...\n');
  
  // Show all occupation types and their counts
  const result = await client.execute('SELECT occupation_type, COUNT(*) as count FROM occupations GROUP BY occupation_type ORDER BY count DESC');
  console.log('📊 All occupation_type values:');
  result.rows.forEach(row => {
    console.log(`  "${row.occupation_type || 'NULL'}": ${row.count}`);
  });
  
  // Show samples of each type with their codes to understand the pattern
  console.log('\n🔍 Sample codes by type:');
  for (const typeRow of result.rows) {
    const type = typeRow.occupation_type;
    const samples = await client.execute({
      sql: 'SELECT code, name FROM occupations WHERE occupation_type = ? OR (occupation_type IS NULL AND ? IS NULL) LIMIT 3',
      args: [type, type]
    });
    console.log(`\n${type || 'NULL'} examples:`);
    samples.rows.forEach(sample => {
      console.log(`  ${sample.code}: ${sample.name}`);
    });
  }
  
  // Let's also check the hierarchy patterns by code structure
  console.log('\n🏗️ Hierarchy patterns by code structure:');
  const patterns = await client.execute(`
    SELECT 
      CASE 
        WHEN code LIKE '%-0000' THEN 'Major (XX-0000)'
        WHEN code LIKE '%-_000' THEN 'Minor (XX-X000)'  
        WHEN code LIKE '%-__00' THEN 'Broad (XX-XX00)'
        ELSE 'Detailed'
      END as level,
      COUNT(*) as count
    FROM occupations 
    WHERE code IS NOT NULL
    GROUP BY 1
    ORDER BY count DESC
  `);
  
  patterns.rows.forEach(row => {
    console.log(`  ${row.level}: ${row.count}`);
  });
  
  await client.close();
})();
