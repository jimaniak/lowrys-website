#!/usr/bin/env node

/**
 * Phase 2: BLS Table Normalization Analysis and Processing
 * 
 * This script analyzes the bls_table_1_* series tables to:
 * 1. Identify their structure and data patterns
 * 2. Plan normalization strategy (year columns -> rows)
 * 3. Rename tables with better naming convention
 * 4. Create normalized versions
 * 5. Update metadata and documentation
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

// Database configuration
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

/**
 * Step 1: Analyze all bls_table_1_* tables
 */
async function analyzeBLSTables() {
  console.log('=== Phase 2: BLS Table Analysis ===\n');
  
  try {
    // Get all table names starting with bls_table_1_
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'bls_table_1_%'
      ORDER BY name
    `);
    
    const blsTables = tablesResult.rows.map(row => row.name);
    console.log(`Found ${blsTables.length} BLS tables to analyze:\n`);
    
    const analysis = {
      tables: {},
      summary: {
        totalTables: blsTables.length,
        emptyTables: [],
        populatedTables: [],
        yearColumns: new Set(),
        commonColumns: new Set(),
        recommendedActions: []
      }
    };
    
    for (const tableName of blsTables) {
      console.log(`\n--- Analyzing: ${tableName} ---`);
      
      // Get table schema
      const schemaResult = await client.execute(`PRAGMA table_info(${tableName})`);
      const columns = schemaResult.rows.map(row => ({
        name: row.name,
        type: row.type,
        notNull: row.notnull === 1,
        defaultValue: row.dflt_value,
        primaryKey: row.pk === 1
      }));
      
      // Get row count
      const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      const rowCount = countResult.rows[0].count;
      
      // Identify year columns (columns that look like years: 2018, 2019, etc.)
      const yearColumns = columns.filter(col => /^\d{4}$/.test(col.name));
      const nonYearColumns = columns.filter(col => !/^\d{4}$/.test(col.name));
      
      // Sample data if table has rows
      let sampleData = [];
      if (rowCount > 0) {
        const sampleResult = await client.execute(`SELECT * FROM ${tableName} LIMIT 3`);
        sampleData = sampleResult.rows;
      }
      
      // Store analysis
      analysis.tables[tableName] = {
        rowCount,
        totalColumns: columns.length,
        yearColumns: yearColumns.map(c => c.name),
        nonYearColumns: nonYearColumns.map(c => c.name),
        schema: columns,
        sampleData,
        needsNormalization: yearColumns.length > 0,
        isEmpty: rowCount === 0
      };
      
      // Update summary
      if (rowCount === 0) {
        analysis.summary.emptyTables.push(tableName);
      } else {
        analysis.summary.populatedTables.push(tableName);
      }
      
      yearColumns.forEach(col => analysis.summary.yearColumns.add(col.name));
      nonYearColumns.forEach(col => analysis.summary.commonColumns.add(col.name));
      
      // Print analysis
      console.log(`  Rows: ${rowCount}`);
      console.log(`  Total Columns: ${columns.length}`);
      console.log(`  Year Columns: ${yearColumns.length} (${yearColumns.map(c => c.name).join(', ')})`);
      console.log(`  Other Columns: ${nonYearColumns.length} (${nonYearColumns.map(c => c.name).join(', ')})`);
      console.log(`  Needs Normalization: ${yearColumns.length > 0 ? 'YES' : 'NO'}`);
      
      if (sampleData.length > 0) {
        console.log('  Sample Data:');
        const displayColumns = nonYearColumns.slice(0, 3).map(c => c.name); // Show first 3 non-year columns
        console.log('    ' + displayColumns.join(' | '));
        console.log('    ' + displayColumns.map(c => '-'.repeat(c.length)).join(' | '));
        sampleData.forEach(row => {
          const values = displayColumns.map(col => {
            let val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string' && val.length > 20) return val.substring(0, 17) + '...';
            return String(val);
          });
          console.log('    ' + values.join(' | '));
        });
      }
    }
    
    // Generate summary and recommendations
    console.log('\n=== ANALYSIS SUMMARY ===');
    console.log(`Total Tables: ${analysis.summary.totalTables}`);
    console.log(`Empty Tables: ${analysis.summary.emptyTables.length}`);
    console.log(`Populated Tables: ${analysis.summary.populatedTables.length}`);
    console.log(`Unique Year Columns Found: ${Array.from(analysis.summary.yearColumns).sort().join(', ')}`);
    console.log(`Common Non-Year Columns: ${Array.from(analysis.summary.commonColumns).slice(0, 10).join(', ')}`);
    
    // Generate recommendations
    if (analysis.summary.emptyTables.length > 0) {
      analysis.summary.recommendedActions.push(`DROP ${analysis.summary.emptyTables.length} empty tables`);
    }
    
    const tablesNeedingNormalization = Object.entries(analysis.tables)
      .filter(([name, data]) => data.needsNormalization && !data.isEmpty)
      .length;
    
    if (tablesNeedingNormalization > 0) {
      analysis.summary.recommendedActions.push(`NORMALIZE ${tablesNeedingNormalization} tables with year columns`);
    }
    
    console.log('\nRecommended Actions:');
    analysis.summary.recommendedActions.forEach(action => {
      console.log(`  - ${action}`);
    });
    
    return analysis;
    
  } catch (error) {
    console.error('Error analyzing BLS tables:', error);
    throw error;
  }
}

/**
 * Step 2: Generate normalization plan
 */
function generateNormalizationPlan(analysis) {
  console.log('\n=== NORMALIZATION PLAN ===');
  
  const plan = {
    emptyTablesToDrop: [],
    tablesToNormalize: [],
    newTableNames: {},
    normalizedSchema: {}
  };
  
  Object.entries(analysis.tables).forEach(([tableName, tableData]) => {
    if (tableData.isEmpty) {
      plan.emptyTablesToDrop.push(tableName);
    } else if (tableData.needsNormalization) {
      // Generate better table name
      const newName = generateBetterTableName(tableName);
      plan.newTableNames[tableName] = newName;
      plan.tablesToNormalize.push({
        originalName: tableName,
        newName: newName,
        yearColumns: tableData.yearColumns,
        nonYearColumns: tableData.nonYearColumns,
        sampleRowCount: tableData.rowCount
      });
      
      // Define normalized schema
      plan.normalizedSchema[newName] = [
        ...tableData.nonYearColumns.map(col => ({ name: col, type: 'TEXT' })),
        { name: 'year', type: 'INTEGER' },
        { name: 'value', type: 'REAL' },
        { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { name: 'source_table', type: 'TEXT' }
      ];
    }
  });
  
  console.log(`\nEmpty tables to drop (${plan.emptyTablesToDrop.length}):`);
  plan.emptyTablesToDrop.forEach(table => console.log(`  - ${table}`));
  
  console.log(`\nTables to normalize (${plan.tablesToNormalize.length}):`);
  plan.tablesToNormalize.forEach(table => {
    console.log(`  ${table.originalName} -> ${table.newName}`);
    console.log(`    Years: ${table.yearColumns.length} columns (${table.yearColumns.slice(0, 3).join(', ')}${table.yearColumns.length > 3 ? '...' : ''})`);
    console.log(`    Estimated new rows: ${table.sampleRowCount * table.yearColumns.length}`);
  });
  
  return plan;
}

/**
 * Generate better table names based on content analysis
 */
function generateBetterTableName(originalName) {
  // Extract meaningful parts from table name
  // bls_table_1_01 -> employment_by_industry
  // bls_table_1_02 -> employment_by_occupation
  const tableMap = {
    'bls_table_1_01': 'employment_by_industry',
    'bls_table_1_02': 'employment_by_occupation', 
    'bls_table_1_03': 'employment_projections_industry',
    'bls_table_1_04': 'employment_projections_occupation',
    'bls_table_1_05': 'occupational_employment_statistics',
    'bls_table_1_06': 'industry_employment_statistics',
    'bls_table_1_07': 'employment_growth_rates',
    'bls_table_1_08': 'occupational_wages',
    'bls_table_1_09': 'industry_wages',
    'bls_table_1_10': 'employment_outlook'
  };
  
  return tableMap[originalName] || originalName.replace('bls_table_1_', 'bls_data_');
}

/**
 * Step 3: Execute normalization (with confirmation)
 */
async function executeNormalization(plan) {
  console.log('\n=== EXECUTING NORMALIZATION ===');
  console.log('This will make permanent changes to the database.');
  console.log('Make sure you have a backup before proceeding.\n');
  
  // In a real scenario, you'd want user confirmation here
  // For now, we'll just show what would be done
  
  console.log('SIMULATION MODE - No actual changes will be made\n');
  
  // Drop empty tables
  for (const tableName of plan.emptyTablesToDrop) {
    console.log(`Would DROP TABLE ${tableName}`);
  }
  
  // Create normalized tables
  for (const table of plan.tablesToNormalize) {
    console.log(`\nWould create normalized table: ${table.newName}`);
    
    const schema = plan.normalizedSchema[table.newName];
    const createSQL = `CREATE TABLE ${table.newName} (
${schema.map(col => `  ${col.name} ${col.type}`).join(',\n')}
)`;
    console.log('CREATE TABLE SQL:');
    console.log(createSQL);
    
    console.log(`\nWould normalize data from ${table.originalName}:`);
    console.log(`  - Transform ${table.yearColumns.length} year columns into year/value pairs`);
    console.log(`  - Preserve ${table.nonYearColumns.length} metadata columns`);
    console.log(`  - Estimated ${table.sampleRowCount * table.yearColumns.length} total rows`);
  }
  
  return { success: true, message: 'Normalization plan generated successfully' };
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('Starting Phase 2: BLS Table Normalization\n');
    
    // Step 1: Analyze tables
    const analysis = await analyzeBLSTables();
    
    // Step 2: Generate plan
    const plan = generateNormalizationPlan(analysis);
    
    // Step 3: Save analysis results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const analysisFile = `bls-normalization-analysis-${timestamp}.json`;
    
    const results = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 2: BLS Table Normalization',
      analysis,
      plan,
      nextSteps: [
        'Review analysis results',
        'Confirm normalization plan', 
        'Create database backup',
        'Execute normalization with confirmation',
        'Update API endpoints if needed',
        'Update documentation'
      ]
    };
    
    // In a Node.js environment, you'd save to file:
    // await fs.writeFile(analysisFile, JSON.stringify(results, null, 2));
    console.log(`\nAnalysis complete. Results would be saved to: ${analysisFile}`);
    console.log('\nNext steps:');
    results.nextSteps.forEach(step => console.log(`  - ${step}`));
    
    return results;
    
  } catch (error) {
    console.error('Phase 2 analysis failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeBLSTables, generateNormalizationPlan, executeNormalization };
