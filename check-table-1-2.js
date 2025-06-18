import { db } from './src/lib/database.ts';

async function checkTable12() {
  console.log('📊 Checking BLS Table 1.2 occupation types...');
  
  try {
    // First check if we have any data in bls_special_tables
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM bls_special_tables WHERE table_number = 'Table 1.2'`,
      args: []
    });
    
    console.log(`Found ${countResult.rows[0].count} records in Table 1.2`);
    
    if (countResult.rows[0].count === 0) {
      console.log('❌ No Table 1.2 data found. Checking all tables...');
      const allTables = await db.execute({
        sql: `SELECT DISTINCT table_number FROM bls_special_tables ORDER BY table_number`,
        args: []
      });
      console.log('Available tables:', allTables.rows.map(r => r.table_number));
      process.exit(0);
    }

    // Check what occupation types exist in Table 1.2
    const result = await db.execute({
      sql: `SELECT DISTINCT occupation_type 
            FROM bls_special_tables 
            WHERE table_number = 'Table 1.2' 
            ORDER BY occupation_type`,
      args: []
    });

    console.log('\n🏷️ Occupation types in Table 1.2:');
    result.rows.forEach(row => {
      console.log(`  - ${row.occupation_type}`);
    });

    // Check a few examples of each type
    const types = result.rows.map(r => r.occupation_type);
    
    for (const type of types.slice(0, 3)) { // Check first 3 types
      console.log(`\n📋 Examples of "${type}" occupations:`);
      const examples = await db.execute({
        sql: `SELECT occupation_code, occupation_title 
              FROM bls_special_tables 
              WHERE table_number = 'Table 1.2' AND occupation_type = ?
              ORDER BY occupation_code
              LIMIT 5`,
        args: [type]
      });
      
      examples.rows.forEach(row => {
        console.log(`  ${row.occupation_code}: ${row.occupation_title}`);
      });
    }

    // Also check the occupations table for occupation_type
    console.log('\n🏢 Checking occupations table for occupation_type field...');
    const occupationsSchema = await db.execute({
      sql: `PRAGMA table_info(occupations)`,
      args: []
    });
    
    console.log('Occupations table columns:');
    occupationsSchema.rows.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkTable12();
