const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addYearFlexibleColumns() {
  console.log('🔧 Adding year-flexible columns to occupations table...\n');
  
  try {
    // Year-flexible columns - no hardcoded years in column names
    const columnsToAdd = [
      'occupation_type TEXT',
      'base_year INTEGER',
      'projection_year INTEGER', 
      'base_year_employment INTEGER',
      'projection_year_employment INTEGER',
      'employment_change_numeric REAL',
      'employment_change_percent REAL',
      'base_year_employment_distribution_percent REAL',
      'projection_year_employment_distribution_percent REAL',
      'labor_force_exit_rate REAL',
      'labor_force_exits INTEGER',
      'median_annual_wage TEXT',
      'median_annual_wage_year INTEGER',
      'national_employment_matrix_link TEXT',
      'occupational_openings_annual_average REAL',
      'occupational_transfer_rate REAL',
      'occupational_transfers INTEGER', 
      'percent_self_employed REAL',
      'related_ooh_content TEXT',
      'total_occupational_separations_rate REAL',
      'total_occupational_separations INTEGER',
      'typical_education TEXT',
      'typical_on_job_training TEXT',
      'work_experience TEXT'
    ];
    
    // Add each column
    for (const column of columnsToAdd) {
      try {
        await db.execute(`ALTER TABLE occupations ADD COLUMN ${column}`);
        console.log('✅ Added column:', column);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log('⚠️  Column already exists:', column);
        } else {
          console.log('❌ Error adding column:', column, error.message);
        }
      }
    }
    
    console.log('\n📊 Now populating columns from BLS special tables data...');
    
    // Get all occupations and their JSON data from bls_special_tables (Table 1.2)
    const result = await db.execute(`
      SELECT DISTINCT occupation_code, additional_data 
      FROM bls_special_tables 
      WHERE table_number = 'Table 1.2'
    `);
    
    console.log(`Found ${result.rows.length} occupations in Table 1.2`);
    
    let updated = 0;
    for (const row of result.rows) {
      try {
        const data = JSON.parse(row.additional_data);
        
        // Extract year-flexible data
        const baseYear = 2023; // Current base year
        const projectionYear = 2033; // Current projection year
        const medianWageYear = 2024; // Current wage data year
        
        await db.execute({
          sql: `UPDATE occupations SET 
            occupation_type = ?,
            base_year = ?,
            projection_year = ?,
            base_year_employment = ?,
            projection_year_employment = ?,
            employment_change_numeric = ?,
            employment_change_percent = ?,
            base_year_employment_distribution_percent = ?,
            projection_year_employment_distribution_percent = ?,
            labor_force_exit_rate = ?,
            labor_force_exits = ?,
            median_annual_wage = ?,
            median_annual_wage_year = ?,
            national_employment_matrix_link = ?,
            occupational_openings_annual_average = ?,
            occupational_transfer_rate = ?,
            occupational_transfers = ?,
            percent_self_employed = ?,
            related_ooh_content = ?,
            total_occupational_separations_rate = ?,
            total_occupational_separations = ?,
            typical_education = ?,
            typical_on_job_training = ?,
            work_experience = ?
          WHERE code = ?`,
          args: [
            data['Occupation type'] || null,
            baseYear,
            projectionYear,
            parseNumericValue(data['Employment, 2023']),
            parseNumericValue(data['Employment, 2033']),
            parseNumericValue(data['Employment change, numeric, 2023-33']),
            parseNumericValue(data['Employment change, percent, 2023-33']),
            parseNumericValue(data['Employment distribution, percent, 2023']),
            parseNumericValue(data['Employment distribution, percent, 2033']),
            parseNumericValue(data['Labor force exit rate']),
            parseNumericValue(data['Labor force exits']),
            data['Median annual wage, dollars, 2024[1]'] || null,
            medianWageYear,
            data['National Employment Matrix link'] || null,
            parseNumericValue(data['Occupational openings, annual average']),
            parseNumericValue(data['Occupational transfer rate']),
            parseNumericValue(data['Occupational transfers']),
            parseNumericValue(data['Percent self-employed']),
            data['Related OOH content'] || null,
            parseNumericValue(data['Total occupational separations rate']),
            parseNumericValue(data['Total occupational separations']),
            data['Typical education needed for entry'] || null,
            data['Typical on-the-job training needed to attain competency in the occupation'] || null,
            data['Work experience in a related occupation'] || null,
            row.occupation_code
          ]
        });
        
        updated++;
        if (updated % 100 === 0) {
          console.log(`Updated ${updated} occupations...`);
        }
      } catch (error) {
        console.error(`Error updating occupation ${row.occupation_code}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} occupations with year-flexible data!`);
    
    // Verify the update
    const verifyResult = await db.execute(`
      SELECT code, name, occupation_type, base_year, projection_year, 
             base_year_employment, projection_year_employment, median_annual_wage
      FROM occupations 
      WHERE occupation_type IS NOT NULL 
      LIMIT 5
    `);
    
    console.log('\n📋 Sample updated records:');
    verifyResult.rows.forEach(row => {
      console.log(`${row.code}: ${row.name} (${row.occupation_type}) - ${row.base_year}-${row.projection_year} employment: ${row.base_year_employment} → ${row.projection_year_employment}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

function parseNumericValue(value) {
  if (!value || value === '*' || value === '**') return null;
  const parsed = parseFloat(value.toString().replace(/,/g, ''));
  return isNaN(parsed) ? null : parsed;
}

addYearFlexibleColumns();
