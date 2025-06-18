// Comprehensive migration script to populate all BLS tables from hierarchical data
// This extracts data from the Excel workbook tabs (stored in JSON format)

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

async function migrateAllBlsTables() {
  console.log('🚀 Starting comprehensive BLS tables migration...');

  try {
    // First, apply the extended schema
    console.log('📋 Applying extended database schema...');
    const schemaPath = path.join(process.cwd(), 'db', 'schema-extended.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.execute(statement.trim());
        } catch (error) {
          // Ignore table already exists errors
          if (!error.message.includes('already exists')) {
            console.warn('Schema warning:', error.message);
          }
        }
      }
    }

    // Load the hierarchical data with projections
    console.log('📂 Loading hierarchical BLS data...');
    const dataPath = path.join(process.cwd(), 'public', 'data', 'bls-benchmarks-hierarchical-with-projections.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Hierarchical data file not found:', dataPath);
      return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log('📊 Data structure:', Object.keys(data));

    // Process each major group and extract table data
    let totalRecords = 0;
    const tableStats = {
      table_13: 0, table_14: 0, table_15: 0, table_16: 0,
      table_17: 0, table_18: 0, table_19: 0, table_112: 0
    };

    for (const [majorGroupCode, majorGroupData] of Object.entries(data)) {
      console.log(`\n🔍 Processing major group: ${majorGroupCode}`);
      
      if (!majorGroupData.detailed || typeof majorGroupData.detailed !== 'object') {
        console.log('⚠️  No detailed data found for', majorGroupCode);
        continue;
      }

      // Process each detailed occupation
      for (const [occupationCode, occupationData] of Object.entries(majorGroupData.detailed)) {
        if (!occupationData || typeof occupationData !== 'object') continue;

        const occupationName = occupationData.name || 'Unknown';
        console.log(`  📝 Processing: ${occupationCode} - ${occupationName}`);

        // Extract projections data
        const projections = occupationData.projections || {};
        
        // Extract data for each BLS table based on occupation data structure
        const sheets = occupationData.sheets || {};
        
        // Process Table 1.3 - Fastest Growing
        if (sheets['Table 1.3'] || (projections.projected_percent && parseFloat(projections.projected_percent) >= 8)) {
          try {
            await db.execute({
              sql: `INSERT OR REPLACE INTO bls_table_13_fastest_growing 
                    (occupation_code, occupation_name, employment_2023, employment_2033, 
                     change_numeric, change_percent, median_wage_2023, typical_education, 
                     work_experience, on_job_training) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                occupationCode,
                occupationName,
                projections.projected_2023 ? parseInt(projections.projected_2023) : null,
                projections.projected_2033 ? parseInt(projections.projected_2033) : null,
                projections.projected_change ? parseInt(projections.projected_change) : null,
                projections.projected_percent ? parseFloat(projections.projected_percent) : null,
                projections.median_wage ? parseInt(projections.median_wage) : null,
                projections.typical_education || null,
                projections.work_experience || null,
                projections.on_job_training || null
              ]
            });
            tableStats.table_13++;
          } catch (error) {
            console.warn(`⚠️  Error inserting Table 1.3 data for ${occupationCode}:`, error.message);
          }
        }

        // Process Table 1.4 - Most Job Growth  
        if (sheets['Table 1.4'] || (projections.projected_change && parseInt(projections.projected_change) >= 50)) {
          try {
            await db.execute({
              sql: `INSERT OR REPLACE INTO bls_table_14_most_job_growth 
                    (occupation_code, occupation_name, employment_2023, employment_2033, 
                     change_numeric, change_percent, median_wage_2023, typical_education, 
                     work_experience, on_job_training) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                occupationCode,
                occupationName,
                projections.projected_2023 ? parseInt(projections.projected_2023) : null,
                projections.projected_2033 ? parseInt(projections.projected_2033) : null,
                projections.projected_change ? parseInt(projections.projected_change) : null,
                projections.projected_percent ? parseFloat(projections.projected_percent) : null,
                projections.median_wage ? parseInt(projections.median_wage) : null,
                projections.typical_education || null,
                projections.work_experience || null,
                projections.on_job_training || null
              ]
            });
            tableStats.table_14++;
          } catch (error) {
            console.warn(`⚠️  Error inserting Table 1.4 data for ${occupationCode}:`, error.message);
          }
        }

        // Process Table 1.5 - Fastest Declining
        if (sheets['Table 1.5'] || (projections.projected_percent && parseFloat(projections.projected_percent) <= -8)) {
          try {
            await db.execute({
              sql: `INSERT OR REPLACE INTO bls_table_15_fastest_declining 
                    (occupation_code, occupation_name, employment_2023, employment_2033, 
                     change_numeric, change_percent, median_wage_2023, typical_education, 
                     work_experience, on_job_training) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                occupationCode,
                occupationName,
                projections.projected_2023 ? parseInt(projections.projected_2023) : null,
                projections.projected_2033 ? parseInt(projections.projected_2033) : null,
                projections.projected_change ? parseInt(projections.projected_change) : null,
                projections.projected_percent ? parseFloat(projections.projected_percent) : null,
                projections.median_wage ? parseInt(projections.median_wage) : null,
                projections.typical_education || null,
                projections.work_experience || null,
                projections.on_job_training || null
              ]
            });
            tableStats.table_15++;
          } catch (error) {
            console.warn(`⚠️  Error inserting Table 1.5 data for ${occupationCode}:`, error.message);
          }
        }

        // Process Table 1.6 - Largest Declines
        if (sheets['Table 1.6'] || (projections.projected_change && parseInt(projections.projected_change) <= -50)) {
          try {
            await db.execute({
              sql: `INSERT OR REPLACE INTO bls_table_16_largest_declines 
                    (occupation_code, occupation_name, employment_2023, employment_2033, 
                     change_numeric, change_percent, median_wage_2023, typical_education, 
                     work_experience, on_job_training) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                occupationCode,
                occupationName,
                projections.projected_2023 ? parseInt(projections.projected_2023) : null,
                projections.projected_2033 ? parseInt(projections.projected_2033) : null,
                projections.projected_change ? parseInt(projections.projected_change) : null,
                projections.projected_percent ? parseFloat(projections.projected_percent) : null,
                projections.median_wage ? parseInt(projections.median_wage) : null,
                projections.typical_education || null,
                projections.work_experience || null,
                projections.on_job_training || null
              ]
            });
            tableStats.table_16++;
          } catch (error) {
            console.warn(`⚠️  Error inserting Table 1.6 data for ${occupationCode}:`, error.message);
          }
        }

        // Process Table 1.7 - Most Openings
        if (sheets['Table 1.7'] || (projections.projected_openings && parseInt(projections.projected_openings) >= 20)) {
          try {
            await db.execute({
              sql: `INSERT OR REPLACE INTO bls_table_17_most_openings 
                    (occupation_code, occupation_name, employment_2023, median_wage_2023, 
                     typical_education, work_experience, on_job_training, job_openings_annual) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                occupationCode,
                occupationName,
                projections.projected_2023 ? parseInt(projections.projected_2023) : null,
                projections.median_wage ? parseInt(projections.median_wage) : null,
                projections.typical_education || null,
                projections.work_experience || null,
                projections.on_job_training || null,
                projections.projected_openings ? parseInt(projections.projected_openings) : null
              ]
            });
            tableStats.table_17++;
          } catch (error) {
            console.warn(`⚠️  Error inserting Table 1.7 data for ${occupationCode}:`, error.message);
          }
        }

        // Process Table 1.8 - Highest Paying
        if (sheets['Table 1.8'] || (projections.median_wage && parseInt(projections.median_wage) >= 100000)) {
          try {
            await db.execute({
              sql: `INSERT OR REPLACE INTO bls_table_18_highest_paying 
                    (occupation_code, occupation_name, employment_2023, median_wage_2023, 
                     typical_education, work_experience, on_job_training) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
              args: [
                occupationCode,
                occupationName,
                projections.projected_2023 ? parseInt(projections.projected_2023) : null,
                projections.median_wage ? parseInt(projections.median_wage) : null,
                projections.typical_education || null,
                projections.work_experience || null,
                projections.on_job_training || null
              ]
            });
            tableStats.table_18++;
          } catch (error) {
            console.warn(`⚠️  Error inserting Table 1.8 data for ${occupationCode}:`, error.message);
          }
        }

        // Process Table 1.9 - STEM Occupations
        if (sheets['Table 1.9'] || occupationName.match(/engineer|computer|software|data|scientist|analyst|technician/i)) {
          try {
            const stemCategory = occupationName.match(/computer|software|data/i) ? 'Technology' :
                               occupationName.match(/engineer/i) ? 'Engineering' :
                               occupationName.match(/scientist/i) ? 'Science' :
                               occupationName.match(/analyst|statistician/i) ? 'Mathematics' : 'STEM';
            
            await db.execute({
              sql: `INSERT OR REPLACE INTO bls_table_19_stem_occupations 
                    (occupation_code, occupation_name, stem_category, employment_2023, employment_2033, 
                     change_numeric, change_percent, median_wage_2023, typical_education) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                occupationCode,
                occupationName,
                stemCategory,
                projections.projected_2023 ? parseInt(projections.projected_2023) : null,
                projections.projected_2033 ? parseInt(projections.projected_2033) : null,
                projections.projected_change ? parseInt(projections.projected_change) : null,
                projections.projected_percent ? parseFloat(projections.projected_percent) : null,
                projections.median_wage ? parseInt(projections.median_wage) : null,
                projections.typical_education || null
              ]
            });
            tableStats.table_19++;
          } catch (error) {
            console.warn(`⚠️  Error inserting Table 1.9 data for ${occupationCode}:`, error.message);
          }
        }

        // Populate occupation_categories lookup table
        for (const [tableKey, count] of Object.entries(tableStats)) {
          if (sheets[`Table 1.${tableKey.split('_')[1]}`] || 
              (tableKey === 'table_13' && projections.projected_percent && parseFloat(projections.projected_percent) >= 8) ||
              (tableKey === 'table_14' && projections.projected_change && parseInt(projections.projected_change) >= 50) ||
              (tableKey === 'table_15' && projections.projected_percent && parseFloat(projections.projected_percent) <= -8) ||
              (tableKey === 'table_16' && projections.projected_change && parseInt(projections.projected_change) <= -50)) {
            
            try {
              await db.execute({
                sql: `INSERT OR IGNORE INTO occupation_categories (occupation_code, table_name) VALUES (?, ?)`,
                args: [occupationCode, tableKey]
              });
            } catch (error) {
              // Ignore duplicate key errors
            }
          }
        }

        totalRecords++;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Records processed:', totalRecords);
    console.log('📋 Table statistics:');
    console.log('  - Table 1.3 (Fastest Growing):', tableStats.table_13);
    console.log('  - Table 1.4 (Most Job Growth):', tableStats.table_14);
    console.log('  - Table 1.5 (Fastest Declining):', tableStats.table_15);
    console.log('  - Table 1.6 (Largest Declines):', tableStats.table_16);
    console.log('  - Table 1.7 (Most Openings):', tableStats.table_17);
    console.log('  - Table 1.8 (Highest Paying):', tableStats.table_18);
    console.log('  - Table 1.9 (STEM Occupations):', tableStats.table_19);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateAllBlsTables().then(() => {
  console.log('🎉 All BLS tables migration completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
