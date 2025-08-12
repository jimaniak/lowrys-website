// Demonstration script showing how to query normalized BLS data
// Example: Get all metrics and text fields for Project Managers in Missouri

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function findProjectManagerOccupations() {
  console.log('🔍 Finding Project Manager occupations...\n');
  
  const result = await db.execute({
    sql: `
      SELECT code, name, occupation_type, category, parent_code 
      FROM occupations 
      WHERE name LIKE '%Project Manager%' OR name LIKE '%Project Management%'
      ORDER BY name
    `,
    args: []
  });
  
  console.log(`Found ${result.rows.length} Project Manager-related occupations:`);
  result.rows.forEach(row => {
    console.log(`  ${row.code}: ${row.name} (${row.category})`);
  });
  
  return result.rows;
}

async function getMissouriRegionInfo() {
  console.log('\n🗺️ Finding Missouri region information...\n');
  
  // Check for Missouri in legacy occupation_data (main source currently)
  const legacyResults = await db.execute({
    sql: `
      SELECT DISTINCT region, region_name, COUNT(*) as occupation_count
      FROM occupation_data 
      WHERE region_name LIKE '%Missouri%' OR region = 'MO'
      GROUP BY region, region_name
    `,
    args: []
  });
  
  console.log(`Found ${legacyResults.rows.length} Missouri entries in occupation_data:`);
  legacyResults.rows.forEach(row => {
    console.log(`  ${row.region}: ${row.region_name} (${row.occupation_count} occupations)`);
  });
  
  // Check if new normalized OEWS tables exist (they should after automation runs)
  let stateResults = [];
  try {
    const stateQuery = await db.execute({
      sql: `
        SELECT DISTINCT region_code, region_name, data_year
        FROM bls_state_oews 
        WHERE region_name LIKE '%Missouri%' OR region_code = 'MO'
        ORDER BY data_year DESC
      `,
      args: []
    });
    stateResults = stateQuery.rows;
    console.log(`\nFound ${stateResults.length} Missouri entries in bls_state_oews (normalized):`);
    stateResults.forEach(row => {
      console.log(`  ${row.region_code}: ${row.region_name} (${row.data_year})`);
    });
  } catch (error) {
    console.log('\n⚠️ bls_state_oews table not found (will be created when automation runs)');
  }
  
  return { stateResults, legacyResults: legacyResults.rows };
}

async function getBLSTableMetricsForOccupation(occupationCode) {
  console.log(`\n📊 Getting BLS table metrics for occupation ${occupationCode}...\n`);
  
  // Check existing BLS special tables
  const specialTablesResult = await db.execute({
    sql: `SELECT * FROM bls_special_tables WHERE occupation_code = ? ORDER BY table_number`,
    args: [occupationCode]
  });
  
  console.log(`Found ${specialTablesResult.rows.length} records in bls_special_tables:`);
  if (specialTablesResult.rows.length > 0) {
    console.log('\n📋 BLS Special Tables data:');
    specialTablesResult.rows.forEach((row, index) => {
      console.log(`  ${row.table_number} - ${row.table_name}:`);
      console.log(`    Value: ${row.value}, Type: ${row.value_type}`);
      console.log(`    Year: ${row.data_year}, Period: ${row.projection_period}`);
      if (row.additional_data) {
        try {
          const additional = JSON.parse(row.additional_data);
          console.log(`    Additional: ${Object.keys(additional).join(', ')}`);
        } catch (e) {
          console.log(`    Additional: ${row.additional_data}`);
        }
      }
      console.log('');
    });
  }
  
  // Get list of other available BLS normalized tables (these will exist after automation runs)
  const tableListResult = await db.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name LIKE 'bls_%' AND name NOT LIKE '%special%' AND name NOT LIKE '%state_data%'
    ORDER BY name
  `);
  
  const otherBLSTables = tableListResult.rows.map(row => row.name);
  console.log(`Other BLS normalized tables available: ${otherBLSTables.length}`);
  otherBLSTables.forEach(table => console.log(`  - ${table}`));
  
  // Query each available BLS table for this occupation
  const allMetrics = { bls_special_tables: specialTablesResult.rows };
  
  for (const tableName of otherBLSTables) {
    try {
      const result = await db.execute({
        sql: `SELECT * FROM ${tableName} WHERE code = ? LIMIT 5`,
        args: [occupationCode]
      });
      
      if (result.rows.length > 0) {
        console.log(`\n📋 Data from ${tableName}:`);
        result.rows.forEach((row, index) => {
          console.log(`  Record ${index + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              console.log(`    ${key}: ${value}`);
            }
          });
          console.log('');
        });
        allMetrics[tableName] = result.rows;
      }
    } catch (error) {
      console.log(`⚠️ ${tableName} not accessible: ${error.message}`);
    }
  }
  
  return allMetrics;
}

async function getCurrentWageDataForRegion(occupationCode, regionCode) {
  console.log(`\n💰 Getting current wage data for ${occupationCode} in region ${regionCode}...\n`);
  
  // Try new state OEWS data first (if available)
  let stateResult = null;
  try {
    const result = await db.execute({
      sql: `
        SELECT * FROM bls_state_oews 
        WHERE code = ? AND region_code = ?
        ORDER BY data_year DESC
        LIMIT 1
      `,
      args: [occupationCode, regionCode]
    });
    stateResult = result;
  } catch (error) {
    console.log('⚠️ bls_state_oews table not available yet (will be created when automation runs)');
  }
  
  if (stateResult && stateResult.rows.length > 0) {
    console.log('📊 State OEWS wage data (normalized):');
    const row = stateResult.rows[0];
    Object.entries(row).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        console.log(`  ${key}: ${value}`);
      }
    });
    return stateResult.rows[0];
  }
  
  // Use current legacy occupation_data
  const legacyResult = await db.execute({
    sql: `
      SELECT * FROM occupation_data 
      WHERE occupation_code = ? AND region = ?
      ORDER BY data_year DESC
      LIMIT 1
    `,
    args: [occupationCode, regionCode]
  });
  
  if (legacyResult.rows.length > 0) {
    console.log('📊 Current wage data from occupation_data:');
    const row = legacyResult.rows[0];
    Object.entries(row).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        console.log(`  ${key}: ${value}`);
      }
    });
    return legacyResult.rows[0];
  }
  
  console.log('❌ No wage data found for this occupation/region combination');
  return null;
}

async function getProjectionData(occupationCode) {
  console.log(`\n📈 Getting projection data for ${occupationCode}...\n`);
  
  const result = await db.execute({
    sql: `SELECT * FROM projections WHERE occupation_code = ? LIMIT 1`,
    args: [occupationCode]
  });
  
  if (result.rows.length > 0) {
    console.log('📊 Projection data:');
    const row = result.rows[0];
    Object.entries(row).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        console.log(`  ${key}: ${value}`);
      }
    });
    return result.rows[0];
  } else {
    console.log('❌ No projection data found');
    return null;
  }
}

async function demonstrateComprehensiveQuery() {
  console.log('🎯 COMPREHENSIVE QUERY DEMONSTRATION');
  console.log('=====================================');
  console.log('Finding all available data for Project Managers in Missouri\n');
  
  try {
    // Step 1: Find Project Manager occupations
    const projectManagers = await findProjectManagerOccupations();
    
    if (projectManagers.length === 0) {
      console.log('❌ No Project Manager occupations found');
      return;
    }
    
    // Use the first one for demonstration
    const selectedOccupation = projectManagers[0];
    console.log(`\n🎯 Selected occupation: ${selectedOccupation.code} - ${selectedOccupation.name}\n`);
    
    // Step 2: Find Missouri region information
    const regionInfo = await getMissouriRegionInfo();
    
    // Step 3: Get BLS table metrics for this occupation
    const blsMetrics = await getBLSTableMetricsForOccupation(selectedOccupation.code);
    
    // Step 4: Get current wage data for Missouri
    let wageData = null;
    if (regionInfo.stateResults.length > 0) {
      wageData = await getCurrentWageDataForRegion(selectedOccupation.code, 'MO');
    }
    if (!wageData && regionInfo.legacyResults.length > 0) {
      wageData = await getCurrentWageDataForRegion(selectedOccupation.code, regionInfo.legacyResults[0].region);
    }
    
    // Step 5: Get projection data
    const projectionData = await getProjectionData(selectedOccupation.code);
    
    // Summary
    console.log('\n📝 QUERY SUMMARY');
    console.log('================');
    console.log(`Occupation: ${selectedOccupation.name} (${selectedOccupation.code})`);
    console.log(`BLS Tables with data: ${Object.keys(blsMetrics).length}`);
    console.log(`Current wage data: ${wageData ? '✅ Found' : '❌ Not found'}`);
    console.log(`Projection data: ${projectionData ? '✅ Found' : '❌ Not found'}`);
    
    if (Object.keys(blsMetrics).length > 0) {
      console.log('\nAvailable BLS metrics from normalized tables:');
      Object.keys(blsMetrics).forEach(table => {
        console.log(`  - ${table}: ${blsMetrics[table].length} records`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in demonstration:', error);
  }
}

async function listAllAvailableTables() {
  console.log('\n📋 ALL AVAILABLE TABLES');
  console.log('========================\n');
  
  const result = await db.execute(`
    SELECT name, sql FROM sqlite_master 
    WHERE type='table' 
    ORDER BY 
      CASE 
        WHEN name LIKE 'bls_%' THEN 1
        WHEN name = 'occupations' THEN 2
        WHEN name = 'projections' THEN 3
        WHEN name = 'occupation_data' THEN 4
        ELSE 5
      END,
      name
  `);
  
  console.log('Database tables:');
  for (const row of result.rows) {
    console.log(`\n📊 ${row.name}`);
    
    // Get row count
    try {
      const countResult = await db.execute(`SELECT COUNT(*) as count FROM ${row.name}`);
      console.log(`   Rows: ${countResult.rows[0].count}`);
    } catch (e) {
      console.log(`   Rows: Unable to count`);
    }
    
    // Show table structure
    if (row.sql) {
      const createStatement = row.sql.replace(/CREATE TABLE [^(]+\(/, '').replace(/\)$/, '');
      const columns = createStatement.split(',').map(col => col.trim().split(' ')[0]).slice(0, 5);
      console.log(`   Key columns: ${columns.join(', ')}${columns.length >= 5 ? '...' : ''}`);
    }
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await listAllAvailableTables();
      await demonstrateComprehensiveQuery();
    } catch (error) {
      console.error('❌ Script error:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  findProjectManagerOccupations,
  getMissouriRegionInfo,
  getBLSTableMetricsForOccupation,
  getCurrentWageDataForRegion,
  getProjectionData,
  demonstrateComprehensiveQuery
};
