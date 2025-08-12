// Drop Year-Specific Columns Script
// Run this AFTER verifying data consistency with complete-database-normalization.js
// This script removes all the problematic year-specific columns

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function dropYearColumns() {
  try {
    console.log('🗑️  Starting to drop year-specific columns...\n');

    // Get current schema
    const schema = await db.execute(`PRAGMA table_info(occupations)`);
    const columns = schema.rows.map(row => row.name);
    
    // Identify year-specific columns to drop
    const yearColumnsToKeep = [
      'base_year',
      'projection_year', 
      'median_annual_wage_year',
      'projected_median_annual_wage_year'
    ];
    
    const yearColumnsToDrop = columns.filter(col => {
      // Drop if contains year but not in keep list
      const hasYear = col.includes('_2023') || 
                     col.includes('_2033') || 
                     col.includes('_2034') ||
                     col.includes('2023') || 
                     col.includes('2033') || 
                     col.includes('2034');
      
      return hasYear && !yearColumnsToKeep.includes(col);
    });

    console.log('Columns to drop:');
    yearColumnsToDrop.forEach(col => console.log(`  - ${col}`));
    
    console.log('\nColumns to keep:');
    yearColumnsToKeep.forEach(col => {
      if (columns.includes(col)) {
        console.log(`  ✅ ${col}`);
      }
    });

    // Create new table without year-specific columns
    console.log('\n📋 Creating clean table structure...');
    
    const keepColumns = columns.filter(col => !yearColumnsToDrop.includes(col));
    const columnDefs = await getColumnDefinitions(keepColumns);
    
    await db.execute(`
      CREATE TABLE occupations_clean (
        ${columnDefs.join(',\n        ')}
      )
    `);
    
    console.log('✅ Created clean table structure');

    // Copy data to new table
    console.log('📋 Copying data to clean table...');
    const columnList = keepColumns.join(', ');
    
    await db.execute(`
      INSERT INTO occupations_clean (${columnList})
      SELECT ${columnList} FROM occupations
    `);
    
    console.log('✅ Data copied successfully');

    // Get row counts for verification
    const oldCount = await db.execute('SELECT COUNT(*) as count FROM occupations');
    const newCount = await db.execute('SELECT COUNT(*) as count FROM occupations_clean');
    
    console.log(`\n📊 Row count verification:`);
    console.log(`  Original table: ${oldCount.rows[0].count} rows`);
    console.log(`  Clean table: ${newCount.rows[0].count} rows`);
    
    if (oldCount.rows[0].count === newCount.rows[0].count) {
      console.log('✅ Row counts match - data migration successful');
      
      // Replace old table with clean table
      console.log('\n📋 Replacing old table with clean table...');
      
      await db.execute('DROP TABLE occupations');
      await db.execute('ALTER TABLE occupations_clean RENAME TO occupations');
      
      console.log('✅ Table replacement completed');
      
      // Show final schema
      console.log('\n📋 Final clean schema:');
      const finalSchema = await db.execute(`PRAGMA table_info(occupations)`);
      finalSchema.rows.forEach(row => {
        console.log(`  ${row.name} (${row.type})`);
      });
      
      console.log('\n🎉 Year-specific columns successfully removed!');
      console.log('The database now has a clean, normalized structure.');
      
    } else {
      console.error('❌ Row counts do not match - aborting table replacement');
      await db.execute('DROP TABLE occupations_clean');
    }
    
  } catch (error) {
    console.error('❌ Failed to drop year columns:', error);
    
    // Cleanup on error
    try {
      await db.execute('DROP TABLE IF EXISTS occupations_clean');
    } catch (cleanupError) {
      console.error('Failed to cleanup temporary table:', cleanupError);
    }
  } finally {
    await db.close();
  }
}

async function getColumnDefinitions(columns) {
  // Define the clean schema structure
  const columnTypes = {
    'code': 'TEXT PRIMARY KEY',
    'name': 'TEXT NOT NULL',
    'major_group_code': 'TEXT',
    'occupation_type': 'TEXT',
    'parent_code': 'TEXT',
    'category': 'TEXT',
    'base_year': 'INTEGER',
    'projection_year': 'INTEGER',
    'base_year_employment': 'INTEGER',
    'projection_year_employment': 'INTEGER',
    'employment_change_numeric': 'INTEGER',
    'employment_change_percent': 'REAL',
    'employment_distribution_percent_2023': 'REAL',
    'employment_distribution_percent_2033': 'REAL',
    'labor_force_exit_rate': 'REAL',
    'labor_force_exits': 'INTEGER',
    'median_annual_wage': 'INTEGER',
    'median_annual_wage_year': 'INTEGER',
    'projected_median_annual_wage': 'INTEGER',
    'projected_median_annual_wage_year': 'INTEGER',
    'national_employment_matrix_link': 'TEXT',
    'occupational_openings_annual_average': 'INTEGER',
    'occupational_transfer_rate': 'REAL',
    'occupational_transfers': 'INTEGER',
    'percent_self_employed': 'REAL',
    'related_ooh_content': 'TEXT',
    'total_occupational_separations_rate': 'REAL',
    'total_occupational_separations': 'INTEGER',
    'typical_education': 'TEXT',
    'typical_on_job_training': 'TEXT',
    'work_experience': 'TEXT'
  };
  
  return columns.map(col => {
    const type = columnTypes[col] || 'TEXT';
    return `${col} ${type}`;
  });
}

dropYearColumns();
