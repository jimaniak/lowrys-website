const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addAllMissingColumns() {
  console.log('🔧 Adding ALL missing columns to occupations table...\n');
  
  try {
    // First, let's add ALL the columns we found
    const columnsToAdd = [
      'occupation_type TEXT',
      'employment_2023 INTEGER',
      'employment_2033 INTEGER', 
      'employment_change_numeric INTEGER',
      'employment_change_percent REAL',
      'employment_distribution_percent_2023 REAL',
      'employment_distribution_percent_2033 REAL',
      'labor_force_exit_rate REAL',
      'labor_force_exits INTEGER',
      'median_annual_wage_2023 TEXT',
      'median_annual_wage_2024 TEXT',
      'national_employment_matrix_link TEXT',
      'occupational_openings_annual_average INTEGER',
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
    
    console.log('\n🔄 Now populating columns from bls_special_tables data...');
    
    // Get all unique occupation codes from bls_special_tables
    const occupationCodes = await db.execute(`
      SELECT DISTINCT occupation_code 
      FROM bls_special_tables 
      WHERE additional_data IS NOT NULL
    `);
    
    console.log(`Found ${occupationCodes.rows.length} occupation codes to process...`);
    
    let processed = 0;
    for (const row of occupationCodes.rows) {
      const code = row.occupation_code;
      
      // Get the most comprehensive data for this occupation
      const dataResult = await db.execute(`
        SELECT additional_data 
        FROM bls_special_tables 
        WHERE occupation_code = ? AND additional_data IS NOT NULL
        ORDER BY LENGTH(additional_data) DESC
        LIMIT 1
      `, [code]);
      
      if (dataResult.rows.length > 0) {
        const data = JSON.parse(dataResult.rows[0].additional_data);
        
        // Extract ALL the fields
        const updates = {
          occupation_type: data['Occupation type'] || null,
          employment_2023: parseInt(data['Employment, 2023']) || null,
          employment_2033: parseInt(data['Employment, 2033']) || null,
          employment_change_numeric: parseInt(data['Employment change, numeric, 2023-33'] || data['Employment change, numeric, 2023–33']) || null,
          employment_change_percent: parseFloat(data['Employment change, percent, 2023-33'] || data['Employment change, percent, 2023–33']) || null,
          employment_distribution_percent_2023: parseFloat(data['Employment distribution, percent, 2023']) || null,
          employment_distribution_percent_2033: parseFloat(data['Employment distribution, percent, 2033']) || null,
          labor_force_exit_rate: parseFloat(data['Labor force exit rate, 2023–33 annual average']) || null,
          labor_force_exits: parseInt(data['Labor force exits, 2023–33 annual average']) || null,
          median_annual_wage_2023: data['Median annual wage, dollars, 2023[1]'] || null,
          median_annual_wage_2024: data['Median annual wage, dollars, 2024[1]'] || null,
          national_employment_matrix_link: data['National Employment Matrix Link'] || null,
          occupational_openings_annual_average: parseInt(data['Occupational openings, 2023-33 annual average'] || data['Occupational openings, 2023–33 annual average']) || null,
          occupational_transfer_rate: parseFloat(data['Occupational transfer rate, 2023–33 annual average']) || null,
          occupational_transfers: parseInt(data['Occupational transfers, 2023–33 annual average']) || null,
          percent_self_employed: parseFloat(data['Percent self employed, 2023']) || null,
          related_ooh_content: data['Related Occupational Outlook Handbook (OOH) content'] || null,
          total_occupational_separations_rate: parseFloat(data['Total occupational separations rate, 2023–33 annual average']) || null,
          total_occupational_separations: parseInt(data['Total occupational separations, 2023–33 annual average']) || null,
          typical_education: data['Typical education needed for entry'] || null,
          typical_on_job_training: data['Typical on-the-job training needed to attain competency in the occupation'] || null,
          work_experience: data['Work experience in a related occupation'] || null
        };
        
        // Update the occupation record with ALL the data
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(code); // for WHERE clause
        
        await db.execute(`
          UPDATE occupations 
          SET ${setClause}
          WHERE code = ?
        `, values);
        
        processed++;
        if (processed % 100 === 0) {
          console.log(`Processed ${processed} occupations...`);
        }
      }
    }
    
    console.log(`\n✅ Successfully processed ${processed} occupations with ALL columns!`);
    
    // Verify the updated schema
    console.log('\n📋 Updated occupations table schema:');
    const schema = await db.execute('PRAGMA table_info(occupations)');
    schema.rows.forEach(col => console.log(`  - ${col.name}: ${col.type}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

addAllMissingColumns();
