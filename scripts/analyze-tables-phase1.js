#!/usr/bin/env node

/**
 * Phase 1: Database Table Analysis Script
 * 
 * Analyzes the structure and usage of remaining specialized tables:
 * - occupation_data
 * - projections  
 * - bls_special_tables
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function analyzeTable(tableName) {
  console.log(`\n📊 Analyzing Table: ${tableName}`);
  console.log('='.repeat(50));
  
  try {
    // Get row count
    const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
    const rowCount = countResult.rows[0].count;
    console.log(`📈 Row Count: ${rowCount.toLocaleString()}`);
    
    // Get table schema
    const schemaResult = await client.execute(`PRAGMA table_info(${tableName})`);
    console.log(`\n🏗️ Table Schema (${schemaResult.rows.length} columns):`);
    schemaResult.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Get sample data (first 3 rows)
    const sampleResult = await client.execute(`SELECT * FROM ${tableName} LIMIT 3`);
    console.log(`\n📋 Sample Data (first 3 rows):`);
    if (sampleResult.rows.length > 0) {
      // Print column headers
      const columns = Object.keys(sampleResult.rows[0]);
      console.log('  ' + columns.join(' | '));
      console.log('  ' + columns.map(c => '-'.repeat(c.length)).join(' | '));
      
      // Print sample rows
      sampleResult.rows.forEach((row, index) => {
        const values = columns.map(col => {
          let val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'string' && val.length > 30) return val.substring(0, 27) + '...';
          return String(val);
        });
        console.log(`  ${values.join(' | ')}`);
      });
    } else {
      console.log('  (No data in table)');
    }
    
    // Get unique values for key columns (if small enough)
    if (rowCount < 1000) {
      console.log(`\n🔍 Key Column Analysis:`);
      for (const col of schemaResult.rows) {
        if (col.name.toLowerCase().includes('type') || 
            col.name.toLowerCase().includes('category') ||
            col.name.toLowerCase().includes('status')) {
          try {
            const uniqueResult = await client.execute(`SELECT DISTINCT ${col.name}, COUNT(*) as count FROM ${tableName} GROUP BY ${col.name} ORDER BY count DESC LIMIT 10`);
            if (uniqueResult.rows.length > 0) {
              console.log(`  ${col.name}: ${uniqueResult.rows.map(r => `${r[col.name]}(${r.count})`).join(', ')}`);
            }
          } catch (error) {
            console.log(`  ${col.name}: (analysis failed)`);
          }
        }
      }
    }
    
    return {
      name: tableName,
      rowCount,
      columnCount: schemaResult.rows.length,
      columns: schemaResult.rows.map(r => ({ name: r.name, type: r.type, nullable: !r.notnull, primaryKey: r.pk })),
      sampleData: sampleResult.rows.slice(0, 3)
    };
    
  } catch (error) {
    console.error(`❌ Error analyzing ${tableName}:`, error.message);
    return { name: tableName, error: error.message };
  }
}

async function checkTableUsage() {
  console.log(`\n🔍 Checking Table Usage in API Endpoints`);
  console.log('='.repeat(50));
  
  // Read API files to check which tables are used
  const fs = require('fs');
  const path = require('path');
  
  const apiRoutes = [
    'src/app/api/rate-calculator/route.ts',
    'src/app/api/bls-wage/route.ts', 
    'src/app/api/industry-groups/route.ts',
    'src/app/api/search-occupations/route.ts',
    'src/app/api/seo-intake/route.ts'
  ];
  
  const tableUsage = {
    'occupation_data': [],
    'projections': [],
    'bls_special_tables': []
  };
  
  for (const routePath of apiRoutes) {
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf8');
      
      for (const table of Object.keys(tableUsage)) {
        if (content.includes(table)) {
          tableUsage[table].push(path.basename(path.dirname(routePath)));
        }
      }
    }
  }
  
  console.log('📋 Table Usage in API Routes:');
  for (const [table, routes] of Object.entries(tableUsage)) {
    if (routes.length > 0) {
      console.log(`  ✅ ${table}: Used in ${routes.join(', ')}`);
    } else {
      console.log(`  ❓ ${table}: Not found in API routes`);
    }
  }
  
  return tableUsage;
}

async function main() {
  console.log('🔍 Database Table Analysis - Phase 1');
  console.log('====================================');
  console.log('Analyzing specialized tables for structure and usage\n');

  // Analyze each table
  const tables = ['occupation_data', 'projections', 'bls_special_tables'];
  const analysisResults = [];
  
  for (const table of tables) {
    const result = await analyzeTable(table);
    analysisResults.push(result);
  }
  
  // Check table usage in API endpoints
  const usageResults = await checkTableUsage();
  
  // Generate summary
  console.log(`\n📊 Analysis Summary`);
  console.log('='.repeat(50));
  
  analysisResults.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.name}: Analysis failed (${result.error})`);
    } else {
      console.log(`✅ ${result.name}: ${result.rowCount.toLocaleString()} rows, ${result.columnCount} columns`);
    }
  });
  
  // Save detailed analysis to file
  const detailedReport = {
    timestamp: new Date().toISOString(),
    analysis: analysisResults,
    apiUsage: usageResults,
    summary: {
      totalTables: tables.length,
      successfulAnalysis: analysisResults.filter(r => !r.error).length,
      recommendedActions: [
        'Review tables with zero API usage for potential removal',
        'Identify normalization opportunities in table structures', 
        'Document table purposes and relationships',
        'Consider consolidating similar data structures'
      ]
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync('./scripts/table-analysis-phase1.json', JSON.stringify(detailedReport, null, 2));
  console.log('\n💾 Detailed analysis saved to ./scripts/table-analysis-phase1.json');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Review detailed analysis results');
  console.log('2. Document table purposes and relationships');
  console.log('3. Identify consolidation opportunities');
  console.log('4. Proceed to Phase 2: BLS table normalization');
}

main().catch(console.error);
