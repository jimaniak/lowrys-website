// Alternative: UPSERT-based Incremental Updates
// This approach updates only changed records rather than full refresh
// More complex but potentially faster for large datasets

async function upsertOccupationData(occupations) {
  console.log('🔄 UPSERT: Updating only changed occupation records...');
  
  const upsertStmt = await db.prepare(`
    INSERT INTO occupations (
      code, name, occupation_type, parent_code, category,
      base_year_employment, median_annual_wage, base_year,
      regional_employment_data, regional_wage_data,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(code) DO UPDATE SET
      name = excluded.name,
      occupation_type = excluded.occupation_type,
      parent_code = excluded.parent_code,
      category = excluded.category,
      base_year_employment = excluded.base_year_employment,
      median_annual_wage = excluded.median_annual_wage,
      base_year = excluded.base_year,
      regional_employment_data = excluded.regional_employment_data,
      regional_wage_data = excluded.regional_wage_data,
      updated_at = CURRENT_TIMESTAMP
    WHERE 
      -- Only update if data has actually changed
      (occupations.name != excluded.name OR
       occupations.median_annual_wage != excluded.median_annual_wage OR
       occupations.base_year_employment != excluded.base_year_employment OR
       occupations.regional_employment_data != excluded.regional_employment_data OR
       occupations.regional_wage_data != excluded.regional_wage_data)
  `);
  
  let updatedCount = 0;
  let insertedCount = 0;
  
  for (const [code, occ] of occupations) {
    // Convert regional data to JSON
    const regionalEmployment = {};
    const regionalWages = {};
    
    for (const [region, data] of occ.regions) {
      if (data.employment) regionalEmployment[region] = data.employment;
      if (data.wage) regionalWages[region] = data.wage;
    }
    
    const result = await upsertStmt.execute([
      occ.code,
      occ.name,
      occ.occupation_type,
      occ.parent_code,
      occ.category,
      occ.base_year_employment,
      occ.median_annual_wage,
      CURRENT_BASE_YEAR,
      Object.keys(regionalEmployment).length > 0 ? JSON.stringify(regionalEmployment) : null,
      Object.keys(regionalWages).length > 0 ? JSON.stringify(regionalWages) : null
    ]);
    
    // SQLite changes() returns number of rows that were changed
    if (result.changes > 0) {
      // Check if this was an insert or update
      const exists = await db.execute('SELECT id FROM occupations WHERE code = ?', [occ.code]);
      if (exists.rows.length > 0) {
        updatedCount++;
      } else {
        insertedCount++;
      }
    }
  }
  
  await upsertStmt.finalize();
  console.log(`✅ UPSERT completed: ${insertedCount} inserted, ${updatedCount} updated`);
  
  return { inserted: insertedCount, updated: updatedCount };
}

// You could also track specific field changes
async function detectChanges(newOccupations) {
  console.log('🔍 Detecting specific changes...');
  
  const changes = {
    newOccupations: [],
    updatedWages: [],
    updatedEmployment: [],
    updatedRegional: []
  };
  
  for (const [code, newOcc] of newOccupations) {
    const existing = await db.execute(
      'SELECT * FROM occupations WHERE code = ?', 
      [code]
    );
    
    if (existing.rows.length === 0) {
      changes.newOccupations.push(code);
    } else {
      const existingOcc = existing.rows[0];
      
      if (existingOcc.median_annual_wage !== newOcc.median_annual_wage) {
        changes.updatedWages.push({
          code,
          old: existingOcc.median_annual_wage,
          new: newOcc.median_annual_wage
        });
      }
      
      if (existingOcc.base_year_employment !== newOcc.base_year_employment) {
        changes.updatedEmployment.push({
          code,
          old: existingOcc.base_year_employment,
          new: newOcc.base_year_employment
        });
      }
      
      // Check regional data changes
      const oldRegional = existingOcc.regional_wage_data ? 
        JSON.parse(existingOcc.regional_wage_data) : {};
      const newRegional = {};
      for (const [region, data] of newOcc.regions) {
        if (data.wage) newRegional[region] = data.wage;
      }
      
      if (JSON.stringify(oldRegional) !== JSON.stringify(newRegional)) {
        changes.updatedRegional.push(code);
      }
    }
  }
  
  return changes;
}
