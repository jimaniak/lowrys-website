// Populate category column for existing occupations data
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Category classification functions using CORRECT requirements
function isOccupation(code, occupation_type) {
  // OCCUPATION: Must be occupation_type = 'Line item'
  return occupation_type === 'Line item';
}

function isMajor(code, occupation_type) {
  if (occupation_type !== 'Summary') return false;
  // MAJOR: ends with '0000' and is not '00-0000'
  return code.endsWith('0000') && code !== '00-0000';
}

function isMinor(code, occupation_type) {
  if (occupation_type !== 'Summary') return false;
  // MINOR: last 3 chars = '000', 4th from end != '0'
  const lastThree = code.slice(-3);
  const fourthFromRight = code[code.length - 4];
  return lastThree === '000' && fourthFromRight !== '0';
}

function isBroad(code, occupation_type) {
  if (occupation_type !== 'Summary' || code.length !== 7) return false;
  // BROAD: 3rd from right != '0' AND 2nd from right = '0'
  const thirdFromRight = code[code.length - 3];   // 3rd from right
  const secondFromRight = code[code.length - 2];  // 2nd from right
  return thirdFromRight !== '0' && secondFromRight === '0';
}

function isDetailed(code, occupation_type) {
  if (occupation_type !== 'Summary' || code.length !== 7) return false;
  // DETAILED: Summary occupations with 2nd digit from right != '0'
  const secondFromRight = code[code.length - 2];
  return secondFromRight !== '0';
}

function getCategory(code, occupation_type) {
  if (isOccupation(code, occupation_type)) return 'OCCUPATION';
  if (isMajor(code, occupation_type)) return 'MAJOR';
  if (isMinor(code, occupation_type)) return 'MINOR';
  if (isBroad(code, occupation_type)) return 'BROAD';
  if (isDetailed(code, occupation_type)) return 'DETAILED';
  return 'OTHER';
}

async function populateCategories() {
  try {
    console.log('🔄 Populating category column for existing occupations...\n');
    
    // Get all occupations with their current data
    const occupations = await db.execute(`
      SELECT code, name, occupation_type 
      FROM occupations 
      WHERE category IS NULL OR category = ''
      ORDER BY code
    `);
    
    console.log(`📊 Found ${occupations.rows.length} occupations to categorize`);
    
    if (occupations.rows.length === 0) {
      console.log('✅ All occupations already have categories!');
      return;
    }
    
    // Process each occupation and update category
    let updateCount = 0;
    const categories = {};
    
    for (const row of occupations.rows) {
      const { code, name, occupation_type } = row;
      const category = getCategory(code, occupation_type);
      
      // Count categories for summary
      categories[category] = (categories[category] || 0) + 1;
      
      // Update the occupation with its category
      await db.execute({
        sql: 'UPDATE occupations SET category = ? WHERE code = ?',
        args: [category, code]
      });
      
      updateCount++;
      
      // Show progress every 100 records
      if (updateCount % 100 === 0) {
        console.log(`📊 Processed ${updateCount}/${occupations.rows.length} occupations...`);
      }
    }
    
    console.log(`\n✅ Successfully categorized ${updateCount} occupations!`);
    
    console.log('\n📊 Category distribution:');
    Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} occupations`);
      });
    
    // Verify the update
    const verifyResult = await db.execute(`
      SELECT 
        category,
        COUNT(*) as count
      FROM occupations 
      WHERE category IS NOT NULL
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log('\n🔍 Final verification:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} total`);
    });
    
    const totalCategorized = await db.execute('SELECT COUNT(*) as count FROM occupations WHERE category IS NOT NULL');
    const totalOccupations = await db.execute('SELECT COUNT(*) as count FROM occupations');
    
    console.log(`\n📈 Summary: ${totalCategorized.rows[0].count}/${totalOccupations.rows[0].count} occupations categorized`);
    
  } catch (error) {
    console.error('❌ Error populating categories:', error);
  } finally {
    await db.close();
  }
}

populateCategories();
