// Populate category column using our tested classification logic
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Our tested classification functions
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

async function populateCategoryColumn() {
  try {
    console.log('🔧 Populating category column...\n');
    
    // Get all occupations
    const result = await db.execute('SELECT code, occupation_type FROM occupations');
    console.log(`📋 Found ${result.rows.length} occupations to classify`);
    
    let updateCount = 0;
    const categoryCounts = {};
    
    // Process each occupation
    for (const row of result.rows) {
      const code = row.code;
      const occupation_type = row.occupation_type;
      
      if (!code || !occupation_type) {
        console.log(`⚠️ Skipping occupation with missing data: ${code}, ${occupation_type}`);
        continue;
      }
      
      const category = getCategory(code, occupation_type);
      
      // Count categories
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      
      // Update the database
      await db.execute({
        sql: 'UPDATE occupations SET category = ? WHERE code = ?',
        args: [category, code]
      });
      
      updateCount++;
      
      if (updateCount % 100 === 0) {
        console.log(`  Updated ${updateCount} occupations...`);
      }
    }
    
    console.log(`\n✅ Updated ${updateCount} occupations with categories`);
    
    console.log('\n📊 Category distribution:');
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    
    // Verify the update worked
    console.log('\n🔍 Verifying updates...');
    const verifyResult = await db.execute('SELECT category, COUNT(*) as count FROM occupations GROUP BY category ORDER BY count DESC');
    
    console.log('📊 Database verification:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.category || 'NULL'}: ${row.count}`);
    });
    
    const nullCount = verifyResult.rows.find(row => row.category === null)?.count || 0;
    if (nullCount === 0) {
      console.log('\n🎉 All occupations successfully categorized!');
    } else {
      console.log(`\n⚠️ ${nullCount} occupations still have NULL category`);
    }
    
  } catch (error) {
    console.error('❌ Error populating categories:', error);
  } finally {
    await db.close();
  }
}

populateCategoryColumn();
