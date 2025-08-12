// Simple Database Cleanup Script
// Only adds the 2-3 missing columns and migrates data
// Then removes year-specific columns after validation

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
    console.log('🧹 Starting Simple Database Cleanup...\n');

    // Step 1: Add only the missing columns
    console.log('📋 Step 1: Adding missing columns...');
    
    // Add category column
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

    // Add projected wage columns
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

    // Step 2: Migrate projected wage data
    console.log('\n📋 Step 2: Migrating projected wage data...');
    
    // Check if median_annual_wage_2034 column exists
    const schema = await db.execute(`PRAGMA table_info(occupations)`);
    const columns = schema.rows.map(row => row.name);
    
    if (columns.includes('median_annual_wage_2034')) {
      const updateResult = await db.execute(`
        UPDATE occupations 
        SET projected_median_annual_wage = median_annual_wage_2034,
            projected_median_annual_wage_year = 2034
        WHERE median_annual_wage_2034 IS NOT NULL
        AND (projected_median_annual_wage IS NULL OR projected_median_annual_wage_year IS NULL)
      `);
      console.log(`✅ Migrated ${updateResult.changes} records with projected wage data`);
    } else {
      console.log('⚠️  median_annual_wage_2034 column not found - skipping migration');
    }

    // Step 3: Classify all occupations by category
    console.log('\n📋 Step 3: Classifying occupations by category...');
    
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

    // Step 4: Validate the normalized vs year-specific data
    console.log('\n📋 Step 4: Validating data consistency...');
    
    const validationResults = {};
    
    // Check employment data consistency
    if (columns.includes('employment_2023')) {
      const employmentCheck = await db.execute(`
        SELECT COUNT(*) as mismatches
        FROM occupations 
        WHERE employment_2023 != base_year_employment 
        AND employment_2023 IS NOT NULL 
        AND base_year_employment IS NOT NULL
      `);
      validationResults.employment_2023 = employmentCheck.rows[0].mismatches;
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
      validationResults.employment_2033 = projectionCheck.rows[0].mismatches;
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
      validationResults.median_annual_wage_2023 = wageCheck.rows[0].mismatches;
      console.log(`Wage 2023 mismatches: ${wageCheck.rows[0].mismatches}`);
    }

    // Step 5: Show category distribution
    console.log('\n📋 Step 5: Category distribution...');
    const categoryStats = await db.execute(`
      SELECT category, COUNT(*) as count 
      FROM occupations 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    categoryStats.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} occupations`);
    });

    // Step 6: List year-specific columns to remove
    console.log('\n📋 Step 6: Year-specific columns ready for removal...');
    
    const yearColumns = columns.filter(col => 
      col.includes('_2023') || 
      col.includes('_2033') || 
      col.includes('_2034') ||
      (col.includes('2023') || col.includes('2033') || col.includes('2034'))
    );
    
    console.log('Columns with years that can be removed:');
    yearColumns.forEach(col => console.log(`  - ${col}`));
    
    // Check if all validations passed
    const totalMismatches = Object.values(validationResults).reduce((sum, val) => sum + val, 0);
    
    if (totalMismatches === 0) {
      console.log('\n✅ All data validations passed!');
      console.log('✅ Ready to remove year-specific columns');
      console.log('\n🚀 Run this command to remove year columns:');
      console.log('node scripts/remove-year-columns.js');
    } else {
      console.log('\n⚠️  Data mismatches found - please investigate before removing columns');
    }

    console.log('\n🎉 Database cleanup preparation completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await db.close();
  }
}

main();
