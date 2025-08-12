// Complete Database Normalization Script
// This script completes the normalization process by:
// 1. Adding missing projected wage columns
// 2. Migrating data from year-specific to normalized columns
// 3. Adding category classification (MAJOR, MINOR, BROAD, DETAILED)
// 4. Verifying data consistency
// 5. Dropping old year-specific columns

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Category classification functions using your correct requirements
function isMajor(code, occupation_type) {
  return occupation_type === 'Summary' && 
         code.length === 7 &&
         code.slice(-4) === '0000' &&        // Last 4 chars = '0000'
         code.slice(0, 2) !== '00';           // First 2 chars ≠ '00'
}

function isMinor(code, occupation_type) {
  return occupation_type === 'Summary' && 
         code.length === 7 &&
         code.slice(-4, -3) !== '0' &&       // 4th from right ≠ '0'
         code.slice(-3) === '000';            // Last 3 chars = '000'
}

function isBroad(code, occupation_type) {
  return occupation_type === 'Summary' && 
         code.length === 7 &&
         code.slice(-2, -1) === '0' &&       // 2nd from right = '0'
         code.slice(-3, -2) !== '0';          // 3rd from right ≠ '0'
}

function isDetailed(code, occupation_type) {
  return occupation_type === 'Summary' && 
         code.length === 7 &&
         code.slice(-2, -1) !== '0';          // 2nd from right ≠ '0'
}

function isTop(code) {
  return code === '00-0000';
}

function getCategory(code, occupation_type) {
  if (isTop(code)) return 'TOP';
  if (isMajor(code, occupation_type)) return 'MAJOR';
  if (isMinor(code, occupation_type)) return 'MINOR';
  if (isBroad(code, occupation_type)) return 'BROAD';
  if (isDetailed(code, occupation_type)) return 'DETAILED';
  return 'LINE_ITEM'; // For actual occupations (not Summary categories)
}

async function main() {
  try {
    console.log('🚀 Starting Complete Database Normalization...\n');

    // Step 1: Add missing projected wage columns
    console.log('📋 Step 1: Adding missing projected wage columns...');
    try {
      await db.execute(`ALTER TABLE occupations ADD COLUMN projected_median_annual_wage INTEGER`);
      console.log('✅ Added projected_median_annual_wage column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('⚠️  projected_median_annual_wage column already exists');
      } else {
        throw e;
      }
    }

    try {
      await db.execute(`ALTER TABLE occupations ADD COLUMN projected_median_annual_wage_year INTEGER`);
      console.log('✅ Added projected_median_annual_wage_year column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('⚠️  projected_median_annual_wage_year column already exists');
      } else {
        throw e;
      }
    }

    // Step 2: Add category column if it doesn't exist
    console.log('\n📋 Step 2: Adding category column...');
    try {
      await db.execute(`ALTER TABLE occupations ADD COLUMN category TEXT`);
      console.log('✅ Added category column');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('⚠️  category column already exists');
      } else {
        throw e;
      }
    }

    // Step 3: Migrate projected wage data
    console.log('\n📋 Step 3: Migrating projected wage data...');
    
    // Check if median_annual_wage_2034 column exists
    const schema = await db.execute(`PRAGMA table_info(occupations)`);
    const columns = schema.rows.map(row => row.name);
    
    if (columns.includes('median_annual_wage_2034')) {
      const updateResult = await db.execute(`
        UPDATE occupations 
        SET projected_median_annual_wage = median_annual_wage_2034,
            projected_median_annual_wage_year = 2034
        WHERE median_annual_wage_2034 IS NOT NULL
      `);
      console.log(`✅ Migrated ${updateResult.changes} records with projected wage data`);
    } else {
      console.log('⚠️  median_annual_wage_2034 column not found - skipping migration');
    }

    // Step 4: Classify all occupations by category
    console.log('\n📋 Step 4: Classifying occupations by category...');
    
    const occupations = await db.execute(`
      SELECT code, occupation_type 
      FROM occupations 
      WHERE category IS NULL OR category = ''
    `);
    
    console.log(`Found ${occupations.rows.length} occupations to classify`);
    
    let classified = 0;
    for (const row of occupations.rows) {
      const category = getCategory(row.code, row.occupation_type);
      
      await db.execute({
        sql: `UPDATE occupations SET category = ? WHERE code = ?`,
        args: [category, row.code]
      });
      
      classified++;
      if (classified % 100 === 0) {
        console.log(`  Classified ${classified}/${occupations.rows.length} occupations...`);
      }
    }
    
    console.log(`✅ Classified ${classified} occupations by category`);

    // Step 5: Verify data consistency
    console.log('\n📋 Step 5: Verifying data consistency...');
    
    // Check employment data consistency
    if (columns.includes('employment_2023')) {
      const employmentCheck = await db.execute(`
        SELECT COUNT(*) as mismatches
        FROM occupations 
        WHERE employment_2023 != base_year_employment 
        AND employment_2023 IS NOT NULL 
        AND base_year_employment IS NOT NULL
      `);
      console.log(`Employment 2023 mismatches: ${employmentCheck.rows[0].mismatches}`);
    }

    if (columns.includes('employment_2033')) {
      const projectionCheck = await db.execute(`
        SELECT COUNT(*) as mismatches
        FROM occupations 
        WHERE employment_2033 != projection_year_employment 
        AND employment_2033 IS NOT NULL 
        AND projection_year_employment IS NOT NULL
      `);
      console.log(`Employment 2033 mismatches: ${projectionCheck.rows[0].mismatches}`);
    }

    if (columns.includes('median_annual_wage_2023')) {
      const wageCheck = await db.execute(`
        SELECT COUNT(*) as mismatches
        FROM occupations 
        WHERE median_annual_wage_2023 != median_annual_wage 
        AND median_annual_wage_2023 IS NOT NULL 
        AND median_annual_wage IS NOT NULL
      `);
      console.log(`Wage 2023 mismatches: ${wageCheck.rows[0].mismatches}`);
    }

    // Step 6: Show category distribution
    console.log('\n📋 Step 6: Category distribution summary...');
    const categoryStats = await db.execute(`
      SELECT category, COUNT(*) as count 
      FROM occupations 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    categoryStats.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} occupations`);
    });

    // Step 7: Show sample of each category
    console.log('\n📋 Step 7: Sample occupations by category...');
    const categories = ['TOP', 'MAJOR', 'MINOR', 'BROAD', 'DETAILED'];
    
    for (const category of categories) {
      const sample = await db.execute({
        sql: `SELECT code, name FROM occupations WHERE category = ? LIMIT 3`,
        args: [category]
      });
      
      console.log(`\n${category} examples:`);
      sample.rows.forEach(row => {
        console.log(`  ${row.code}: ${row.name}`);
      });
    }

    // Step 8: Ask user before dropping columns
    console.log('\n📋 Step 8: Ready to drop year-specific columns...');
    console.log('Year-specific columns that can be dropped:');
    
    const yearColumns = columns.filter(col => 
      col.includes('_2023') || 
      col.includes('_2033') || 
      col.includes('_2034') ||
      (col.includes('2023') || col.includes('2033') || col.includes('2034'))
    );
    
    yearColumns.forEach(col => console.log(`  - ${col}`));
    
    console.log('\n⚠️  Manual step required:');
    console.log('Please review the data consistency results above.');
    console.log('If everything looks good, run the drop-year-columns script:');
    console.log('node scripts/drop-year-columns.js');

    console.log('\n🎉 Database normalization completed successfully!');
    
  } catch (error) {
    console.error('❌ Normalization failed:', error);
  } finally {
    await db.close();
  }
}

main();
