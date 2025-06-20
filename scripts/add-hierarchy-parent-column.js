import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addParentColumn() {
  try {
    console.log('=== ADDING PARENT_CODE COLUMN ===');
    
    // Add parent_code column to occupations table
    await client.execute(`
      ALTER TABLE occupations 
      ADD COLUMN parent_code TEXT
    `);
    
    console.log('✓ Added parent_code column');
    
    console.log('=== POPULATING PARENT_CODE VALUES ===');
    
    // Get all occupations
    const occupations = await client.execute('SELECT code, name, occupation_type FROM occupations ORDER BY code');
    
    console.log(`Found ${occupations.rows.length} occupations`);
    
    // Process each occupation to determine its parent
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
          
          // Determine hierarchy level and parent based on code pattern
          if (suffix === '0000') {
            // Major Group (11-0000) - no parent
            parentCode = null;
          } else if (suffix.endsWith('000')) {
            // Minor Group (11-1000) - parent is Major Group
            parentCode = `${prefix}-0000`;
          } else if (suffix.endsWith('00')) {
            // Broad Group (11-1010) - parent is Minor Group
            const minorSuffix = suffix.substring(0, 1) + '000';
            parentCode = `${prefix}-${minorSuffix}`;
          } else {
            // Detailed Occupation (11-1011) - parent could be Broad or Minor
            if (type === 'Line item') {
              // Check if broad group exists, otherwise use minor group
              const broadSuffix = suffix.substring(0, 2) + '00';
              const minorSuffix = suffix.substring(0, 1) + '000';
              
              // First try broad group parent
              const broadParent = `${prefix}-${broadSuffix}`;
              const broadExists = await client.execute(
                'SELECT code FROM occupations WHERE code = ?',
                [broadParent]
              );
              
              if (broadExists.rows.length > 0) {
                parentCode = broadParent;
              } else {
                // Use minor group as parent
                parentCode = `${prefix}-${minorSuffix}`;
              }
            }
          }
        }
      }
      
      // Update the parent_code
      if (parentCode !== null) {
        await client.execute(
          'UPDATE occupations SET parent_code = ? WHERE code = ?',
          [parentCode, code]
        );
        console.log(`${code} (${name}) -> parent: ${parentCode}`);
      } else {
        console.log(`${code} (${name}) -> ROOT (no parent)`);
      }
    }
    
    console.log('=== VERIFYING HIERARCHY ===');
    
    // Show the hierarchy structure
    const hierarchy = await client.execute(`
      SELECT 
        code,
        name,
        parent_code,
        occupation_type,
        CASE 
          WHEN parent_code IS NULL THEN 'ROOT (Major Group)'
          WHEN code LIKE '%-_000' THEN 'Minor Group'
          WHEN code LIKE '%-__00' THEN 'Broad Group'
          ELSE 'Detailed Occupation'
        END as hierarchy_level
      FROM occupations 
      ORDER BY code
      LIMIT 20
    `);
    
    console.log('\nHierarchy Sample:');
    hierarchy.rows.forEach(row => {
      console.log(`${row.code} | ${row.name} | Parent: ${row.parent_code || 'NULL'} | Level: ${row.hierarchy_level}`);
    });
    
    console.log('\n✓ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

addParentColumn();
