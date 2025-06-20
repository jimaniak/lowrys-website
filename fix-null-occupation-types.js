const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  console.log('🔍 Analyzing NULL occupation_type values...\n');
  
  // Get all NULL occupation_type records
  const nullRecords = await client.execute(`
    SELECT code, name, parent_code 
    FROM occupations 
    WHERE occupation_type IS NULL 
    ORDER BY code
  `);
  
  console.log(`Found ${nullRecords.rows.length} records with NULL occupation_type`);
  
  let summaryCount = 0;
  let lineItemCount = 0;
  
  // Analyze each NULL record to determine if it should be Summary or Line item
  for (const record of nullRecords.rows) {
    const code = record.code;
    const name = record.name;
    
    // Check if this code is a parent to other occupations
    const childrenResult = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM occupations WHERE parent_code = ?',
      args: [code]
    });
    
    const hasChildren = childrenResult.rows[0].count > 0;
    
    // If it has children, it's likely a Summary
    // If it has no children, it's likely a Line item
    const shouldBeSummary = hasChildren;
    
    if (shouldBeSummary) {
      summaryCount++;
      console.log(`📁 ${code}: ${name} -> Summary (has ${childrenResult.rows[0].count} children)`);
    } else {
      lineItemCount++;
      console.log(`📄 ${code}: ${name} -> Line item (no children)`);
    }
  }
  
  console.log(`\n📊 Classification results:`);
  console.log(`  Will be Summary: ${summaryCount}`);
  console.log(`  Will be Line item: ${lineItemCount}`);
  
  // Ask for confirmation before updating
  console.log('\n🤔 This analysis suggests the classification above.');
  console.log('   Run this script with --fix to apply the changes.');
  
  if (process.argv.includes('--fix')) {
    console.log('\n🔧 Applying fixes...');
    
    let updated = 0;
    for (const record of nullRecords.rows) {
      const code = record.code;
      
      // Check if this code is a parent to other occupations
      const childrenResult = await client.execute({
        sql: 'SELECT COUNT(*) as count FROM occupations WHERE parent_code = ?',
        args: [code]
      });
      
      const hasChildren = childrenResult.rows[0].count > 0;
      const newType = hasChildren ? 'Summary' : 'Line item';
      
      await client.execute({
        sql: 'UPDATE occupations SET occupation_type = ? WHERE code = ?',
        args: [newType, code]
      });
      
      updated++;
    }
    
    console.log(`✅ Updated ${updated} records`);
  }
  
  await client.close();
})();
