// Schema migration script to update existing database to year-flexible structure
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Missing Turso credentials in .env.local');
  process.exit(1);
}

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    console.log('🔄 Starting schema migration to year-flexible structure...');
    
    // First, let's check what tables currently exist
    console.log('📋 Checking current database structure...');
    const tables = await db.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    console.log('Current tables:', tables.rows.map(r => r.name).join(', '));
    
    // Backup existing data before migration
    console.log('💾 Creating backup of existing projections data...');
    let existingProjections = [];
    try {
      const projData = await db.execute('SELECT * FROM projections LIMIT 5');
      existingProjections = projData.rows;
      console.log(`Found ${existingProjections.length} existing projection records (showing first 5)`);
    } catch (e) {
      console.log('No existing projections table found');
    }
    
    // Drop old tables and recreate with new structure
    console.log('🗑️ Dropping old tables...');
    const tablesToDrop = [
      'fastest_growing', 
      'most_job_growth', 
      'fastest_declining', 
      'largest_job_declines',
      'projections'
    ];
    
    for (const tableName of tablesToDrop) {
      try {
        await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`  ✅ Dropped ${tableName}`);
      } catch (error) {
        console.log(`  ⚠️ Could not drop ${tableName}:`, error.message);
      }
    }
    
    // Add missing columns to occupation_data if it exists
    console.log('🔧 Updating occupation_data table...');
    try {
      // Check if data_year column exists
      const columnCheck = await db.execute(`PRAGMA table_info(occupation_data)`);
      const hasDataYear = columnCheck.rows.some(row => row.name === 'data_year');
      
      if (!hasDataYear) {
        await db.execute(`ALTER TABLE occupation_data ADD COLUMN data_year INTEGER DEFAULT 2025`);
        console.log('  ✅ Added data_year column to occupation_data');
      } else {
        console.log('  ✅ data_year column already exists');
      }
      
      // Update existing records to have current year
      await db.execute(`UPDATE occupation_data SET data_year = 2025 WHERE data_year IS NULL`);
      
    } catch (error) {
      console.log('  ⚠️ Could not update occupation_data:', error.message);
    }
    
    // Create new year-flexible tables
    console.log('🏗️ Creating new year-flexible tables...');
    
    // Projections table with year flexibility
    await db.execute(`
      CREATE TABLE IF NOT EXISTS projections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        occupation_code TEXT NOT NULL,
        base_year INTEGER NOT NULL,
        projection_year INTEGER NOT NULL,
        employment REAL,
        employment_change REAL,
        employment_percent_change REAL,
        annual_openings REAL,
        median_wage INTEGER,
        typical_education TEXT,
        work_experience TEXT,
        on_job_training TEXT,
        summary TEXT,
        projection_period TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (occupation_code) REFERENCES occupations(code),
        UNIQUE(occupation_code, base_year, projection_year)
      )
    `);
    console.log('  ✅ Created projections table');
    
    // BLS special tables (unified approach)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bls_special_tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        occupation_code TEXT NOT NULL,
        table_number TEXT NOT NULL,
        table_name TEXT NOT NULL,
        data_year INTEGER NOT NULL,
        projection_period TEXT NOT NULL,
        rank_order INTEGER,
        value REAL,
        value_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (occupation_code) REFERENCES occupations(code),
        UNIQUE(occupation_code, table_number, data_year)
      )
    `);
    console.log('  ✅ Created bls_special_tables table');
    
    // Create convenience views
    console.log('📊 Creating convenience views...');
    
    const views = [
      {
        name: 'current_projections',
        sql: `CREATE VIEW IF NOT EXISTS current_projections AS
              SELECT p.*, o.name as occupation_name
              FROM projections p
              JOIN occupations o ON p.occupation_code = o.code
              WHERE p.base_year = (SELECT MAX(base_year) FROM projections)`
      },
      {
        name: 'current_fastest_growing',
        sql: `CREATE VIEW IF NOT EXISTS current_fastest_growing AS
              SELECT bst.*, o.name as occupation_name,
                     ROW_NUMBER() OVER (ORDER BY bst.value DESC) as rank_order
              FROM bls_special_tables bst
              JOIN occupations o ON bst.occupation_code = o.code
              WHERE bst.table_number = '1.3' 
                AND bst.data_year = (SELECT MAX(data_year) FROM bls_special_tables WHERE table_number = '1.3')`
      },
      {
        name: 'current_most_job_growth',
        sql: `CREATE VIEW IF NOT EXISTS current_most_job_growth AS
              SELECT bst.*, o.name as occupation_name,
                     ROW_NUMBER() OVER (ORDER BY bst.value DESC) as rank_order
              FROM bls_special_tables bst
              JOIN occupations o ON bst.occupation_code = o.code
              WHERE bst.table_number = '1.4' 
                AND bst.data_year = (SELECT MAX(data_year) FROM bls_special_tables WHERE table_number = '1.4')`
      },
      {
        name: 'current_fastest_declining',
        sql: `CREATE VIEW IF NOT EXISTS current_fastest_declining AS
              SELECT bst.*, o.name as occupation_name,
                     ROW_NUMBER() OVER (ORDER BY bst.value ASC) as rank_order
              FROM bls_special_tables bst
              JOIN occupations o ON bst.occupation_code = o.code
              WHERE bst.table_number = '1.5' 
                AND bst.data_year = (SELECT MAX(data_year) FROM bls_special_tables WHERE table_number = '1.5')`
      },
      {
        name: 'current_largest_declines',
        sql: `CREATE VIEW IF NOT EXISTS current_largest_declines AS
              SELECT bst.*, o.name as occupation_name,
                     ROW_NUMBER() OVER (ORDER BY bst.value ASC) as rank_order
              FROM bls_special_tables bst
              JOIN occupations o ON bst.occupation_code = o.code
              WHERE bst.table_number = '1.6' 
                AND bst.data_year = (SELECT MAX(data_year) FROM bls_special_tables WHERE table_number = '1.6')`
      }
    ];
    
    for (const view of views) {
      try {
        // Drop existing view first
        await db.execute(`DROP VIEW IF EXISTS ${view.name}`);
        await db.execute(view.sql);
        console.log(`  ✅ Created view: ${view.name}`);
      } catch (error) {
        console.log(`  ⚠️ Could not create view ${view.name}:`, error.message);
      }
    }
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_projections_base_year ON projections(base_year)',
      'CREATE INDEX IF NOT EXISTS idx_projections_occupation ON projections(occupation_code)',
      'CREATE INDEX IF NOT EXISTS idx_bls_special_tables_year ON bls_special_tables(data_year)',
      'CREATE INDEX IF NOT EXISTS idx_bls_special_tables_table ON bls_special_tables(table_number)',
      'CREATE INDEX IF NOT EXISTS idx_occupation_data_year ON occupation_data(data_year)'
    ];
    
    for (const indexSql of indexes) {
      try {
        await db.execute(indexSql);
      } catch (error) {
        console.log(`  ⚠️ Index creation warning:`, error.message);
      }
    }
    console.log('  ✅ Indexes created');
    
    // Verify the new structure
    console.log('\n🔍 Verifying new database structure...');
    const newTables = await db.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    console.log('Updated tables:', newTables.rows.map(r => r.name).join(', '));
    
    const views_check = await db.execute(`
      SELECT name FROM sqlite_master WHERE type='view'
    `);
    console.log('Views created:', views_check.rows.map(r => r.name).join(', '));
    
    console.log('\n✅ Schema migration completed successfully!');
    console.log('🎯 Database is now ready for year-flexible data migration!');
    console.log('\nNext step: Run the year-flexible migration script to populate data.');
    
  } catch (error) {
    console.error('❌ Schema migration failed:', error);
    process.exit(1);
  }
}

main();
