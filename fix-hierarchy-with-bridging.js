const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'public', 'data', 'occupations.db');
const db = new Database(dbPath);

console.log('🔍 Analyzing current hierarchy structure...');

// Get all occupations with their current data
const allOccupations = db.prepare(`
  SELECT code, name, occupation_type, parent_code
  FROM occupations 
  ORDER BY code
`).all();

console.log(`Total occupations: ${allOccupations.length}`);

// Analyze by type
const byType = {};
allOccupations.forEach(occ => {
  const type = occ.occupation_type || 'NULL';
  if (!byType[type]) byType[type] = [];
  byType[type].push(occ);
});

console.log('\nBy occupation type:');
Object.keys(byType).forEach(type => {
  console.log(`  ${type}: ${byType[type].length}`);
});

// Identify the hierarchy levels we want:
console.log('\n🎯 Identifying target hierarchy levels...');

// Major Groups: Summary with pattern XX-0000
const majorGroups = allOccupations.filter(occ => 
  occ.occupation_type === 'Summary' && 
  occ.code.match(/^\d{2}-0000$/)
);
console.log(`Major Groups (XX-0000): ${majorGroups.length}`);
majorGroups.forEach(mg => console.log(`  ${mg.code}: ${mg.name}`));

// Minor Groups: Summary that should be direct children of Major Groups
// Look for Summary codes that have meaningful groupings under Major Groups
const minorGroups = allOccupations.filter(occ => 
  occ.occupation_type === 'Summary' && 
  !occ.code.match(/^\d{2}-0000$/) && // Not a Major Group
  occ.code.match(/^\d{2}-\d{4}$/) // Has the right pattern
);

console.log(`\nPotential Minor Groups: ${minorGroups.length}`);

// For each Major Group, find which Minor Groups should belong to it
console.log('\n🔗 Building proper parent-child relationships...');

// Clear all parent codes first
console.log('Clearing existing parent codes...');
db.prepare('UPDATE occupations SET parent_code = NULL').run();

// Set up Major Groups (no parents)
console.log('Setting up Major Groups (no parents)...');
majorGroups.forEach(mg => {
  db.prepare('UPDATE occupations SET parent_code = NULL WHERE code = ?').run(mg.code);
});

// For each Major Group, assign appropriate Minor Groups as children
majorGroups.forEach(majorGroup => {
  const majorCode = majorGroup.code.substring(0, 2); // e.g., "15" from "15-0000"
  
  // Find Minor Groups that should belong to this Major Group
  const belongingMinorGroups = minorGroups.filter(minor => 
    minor.code.startsWith(majorCode + '-') &&
    minor.code !== majorGroup.code
  );
  
  console.log(`\n${majorGroup.code} (${majorGroup.name}):`);
  console.log(`  Found ${belongingMinorGroups.length} potential minor groups`);
  
  // We need to be smart about which Summary levels to use as Minor Groups
  // Let's look for Summary codes that have Line items under them
  const validMinorGroups = [];
  
  belongingMinorGroups.forEach(minor => {
    // Check if this minor group has Line items that would be its children
    const lineItemsForThisMinor = allOccupations.filter(occ =>
      occ.occupation_type === 'Line item' &&
      occ.code.startsWith(minor.code.substring(0, 5)) // e.g., "15-12" from "15-1200"
    );
    
    if (lineItemsForThisMinor.length > 0) {
      validMinorGroups.push({
        ...minor,
        childCount: lineItemsForThisMinor.length
      });
    }
  });
  
  console.log(`  Valid minor groups with Line items: ${validMinorGroups.length}`);
  validMinorGroups.forEach(mg => {
    console.log(`    ${mg.code}: ${mg.name} (${mg.childCount} line items)`);
  });
  
  // Set these as children of the Major Group
  validMinorGroups.forEach(minor => {
    db.prepare('UPDATE occupations SET parent_code = ? WHERE code = ?')
      .run(majorGroup.code, minor.code);
  });
});

// Now assign Line items to their appropriate Minor Groups
console.log('\n👥 Assigning Line items to Minor Groups...');

const updatedMinorGroups = db.prepare(`
  SELECT code, name FROM occupations 
  WHERE occupation_type = 'Summary' AND parent_code IS NOT NULL
`).all();

updatedMinorGroups.forEach(minor => {
  const minorPrefix = minor.code.substring(0, 5); // e.g., "15-12" from "15-1200"
  
  // Find Line items that should belong to this Minor Group
  const lineItems = allOccupations.filter(occ =>
    occ.occupation_type === 'Line item' &&
    occ.code.startsWith(minorPrefix)
  );
  
  console.log(`${minor.code}: Assigning ${lineItems.length} line items`);
  
  // Assign these Line items to the Minor Group
  lineItems.forEach(lineItem => {
    db.prepare('UPDATE occupations SET parent_code = ? WHERE code = ?')
      .run(minor.code, lineItem.code);
  });
});

// Final verification
console.log('\n📊 Final hierarchy statistics:');

const finalStats = db.prepare(`
  SELECT 
    CASE 
      WHEN parent_code IS NULL THEN 'Major Groups (no parent)'
      WHEN occupation_type = 'Summary' THEN 'Minor Groups'
      WHEN occupation_type = 'Line item' THEN 'Detailed Occupations'
      ELSE 'Other'
    END as level_type,
    COUNT(*) as count
  FROM occupations
  GROUP BY level_type
`).all();

finalStats.forEach(stat => {
  console.log(`  ${stat.level_type}: ${stat.count}`);
});

// Check for any orphaned records
const orphaned = db.prepare(`
  SELECT code, name, occupation_type, parent_code
  FROM occupations 
  WHERE parent_code IS NOT NULL 
    AND parent_code NOT IN (SELECT code FROM occupations)
`).all();

if (orphaned.length > 0) {
  console.log(`\n⚠️  Found ${orphaned.length} orphaned records:`);
  orphaned.forEach(occ => {
    console.log(`  ${occ.code}: ${occ.name} (parent: ${occ.parent_code})`);
  });
} else {
  console.log('\n✅ No orphaned records found!');
}

db.close();
console.log('\n🎉 Hierarchy bridging complete!');
