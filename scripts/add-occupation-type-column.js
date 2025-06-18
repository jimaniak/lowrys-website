const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({ 
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function addOccupationTypeColumn() {
  console.log('🔧 Adding occupation_type column to occupations table...');
  
  try {
    // Add the column
    await db.execute('ALTER TABLE occupations ADD COLUMN occupation_type TEXT');
    console.log('✅ Added occupation_type column');
    
    // Get all occupations with their BLS special table data
    const result = await db.execute(`
      SELECT o.code, o.name, bst.additional_data 
      FROM occupations o
      LEFT JOIN bls_special_tables bst ON o.code = bst.occupation_code 
      WHERE bst.table_number = 'Table 1.2'
    `);
    
    console.log(`📊 Found ${result.rows.length} occupations with Table 1.2 data`);
    
    // Update occupation_type for each occupation
    let updated = 0;
    for (const row of result.rows) {
      try {
        const additionalData = JSON.parse(row.additional_data || '{}');
        const occupationType = additionalData['Occupation type'] || 'Unknown';
        
        await db.execute({
          sql: 'UPDATE occupations SET occupation_type = ? WHERE code = ?',
          args: [occupationType, row.code]
        });
        
        updated++;
        if (updated % 100 === 0) {
          console.log(`📝 Updated ${updated} occupations...`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${row.code}:`, error.message);
      }
    }
    
    console.log(`✅ Updated ${updated} occupations with occupation_type`);
    
    // Check the results
    const typeCheck = await db.execute(`
      SELECT occupation_type, COUNT(*) as count 
      FROM occupations 
      WHERE occupation_type IS NOT NULL 
      GROUP BY occupation_type 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Occupation type distribution:');
    for (const row of typeCheck.rows) {
      console.log(`  ${row.occupation_type}: ${row.count}`);
    }
    
    // Set default for any remaining NULL values
    await db.execute(`
      UPDATE occupations 
      SET occupation_type = 'Line item' 
      WHERE occupation_type IS NULL
    `);
    
    console.log('✅ Set default occupation_type for remaining entries');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  process.exit(0);
}

addOccupationTypeColumn();
