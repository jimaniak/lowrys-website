import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateHierarchyFor3Levels() {
  try {
    console.log('=== UPDATING HIERARCHY TO 3 LEVELS (Major → Minor → Detailed) ===');
    
    // First, reset all parent_code values
    await client.execute('UPDATE occupations SET parent_code = NULL');
    console.log('✓ Reset all parent_code values');
    
    // Get all occupations
    const occupations = await client.execute('SELECT code, name, occupation_type FROM occupations ORDER BY code');
    console.log(`Found ${occupations.rows.length} occupations`);
    
    // Process each occupation to determine its parent in 3-level hierarchy
    for (const row of occupations.rows) {
      const code = row.code;
      const name = row.name;
      const type = row.occupation_type;
      
      let parentCode = null;
      
      if (code && code.includes('-')) {
        const parts = code.split('-');
        if (parts.length === 2) {
          const prefix = parts[0];
          const suffix = parts[1];
          
          // 3-Level Hierarchy Logic:
          if (suffix === '0000') {
            // Major Group (11-0000) - ROOT level, no parent
            parentCode = null;
          } else if (suffix.endsWith('000')) {
            // Minor Group (11-1000) - parent is Major Group
            parentCode = `${prefix}-0000`;
          } else {
            // Detailed Occupation (11-1011) - parent is Minor Group
            // Find the appropriate minor group based on the code pattern
            const minorSuffix = suffix.substring(0, 1) + '000';
            parentCode = `${prefix}-${minorSuffix}`;
          }
        }
      }
      
      // Update the parent_code
      if (parentCode !== null) {
        await client.execute(
          'UPDATE occupations SET parent_code = ? WHERE code = ?',
          [parentCode, code]
        );
        console.log(`${code} (${name.substring(0, 50)}) -> parent: ${parentCode}`);
      } else {
        console.log(`${code} (${name.substring(0, 50)}) -> ROOT (Major Group)`);
      }
    }
    
    console.log('\n=== VERIFYING 3-LEVEL HIERARCHY ===');
    
    // Show the hierarchy structure
    const majorGroups = await client.execute(`
      SELECT code, name, COUNT(*) as child_count
      FROM occupations 
      WHERE parent_code IS NULL AND code LIKE '%-0000'
      GROUP BY code, name
      ORDER BY code
      LIMIT 5
    `);
    
    console.log('\nMajor Groups (ROOT level):');
    majorGroups.rows.forEach(row => {
      console.log(`  ${row.code} | ${row.name}`);
    });
    
    const minorGroups = await client.execute(`
      SELECT code, name, parent_code
      FROM occupations 
      WHERE parent_code IS NOT NULL AND code LIKE '%-_000'
      ORDER BY code
      LIMIT 10
    `);
    
    console.log('\nMinor Groups (Level 2):');
    minorGroups.rows.forEach(row => {
      console.log(`  ${row.code} | ${row.name} | Parent: ${row.parent_code}`);
    });
    
    const detailedOccs = await client.execute(`
      SELECT code, name, parent_code
      FROM occupations 
      WHERE occupation_type = 'Line item'
      ORDER BY code
      LIMIT 10
    `);
    
    console.log('\nDetailed Occupations (Level 3):');
    detailedOccs.rows.forEach(row => {
      console.log(`  ${row.code} | ${row.name} | Parent: ${row.parent_code}`);
    });
    
    console.log('\n✅ 3-Level Hierarchy Update Complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

updateHierarchyFor3Levels();
