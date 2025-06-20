const { Database } = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'lowrys-website.db');
const db = new Database(dbPath);

console.log('🔧 Fixing hierarchy using occupation_type...');

// First, let's see the current structure
console.log('\n📊 Current occupation types:');
const typeStats = db.prepare(`
  SELECT 
    occupation_type,
    COUNT(*) as count
  FROM occupations 
  GROUP BY occupation_type 
  ORDER BY count DESC
`).all();

typeStats.forEach(stat => {
  console.log(`  ${stat.occupation_type || 'NULL'}: ${stat.count}`);
});

// Check what we have for Major Groups (should be Summary type, no parent)
console.log('\n🏢 Major Groups analysis:');
const majorAnalysis = db.prepare(`
  SELECT 
    code,
    name,
    occupation_type,
    parent_code,
    LENGTH(code) as code_length
  FROM occupations 
  WHERE parent_code IS NULL
  ORDER BY code
`).all();

console.log(`Found ${majorAnalysis.length} occupations with no parent:`);
majorAnalysis.slice(0, 10).forEach(occ => {
  console.log(`  ${occ.code} - ${occ.name} (${occ.occupation_type}, len: ${occ.code_length})`);
});

// Check Minor Groups pattern
console.log('\n🏗️ Potential Minor Groups (Summary type, has parent):');
const minorAnalysis = db.prepare(`
  SELECT 
    code,
    name,
    occupation_type,
    parent_code,
    LENGTH(code) as code_length
  FROM occupations 
  WHERE occupation_type = 'Summary' 
    AND parent_code IS NOT NULL
  ORDER BY code
  LIMIT 15
`).all();

console.log(`Found ${minorAnalysis.length} Summary occupations with parents:`);
minorAnalysis.forEach(occ => {
  console.log(`  ${occ.code} - ${occ.name} (parent: ${occ.parent_code})`);
});

// Check Line Items
console.log('\n👷 Line Item occupations:');
const lineItemAnalysis = db.prepare(`
  SELECT 
    code,
    name,
    occupation_type,
    parent_code,
    LENGTH(code) as code_length
  FROM occupations 
  WHERE occupation_type = 'Line Item'
  ORDER BY code
  LIMIT 10
`).all();

console.log(`Found ${lineItemAnalysis.length} Line Item occupations:`);
lineItemAnalysis.forEach(occ => {
  console.log(`  ${occ.code} - ${occ.name} (parent: ${occ.parent_code || 'NULL'})`);
});

// Now let's fix the hierarchy
console.log('\n🔄 Resetting all parent_code relationships...');
db.prepare('UPDATE occupations SET parent_code = NULL').run();

// Step 1: Major Groups should have no parent (they're the top level)
// These should be Summary type with short codes (like 11-0000, 13-0000, etc.)
const majorGroups = db.prepare(`
  SELECT code, name, occupation_type 
  FROM occupations 
  WHERE occupation_type = 'Summary' 
    AND (code LIKE '%-0000' OR LENGTH(code) <= 7)
  ORDER BY code
`).all();

console.log(`\n📋 Identified ${majorGroups.length} Major Groups:`);
majorGroups.forEach(major => {
  console.log(`  ${major.code} - ${major.name}`);
});

// Step 2: Set Minor Groups (Summary type, longer codes, should have Major Group parents)
let minorGroupsSet = 0;
const allSummaryOccs = db.prepare(`
  SELECT code, name, occupation_type 
  FROM occupations 
  WHERE occupation_type = 'Summary'
  ORDER BY code
`).all();

for (const occ of allSummaryOccs) {
  // Skip if it's a Major Group
  if (majorGroups.find(major => major.code === occ.code)) {
    continue;
  }
  
  // Find parent Major Group by matching the first 2 digits
  const codePrefix = occ.code.substring(0, 2);
  const parentMajor = majorGroups.find(major => major.code.startsWith(codePrefix));
  
  if (parentMajor) {
    db.prepare('UPDATE occupations SET parent_code = ? WHERE code = ?')
      .run(parentMajor.code, occ.code);
    minorGroupsSet++;
    console.log(`  ✓ ${occ.code} → ${parentMajor.code}`);
  } else {
    console.log(`  ❌ No parent found for ${occ.code}`);
  }
}

console.log(`\n✅ Set parent for ${minorGroupsSet} Minor Groups`);

// Step 3: Set Line Item parents (should point to appropriate Summary codes)
let lineItemsSet = 0;
const allLineItems = db.prepare(`
  SELECT code, name 
  FROM occupations 
  WHERE occupation_type = 'Line Item'
  ORDER BY code
`).all();

console.log(`\n👷 Processing ${allLineItems.length} Line Items...`);

for (const lineItem of allLineItems) {
  // Find the best matching Summary parent
  // Try to match by progressively shorter prefixes
  let parent = null;
  
  // Try exact match minus last digit (e.g., 11-1011 → 11-1010)
  const codePrefix4 = lineItem.code.substring(0, 6);
  parent = allSummaryOccs.find(s => s.code.startsWith(codePrefix4));
  
  if (!parent) {
    // Try matching first 5 chars (e.g., 11-1011 → 11-10XX)
    const codePrefix3 = lineItem.code.substring(0, 5);
    parent = allSummaryOccs.find(s => s.code.startsWith(codePrefix3));
  }
  
  if (!parent) {
    // Try matching first 4 chars (e.g., 11-1011 → 11-1XXX)  
    const codePrefix2 = lineItem.code.substring(0, 4);
    parent = allSummaryOccs.find(s => s.code.startsWith(codePrefix2));
  }
  
  if (!parent) {
    // Fall back to Major Group (first 2 digits)
    const codePrefix1 = lineItem.code.substring(0, 2);
    parent = majorGroups.find(major => major.code.startsWith(codePrefix1));
  }
  
  if (parent) {
    db.prepare('UPDATE occupations SET parent_code = ? WHERE code = ?')
      .run(parent.code, lineItem.code);
    lineItemsSet++;
    
    if (lineItemsSet <= 10) { // Show first 10 for debugging
      console.log(`  ✓ ${lineItem.code} → ${parent.code}`);
    }
  } else {
    console.log(`  ❌ No parent found for Line Item: ${lineItem.code}`);
  }
}

console.log(`\n✅ Set parent for ${lineItemsSet} Line Items`);

// Final verification
console.log('\n🔍 Final hierarchy verification:');
const finalStats = db.prepare(`
  SELECT 
    occupation_type,
    CASE WHEN parent_code IS NULL THEN 'No Parent' ELSE 'Has Parent' END as parent_status,
    COUNT(*) as count
  FROM occupations 
  GROUP BY occupation_type, parent_status
  ORDER BY occupation_type, parent_status
`).all();

finalStats.forEach(stat => {
  console.log(`  ${stat.occupation_type || 'NULL'} (${stat.parent_status}): ${stat.count}`);
});

// Check for orphans
const orphans = db.prepare(`
  SELECT code, name, occupation_type, parent_code
  FROM occupations 
  WHERE parent_code IS NOT NULL 
    AND parent_code NOT IN (SELECT code FROM occupations)
`).all();

console.log(`\n🚨 Orphaned records: ${orphans.length}`);
if (orphans.length > 0) {
  orphans.slice(0, 5).forEach(orphan => {
    console.log(`  ${orphan.code} → ${orphan.parent_code} (missing)`);
  });
}

db.close();
console.log('\n✨ Hierarchy fix complete!');
