const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Script to create and maintain 3-level hierarchy: Major → Minor → Detailed
 * Can be run whenever new occupation data is added
 */
async function setupOccupationHierarchy() {
  try {
    console.log('� Setting up 3-level occupation hierarchy...\n');
    
    // Step 1: Add parent_code column if it doesn't exist
    console.log('📊 Step 1: Ensuring parent_code column exists...');
    try {
      await client.execute(`
        ALTER TABLE occupations 
        ADD COLUMN parent_code TEXT
      `);
      console.log('✅ Added parent_code column');
    } catch (error) {
      if (error.message.includes('duplicate column')) {
        console.log('✅ parent_code column already exists');
      } else {
        throw error;
      }
    }
    
    // Step 2: Clear existing parent_code values
    console.log('\n🧹 Step 2: Clearing existing parent relationships...');
    await client.execute('UPDATE occupations SET parent_code = NULL');
    console.log('✅ Cleared all parent_code values');
    
    // Step 3: Get all occupations
    console.log('\n📋 Step 3: Processing occupation codes...');
    const occupations = await client.execute(`
      SELECT code, name, occupation_type 
      FROM occupations 
      WHERE code IS NOT NULL 
      ORDER BY code
    `);
    
    console.log(`Found ${occupations.rows.length} occupations to process`);
    
    // Step 4: Determine parent relationships using simple 3-level logic
    console.log('\n🔗 Step 4: Building parent-child relationships...');
    
    let majorCount = 0;
    let minorCount = 0;  
    let detailedCount = 0;
    let errorCount = 0;
    
    for (const row of occupations.rows) {
      const code = row.code;
      const name = row.name;
      const type = row.occupation_type;
      
      if (!code || !code.includes('-')) {
        console.log(`⚠️  Skipping invalid code: ${code}`);
        errorCount++;
        continue;
      }
      
      let parentCode = null;
      let level = '';
      
      // Simple 3-level hierarchy logic
      if (code.endsWith('-0000')) {
        // Major Group (11-0000) - no parent
        parentCode = null;
        level = 'Major';
        majorCount++;
      } else if (code.match(/-\d000$/)) {
        // Minor Group (11-1000, 11-2000, etc.) - parent is Major Group
        const majorCode = code.substring(0, 2) + '-0000';
        parentCode = majorCode;
        level = 'Minor';
        minorCount++;
      } else {
        // Detailed Occupation (11-1011, 11-2021, etc.) - parent is Minor Group
        // Extract the minor group code (11-1XXX becomes 11-1000)
        const parts = code.split('-');
        if (parts.length === 2 && parts[1].length >= 1) {
          const minorCode = parts[0] + '-' + parts[1].charAt(0) + '000';
          parentCode = minorCode;
          level = 'Detailed';
          detailedCount++;
        } else {
          console.log(`⚠️  Cannot determine parent for: ${code}`);
          errorCount++;
          continue;
        }
      }
      
      // Update the parent_code in database
      if (parentCode !== null) {
        await client.execute({
          sql: 'UPDATE occupations SET parent_code = ? WHERE code = ?',
          args: [parentCode, code]
        });
      }
      
      // Log sample entries
      if ((majorCount + minorCount + detailedCount) <= 20) {
        console.log(`  ${level}: ${code} (${name}) → Parent: ${parentCode || 'ROOT'}`);
      }
    }
    
    // Step 5: Verify the hierarchy
    console.log('\n📈 Step 5: Hierarchy Summary:');
    console.log(`  🏢 Major Groups: ${majorCount} (no parents)`);
    console.log(`  📁 Minor Groups: ${minorCount} (under Major Groups)`);
    console.log(`  👤 Detailed Occupations: ${detailedCount} (under Minor Groups)`);
    console.log(`  ❌ Errors/Skipped: ${errorCount}`);
    
    // Step 6: Validate some relationships
    console.log('\n🔍 Step 6: Validating sample relationships...');
    
    // Check that all parent codes actually exist
    const orphanCheck = await client.execute(`
      SELECT COUNT(*) as orphan_count
      FROM occupations o1
      WHERE o1.parent_code IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM occupations o2 
        WHERE o2.code = o1.parent_code
      )
    `);
    
    const orphanCount = orphanCheck.rows[0].orphan_count;
    if (orphanCount > 0) {
      console.log(`⚠️  Found ${orphanCount} occupations with invalid parent references`);
    } else {
      console.log('✅ All parent references are valid');
    }
    
    // Show sample hierarchy tree
    console.log('\n🌳 Sample Hierarchy Tree:');
    const sampleMajor = await client.execute(`
      SELECT code, name FROM occupations 
      WHERE parent_code IS NULL 
      LIMIT 1
    `);
    
    if (sampleMajor.rows.length > 0) {
      const majorCode = sampleMajor.rows[0].code;
      const majorName = sampleMajor.rows[0].name;
      console.log(`🏢 ${majorCode}: ${majorName}`);
      
      // Get its minor groups
      const minors = await client.execute({
        sql: 'SELECT code, name FROM occupations WHERE parent_code = ? LIMIT 2',
        args: [majorCode]
      });
      
      for (const minor of minors.rows) {
        console.log(`  📁 ${minor.code}: ${minor.name}`);
        
        // Get some detailed occupations
        const detailed = await client.execute({
          sql: 'SELECT code, name FROM occupations WHERE parent_code = ? LIMIT 2',
          args: [minor.code]
        });
        
        for (const detail of detailed.rows) {
          console.log(`    👤 ${detail.code}: ${detail.name}`);
        }
      }
    }
    
    console.log('\n🎉 Hierarchy setup completed successfully!');
    console.log('\n💡 To run this script when new data is added:');
    console.log('   node scripts/setup-occupation-hierarchy.js');
    
  } catch (error) {
    console.error('❌ Error setting up hierarchy:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  setupOccupationHierarchy()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { setupOccupationHierarchy };
    } else {
      console.log('✅ parent_code column already exists\n');
    }

    // Clear existing parent codes to start fresh
    console.log('🧹 Clearing existing parent codes...');
    await db.execute('UPDATE occupations SET parent_code = NULL');
    console.log('✅ Parent codes cleared\n');

    await populateHierarchy();
    
  } catch (error) {
    console.error('❌ Error setting up hierarchy:', error);
  } finally {
    await db.close();
  }
}

async function populateHierarchy() {
  console.log('📝 Populating hierarchy relationships...\n');
  
  // Get all occupations
  const occupations = await db.execute(`
    SELECT code, name, occupation_type 
    FROM occupations 
    WHERE code IS NOT NULL 
    ORDER BY code
  `);

  console.log(`📊 Processing ${occupations.rows.length} occupations...\n`);

  let updates = 0;
  
  for (const occupation of occupations.rows) {
    const code = occupation.code;
    const name = occupation.name;
    const type = occupation.occupation_type;
    
    let parentCode = null;
    
    if (code && typeof code === 'string' && code.includes('-')) {
      const [prefix, suffix] = code.split('-');
      
      // BLS Hierarchy Rules:
      // XX-0000 = Major Group (no parent)
      // XX-Y000 = Minor Group (parent = XX-0000)  
      // XX-YYYY = Detailed Occupation (parent = XX-Y000)
      
      if (suffix === '0000') {
        // Major Group - no parent
        parentCode = null;
        console.log(`🏢 Major Group: ${code} - ${name}`);
        
      } else if (suffix.endsWith('000') && suffix !== '0000') {
        // Minor Group - parent is Major Group (XX-0000)
        parentCode = `${prefix}-0000`;
        console.log(`📁 Minor Group: ${code} - ${name} (parent: ${parentCode})`);
        
      } else if (suffix.length === 4 && !suffix.endsWith('000')) {
        // Detailed Occupation - parent is Minor Group (XX-Y000)
        const minorSuffix = suffix.charAt(0) + '000';
        parentCode = `${prefix}-${minorSuffix}`;
        console.log(`👤 Detailed: ${code} - ${name} (parent: ${parentCode})`);
      }
      
      // Update the database with the parent code
      if (parentCode !== null) {
        // Verify parent exists before setting relationship
        const parentExists = await db.execute({
          sql: 'SELECT code FROM occupations WHERE code = ?',
          args: [parentCode]
        });
        
        if (parentExists.rows.length > 0) {
          await db.execute({
            sql: 'UPDATE occupations SET parent_code = ? WHERE code = ?',
            args: [parentCode, code]
          });
          updates++;
        } else {
          console.log(`⚠️  Parent ${parentCode} not found for ${code}`);
        }
      } else {
        // Root level - explicitly set to NULL
        await db.execute({
          sql: 'UPDATE occupations SET parent_code = NULL WHERE code = ?',
          args: [code]
        });
      }
    }
  }
  
  console.log(`\n✅ Updated ${updates} parent relationships\n`);
  
  // Verify the hierarchy
  await verifyHierarchy();
}

async function verifyHierarchy() {
  console.log('🔍 Verifying hierarchy structure...\n');
  
  // Count by level
  const majorGroups = await db.execute(`
    SELECT COUNT(*) as count 
    FROM occupations 
    WHERE parent_code IS NULL AND code LIKE '%-0000'
  `);
  
  const minorGroups = await db.execute(`
    SELECT COUNT(*) as count 
    FROM occupations 
    WHERE parent_code IS NOT NULL AND code LIKE '%-_000'
  `);
  
  const detailedOccs = await db.execute(`
    SELECT COUNT(*) as count 
    FROM occupations 
    WHERE parent_code IS NOT NULL AND code NOT LIKE '%-_000' AND code NOT LIKE '%-0000'
  `);
  
  console.log('📊 Hierarchy Summary:');
  console.log(`   🏢 Major Groups: ${majorGroups.rows[0].count}`);
  console.log(`   📁 Minor Groups: ${minorGroups.rows[0].count}`);
  console.log(`   👤 Detailed Occupations: ${detailedOccs.rows[0].count}\n`);
  
  // Show sample hierarchy
  console.log('🌳 Sample Hierarchy:');
  const sampleMajor = await db.execute(`
    SELECT code, name FROM occupations 
    WHERE parent_code IS NULL AND code LIKE '11-0000' 
    LIMIT 1
  `);
  
  if (sampleMajor.rows.length > 0) {
    const major = sampleMajor.rows[0];
    console.log(`   🏢 ${major.code}: ${major.name}`);
    
    const minors = await db.execute({
      sql: 'SELECT code, name FROM occupations WHERE parent_code = ? LIMIT 3',
      args: [major.code]
    });
    
    for (const minor of minors.rows) {
      console.log(`      📁 ${minor.code}: ${minor.name}`);
      
      const detailed = await db.execute({
        sql: 'SELECT code, name FROM occupations WHERE parent_code = ? LIMIT 2',
        args: [minor.code]
      });
      
      for (const detail of detailed.rows) {
        console.log(`         👤 ${detail.code}: ${detail.name}`);
      }
    }
  }
  
  console.log('\n✅ Hierarchy setup complete!');
}

// Run the setup
setupHierarchy();
