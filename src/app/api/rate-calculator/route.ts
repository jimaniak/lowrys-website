import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  try {
    switch (action) {      case 'major-groups':
        // Get MAJOR category occupations
        const majorGroupsResult = await db.execute(`
          SELECT code, name, category 
          FROM occupations 
          WHERE category = 'MAJOR'
          ORDER BY name
        `);
        return NextResponse.json({ majorGroups: majorGroupsResult.rows });      case 'hierarchy':
        // Get all major groups with their detailed occupations count
        const majorGroupsWithCounts = await db.execute(`
          SELECT 
            m.code,
            m.name,
            COUNT(o.code) as occupation_count
          FROM (
            SELECT code, name 
            FROM occupations 
            WHERE occupation_type = 'Summary' 
              AND code LIKE '%-0000' 
              AND code != '00-0000'
          ) m
          LEFT JOIN occupations o ON o.parent_code = m.code OR o.code LIKE SUBSTR(m.code, 1, 2) || '%'
          WHERE (o.occupation_type = 'Line item' OR o.occupation_type IS NULL)
          GROUP BY m.code, m.name
          ORDER BY m.name
        `);
        
        return NextResponse.json({ 
          majorGroups: majorGroupsWithCounts.rows.map((row: any) => ({
            code: row.code,
            name: row.name,
            count: row.occupation_count
          }))        });

      case 'occupations-by-major':
        const majorCode = searchParams.get('majorCode');
        if (!majorCode) {
          return NextResponse.json({ error: 'Major code required' }, { status: 400 });
        }
        
        // Get MINOR and BROAD occupations for this major group
        const occupationsForMajor = await db.execute({
          sql: `SELECT code, name, category FROM occupations 
                WHERE (category = 'MINOR' OR category = 'BROAD')
                  AND code LIKE ? 
                  AND code != ?
                ORDER BY name`,
          args: [majorCode.substring(0, 2) + '%', majorCode]
        });        
          return NextResponse.json({ 
          occupations: occupationsForMajor.rows
        });

      case 'detailed-occupations':
        const majorGroup = searchParams.get('majorGroup');
        const minorCode = searchParams.get('minorCode');
        
        // Get DETAILED occupations - these are parents to OCCUPATION
        let occupationsQuery = `
          SELECT code, name, occupation_type, category 
          FROM occupations 
          WHERE category = 'DETAILED'`;
        let occupationsArgs: any[] = [];
        
        if (minorCode && minorCode !== 'ALL') {
          occupationsQuery += ' AND (parent_code = ? OR code LIKE ?)';
          occupationsArgs.push(minorCode, minorCode.substring(0, 4) + '%');
        } else if (majorGroup && majorGroup !== 'ALL') {
          occupationsQuery += ' AND code LIKE ?';
          occupationsArgs.push(majorGroup.substring(0, 2) + '%');
        }
        
        occupationsQuery += ' ORDER BY name';
        const occupationsResult = await db.execute({ sql: occupationsQuery, args: occupationsArgs });
        return NextResponse.json({ occupations: occupationsResult.rows });

      case 'occupations-by-detailed':
        const detailedCode = searchParams.get('detailedCode');
        if (!detailedCode) {
          return NextResponse.json({ error: 'Detailed code required' }, { status: 400 });
        }
        
        // Get OCCUPATION jobs under this DETAILED parent
        const occupationsByDetailed = await db.execute({
          sql: `SELECT code, name, occupation_type, category 
                FROM occupations 
                WHERE category = 'OCCUPATION'
                  AND (parent_code = ? OR code LIKE ?)
                ORDER BY name`,
          args: [detailedCode, detailedCode.substring(0, 6) + '%']
        });
        
        return NextResponse.json({ 
          occupations: occupationsByDetailed.rows
        });

      case 'regions':
        const occupation = searchParams.get('occupation');
        if (!occupation) {
          return NextResponse.json({ error: 'Occupation parameter required' }, { status: 400 });
        }
        
        const regionsResult = await db.execute({
          sql: 'SELECT DISTINCT region as code, region_name as name FROM occupation_data WHERE occupation_code = ? ORDER BY region_name',
          args: [occupation]
        });
        return NextResponse.json({ regions: regionsResult.rows });

      case 'wage-data':
        const occupationCode = searchParams.get('occupation');
        const region = searchParams.get('region');
        
        if (!occupationCode || !region) {
          return NextResponse.json({ error: 'Occupation and region parameters required' }, { status: 400 });
        }

        const wageResult = await db.execute({
          sql: `SELECT 
                  od.*, 
                  o.name as occupation_name,
                  od.region_name
                FROM occupation_data od
                JOIN occupations o ON od.occupation_code = o.code
                WHERE od.occupation_code = ? AND od.region = ?`,
          args: [occupationCode, region]
        });

        if (wageResult.rows.length === 0) {
          return NextResponse.json({ wageData: null });
        }

        const wageRow = wageResult.rows[0];        const wageData = {
          occupationName: wageRow.occupation_name,
          regionName: wageRow.region_name,
          wage: {
            mean_annual: wageRow.mean_annual === '*' ? null : Number(wageRow.mean_annual),
            mean_hourly: wageRow.mean_hourly === '*' ? null : Number(wageRow.mean_hourly),
            median_annual: wageRow.median_annual === '*' ? null : Number(wageRow.median_annual),
            median_hourly: wageRow.median_hourly === '*' ? null : Number(wageRow.median_hourly)
          },
          benefits: {
            avg_annual: wageRow.benefit_annual === '*' ? null : Number(wageRow.benefit_annual)
          }
        };

        return NextResponse.json({ wageData });      case 'projections':
        const projOccupation = searchParams.get('occupation');
        if (!projOccupation) {
          return NextResponse.json({ error: 'Occupation parameter required' }, { status: 400 });
        }

        // Get comprehensive projections data using new schema
        const projResult = await db.execute({
          sql: `
            SELECT 
              base_year,
              projection_year,
              employment,
              employment_change,
              employment_percent_change,
              annual_openings,
              median_wage,
              typical_education,
              work_experience,
              on_job_training,
              summary,
              projection_period
            FROM projections
            WHERE occupation_code = ?
            ORDER BY base_year DESC
            LIMIT 1
          `,
          args: [projOccupation]
        });

        if (projResult.rows.length === 0) {
          return NextResponse.json({ projections: null });
        }

        const projRow = projResult.rows[0];
        
        // Get employment data for base and projection years
        const employmentResult = await db.execute({
          sql: `
            SELECT 
              base_year_employment,
              projection_year_employment,
              base_year,
              projection_year
            FROM occupation_data
            WHERE occupation_code = ? AND region = 'US'
            ORDER BY data_year DESC
            LIMIT 1
          `,
          args: [projOccupation]
        });

        const employmentRow = employmentResult.rows.length > 0 ? employmentResult.rows[0] : null;
        
        // Check status flags from the comprehensive BLS special tables
        const statusChecks = await Promise.all([
          db.execute({ sql: 'SELECT 1 FROM bls_special_tables WHERE occupation_code = ? AND table_number = ?', args: [projOccupation, 'Table 1.3'] }),
          db.execute({ sql: 'SELECT 1 FROM bls_special_tables WHERE occupation_code = ? AND table_number = ?', args: [projOccupation, 'Table 1.4'] }),
          db.execute({ sql: 'SELECT 1 FROM bls_special_tables WHERE occupation_code = ? AND table_number = ?', args: [projOccupation, 'Table 1.5'] }),
          db.execute({ sql: 'SELECT 1 FROM bls_special_tables WHERE occupation_code = ? AND table_number = ?', args: [projOccupation, 'Table 1.6'] }),
          db.execute({ sql: 'SELECT 1 FROM bls_special_tables WHERE occupation_code = ? AND table_number = ?', args: [projOccupation, 'Table 1.7'] }),
          db.execute({ sql: 'SELECT 1 FROM bls_special_tables WHERE occupation_code = ? AND table_number = ?', args: [projOccupation, 'Table 1.8'] }),
          db.execute({ sql: 'SELECT 1 FROM bls_special_tables WHERE occupation_code = ? AND table_number = ?', args: [projOccupation, 'Table 1.9'] })
        ]);
          // Get factors affecting occupational utilization from Table 1.12
        // Prioritize "Total employment" (TE1000) industry code
        const factorsResult = await db.execute({
          sql: `SELECT additional_data FROM bls_special_tables 
                WHERE occupation_code = ? AND table_number = 'Table 1.12'
                ORDER BY CASE 
                  WHEN JSON_EXTRACT(additional_data, '$."2023 National Employment Matrix industry code"') = 'TE1000' THEN 1
                  ELSE 2
                END
                LIMIT 1`,
          args: [projOccupation]
        });
          let factors = null;
        if (factorsResult.rows.length > 0) {
          try {
            const additionalData = factorsResult.rows[0].additional_data;
            if (typeof additionalData === 'string') {
              const factorsData = JSON.parse(additionalData);
              factors = factorsData['Factors affecting occupational utilization'] || null;
            }
          } catch (e) {
            // Handle JSON parse error gracefully
            factors = null;
          }
        }
        
        const projectionData = {
          // Use year-flexible data
          projected_2023: employmentRow ? Number(employmentRow.base_year_employment) : Number(projRow.employment),
          projected_2033: employmentRow ? Number(employmentRow.projection_year_employment) : Number(projRow.employment),          projected_change: Number(projRow.employment_change),
          projected_percent: Number(projRow.employment_percent_change),
          projected_openings: Number(projRow.annual_openings),
          median_wage: projRow.median_wage === '*' ? null : Number(projRow.median_wage),
          typical_education: projRow.typical_education,
          work_experience: projRow.work_experience,
          on_job_training: projRow.on_job_training,
          summary: projRow.summary,
          base_year: employmentRow ? Number(employmentRow.base_year) : Number(projRow.base_year),
          projection_year: employmentRow ? Number(employmentRow.projection_year) : Number(projRow.projection_year),
          projection_period: projRow.projection_period,
          // Add comprehensive status flags
          is_fastest_growing: statusChecks[0].rows.length > 0,
          is_most_job_growth: statusChecks[1].rows.length > 0,
          is_fastest_declining: statusChecks[2].rows.length > 0,
          is_largest_declines: statusChecks[3].rows.length > 0,          is_most_openings: statusChecks[4].rows.length > 0,
          is_highest_paying: statusChecks[5].rows.length > 0,
          is_stem: statusChecks[6].rows.length > 0,
          // Add factors affecting occupational utilization
          factors: factors,
          factors_affecting_utilization: factors
        };

        return NextResponse.json({ projections: projectionData });

      case 'hierarchy':
        const hierarchyOccupation = searchParams.get('occupation');
        if (!hierarchyOccupation) {
          return NextResponse.json({ error: 'Occupation parameter required' }, { status: 400 });
        }        // Get the full hierarchical path for an occupation
        const hierarchyResult = await db.execute({
          sql: 'SELECT * FROM occupations WHERE code = ?',
          args: [hierarchyOccupation]
        });

        if (hierarchyResult.rows.length === 0) {
          return NextResponse.json({ hierarchy: null });
        }        const occupationData = hierarchyResult.rows[0];
        const occupationHierarchy: {
          detailed: { code: any; name: any; type: any };
          major?: { code: any; name: any };
          minor?: { code: any; name: any };
          broad?: { code: any; name: any };
        } = {
          detailed: {
            code: occupationData.code,
            name: occupationData.name,
            type: occupationData.occupation_type
          }
        };

        // Get major group (ends with -0000)
        if (occupationData.major_group_code) {
          const majorResult = await db.execute({
            sql: 'SELECT code, name FROM occupations WHERE code = ?',
            args: [occupationData.major_group_code]
          });          if (majorResult.rows.length > 0) {
            occupationHierarchy.major = {
              code: majorResult.rows[0].code,
              name: majorResult.rows[0].name
            };
          }
        }        // Try to find minor group (code pattern like XX-XX00)
        if (occupationData.code && typeof occupationData.code === 'string') {
          const minorGroupCode = occupationData.code.substring(0, 5) + '00';
          if (minorGroupCode !== occupationData.code) {
            const minorResult = await db.execute({
              sql: 'SELECT code, name FROM occupations WHERE code = ?',
              args: [minorGroupCode]
            });            if (minorResult.rows.length > 0) {
              occupationHierarchy.minor = {
                code: minorResult.rows[0].code,
                name: minorResult.rows[0].name
              };
            }
          }

          // Try to find broad occupation (code pattern like XX-XXX0)
          const broadOccupationCode = occupationData.code.substring(0, 6) + '0';
          if (broadOccupationCode !== occupationData.code && broadOccupationCode !== minorGroupCode) {
            const broadResult = await db.execute({
              sql: 'SELECT code, name FROM occupations WHERE code = ?',
              args: [broadOccupationCode]
            });            if (broadResult.rows.length > 0) {
              occupationHierarchy.broad = {
                code: broadResult.rows[0].code,
                name: broadResult.rows[0].name
              };
            }
          }
        }        return NextResponse.json({ hierarchy: occupationHierarchy });      case 'hierarchy-3-level':
        try {
          // Get all occupations with parent relationships for 3-level hierarchy
          // Using code structure instead of unreliable occupation_type field
          const hierarchyData = await db.execute(`
            SELECT 
              code,
              name,
              parent_code,
              occupation_type,
              employment_2023,
              employment_2033,
              employment_change_percent,
              median_annual_wage_2024 as median_wage
            FROM occupations 
            WHERE code IS NOT NULL
            ORDER BY code
          `);

          // Build 3-level recursive hierarchy (Major → Minor → Detailed)
          const buildHierarchy = (parentCode: string | null = null): any[] => {
            return hierarchyData.rows
              .filter((row: any) => row.parent_code === parentCode)
              .map((row: any) => ({
                code: row.code,
                name: row.name,
                occupation_type: row.occupation_type,
                employment_2023: row.employment_2023,
                employment_2033: row.employment_2033,
                employment_change_percent: row.employment_change_percent,
                median_wage: row.median_wage,
                children: buildHierarchy(row.code)
              }));
          };

          const hierarchy = buildHierarchy();

          return NextResponse.json({ 
            success: true, 
            data: hierarchy,
            levels: ['Major Groups', 'Minor Groups', 'Detailed Occupations']
          });
        } catch (error) {
          console.error('Error fetching 3-level hierarchy:', error);
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch hierarchy data' 
          }, { status: 500 });
        }

      case 'search-occupations':
        const searchTerm = searchParams.get('search');
        const limit = searchParams.get('limit') || '50';
        
        if (!searchTerm || searchTerm.length < 2) {
          return NextResponse.json({ occupations: [] });
        }        // Search occupations by name, only including Line item occupations (not Summary categories)
        const searchResult = await db.execute({
          sql: `SELECT 
                  o.code, 
                  o.name, 
                  o.parent_code,
                  o.occupation_type
                FROM occupations o
                WHERE o.occupation_type = 'Line item'
                AND LOWER(o.name) LIKE LOWER(?)
                ORDER BY 
                  CASE 
                    WHEN LOWER(o.name) LIKE LOWER(?) THEN 1 
                    ELSE 2 
                  END,
                  o.name
                LIMIT ?`,
          args: [`%${searchTerm}%`, `${searchTerm}%`, parseInt(limit)]
        });
        
        return NextResponse.json({ 
          occupations: searchResult.rows,
          searchTerm: searchTerm
        });

      case 'list-tables':
        const tablesResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        return NextResponse.json({ tables: tablesResult.rows });

      case 'hierarchy-major':
        // Get all major categories (excluding TOP)
        const majorResult = await db.execute(`
          SELECT code, name, parent_code 
          FROM occupations 
          WHERE category = 'MAJOR' 
          ORDER BY name
        `);
        return NextResponse.json({ categories: majorResult.rows });

      case 'hierarchy-minor':
        const majorParent = searchParams.get('parent');
        if (!majorParent) {
          return NextResponse.json({ error: 'Parent major code required' }, { status: 400 });
        }
        
        // Get minor and broad categories for the selected major (they are siblings)
        const minorResult = await db.execute({
          sql: `SELECT code, name, parent_code, category 
                FROM occupations 
                WHERE (category = 'MINOR' OR category = 'BROAD') 
                AND parent_code = ? 
                ORDER BY name`,
          args: [majorParent]
        });
        return NextResponse.json({ categories: minorResult.rows });

      case 'hierarchy-detailed':
        const minorParent = searchParams.get('parent');
        if (!minorParent) {
          return NextResponse.json({ error: 'Parent minor/broad code required' }, { status: 400 });
        }
        
        // Get detailed categories for the selected minor/broad
        const detailedResult = await db.execute({
          sql: `SELECT code, name, parent_code 
                FROM occupations 
                WHERE category = 'DETAILED' 
                AND parent_code = ? 
                ORDER BY name`,
          args: [minorParent]
        });
        return NextResponse.json({ categories: detailedResult.rows });

      case 'hierarchy-occupations':
        const detailedParent = searchParams.get('parent');
        if (!detailedParent) {
          return NextResponse.json({ error: 'Parent detailed code required' }, { status: 400 });
        }
          // Get actual occupations (Line items) for the selected detailed category
        const detailedOccupationResult = await db.execute({
          sql: `SELECT code, name, parent_code 
                FROM occupations 
                WHERE occupation_type = 'Line item' 
                AND parent_code = ? 
                ORDER BY name`,
          args: [detailedParent]
        });
        return NextResponse.json({ occupations: detailedOccupationResult.rows });      case 'get-major-categories':
        // Get major categories from the hierarchy
        // First, add the "All" option, then get actual major categories
        const allOption = { code: "00-0000", name: "All Occupations" };
        
        try {
          // Major categories typically end with "-0000" and are not "00-0000"
          const majorCategoriesResult = await db.execute(`
            SELECT DISTINCT code, name 
            FROM occupations 
            WHERE code LIKE '%-0000' 
            AND code != '00-0000'
            AND occupation_type = 'Summary'
            ORDER BY code
          `);
          
          console.log('Major categories query result:', majorCategoriesResult.rows);
          
          const categories = [allOption, ...majorCategoriesResult.rows];
          
          return NextResponse.json({ 
            categories: categories 
          });
        } catch (error) {
          // If the query fails, at least return the "All" option
          console.error('Error fetching major categories:', error);
          return NextResponse.json({ 
            categories: [allOption] 
          });
        }      case 'get-minor-categories':
        const majorCodeForMinors = searchParams.get('majorCode');
        
        if (!majorCodeForMinors) {
          return NextResponse.json({ error: 'Major code required' }, { status: 400 });
        }
          try {          // For "All Occupations" (00-0000), return ALL minor & broad categories from all major groups
          if (majorCodeForMinors === '00-0000') {
            const allMinorsResult = await db.execute(`
              SELECT DISTINCT code, name 
              FROM occupations 
              WHERE occupation_type = 'Summary'
              AND LENGTH(code) = 7
              AND (
                -- BROAD: 2nd from right = '0', 3rd from right ≠ '0'
                (SUBSTR(code, -2, 1) = '0' AND SUBSTR(code, -3, 1) != '0')
                OR
                -- MINOR: 4th from right ≠ '0', last 3 chars = '000'  
                (SUBSTR(code, -4, 1) != '0' AND SUBSTR(code, -3) = '000')
              )
              ORDER BY code
            `);
            
            console.log('All minor & broad categories query result:', allMinorsResult.rows.length, 'items');
            
            return NextResponse.json({ 
              categories: allMinorsResult.rows 
            });
          }
            // Get minor & broad categories for the selected major group
          // Use proper BLS hierarchy logic: Summary type, 4th char != '0', ends with '000' (minor) or '00' (broad)
          const majorPrefix = majorCodeForMinors.substring(0, 2);          const minorCategoriesResult = await db.execute({
            sql: `SELECT DISTINCT code, name 
                  FROM occupations 
                  WHERE code LIKE ?
                  AND code != ?
                  AND occupation_type = 'Summary'
                  AND LENGTH(code) = 7
                  AND (
                    -- BROAD: 2nd from right = '0', 3rd from right ≠ '0'
                    (SUBSTR(code, -2, 1) = '0' AND SUBSTR(code, -3, 1) != '0')
                    OR
                    -- MINOR: 4th from right ≠ '0', last 3 chars = '000'  
                    (SUBSTR(code, -4, 1) != '0' AND SUBSTR(code, -3) = '000')
                  )
                  ORDER BY code`,
            args: [`${majorPrefix}-%`, majorCodeForMinors]
          });
          
          console.log('Minor categories query result for', majorCodeForMinors, ':', minorCategoriesResult.rows.length, 'items');
          
          return NextResponse.json({ 
            categories: minorCategoriesResult.rows 
          });
        } catch (error) {
          console.error('Error fetching minor categories:', error);
          return NextResponse.json({ 
            categories: [] 
          });
        }      case 'get-detailed-categories':
        const minorCodeForDetailed = searchParams.get('minorCode');
        
        if (!minorCodeForDetailed) {          return NextResponse.json({ error: 'Minor code required' }, { status: 400 });
        }
        
        try {
          // Get detailed categories (7-character Summary codes) for the selected minor group
          // Look for occupations that start with the same prefix as the minor group but are Summary categories
          const minorPrefix = minorCodeForDetailed.substring(0, 5); // Get XX-XX part
          
          const detailedCategoriesResult = await db.execute({
            sql: `SELECT DISTINCT code, name 
                  FROM occupations 
                  WHERE code LIKE ?
                  AND occupation_type = 'Summary'
                  AND LENGTH(code) = 7
                  AND SUBSTR(code, 6, 1) != '0'
                  ORDER BY code`,
            args: [`${minorPrefix}%`]
          });
          
          console.log('Detailed categories query result for', minorCodeForDetailed, ':', detailedCategoriesResult.rows.length, 'items');
          
          return NextResponse.json({ 
            categories: detailedCategoriesResult.rows 
          });
        } catch (error) {
          console.error('Error fetching detailed categories:', error);
          return NextResponse.json({ 
            categories: [] 
          });
        }

      case 'get-all-detailed-categories':        try {
          // Get ALL detailed categories (7-character Summary codes) from the database
          const allDetailedResult = await db.execute(`
            SELECT DISTINCT code, name 
            FROM occupations 
            WHERE occupation_type = 'Summary'
            AND LENGTH(code) = 7
            ORDER BY code
            LIMIT 100
          `);
          
          console.log('All detailed categories query result:', allDetailedResult.rows.length, 'items');
          
          return NextResponse.json({ 
            categories: allDetailedResult.rows 
          });
        } catch (error) {
          console.error('Error fetching all detailed categories:', error);
          return NextResponse.json({ 
            categories: [] 
          });
        }      case 'get-detailed-categories-by-major':
        const majorCodeForDetailed = searchParams.get('majorCode');
        
        if (!majorCodeForDetailed) {
          return NextResponse.json({ error: 'Major code required' }, { status: 400 });
        }
          try {
          // Get detailed categories (7-character Summary codes) for a specific major group
          // Find all Summary categories where the code starts with the major's prefix
          const majorPrefix = majorCodeForDetailed.substring(0, 2);
          const detailedByMajorResult = await db.execute({
            sql: `SELECT DISTINCT code, name 
                  FROM occupations 
                  WHERE code LIKE ?
                  AND occupation_type = 'Summary'
                  AND LENGTH(code) = 7
                  ORDER BY code`,
            args: [`${majorPrefix}-%`]
          });
          
          console.log('Detailed categories by major query result for', majorCodeForDetailed, ':', detailedByMajorResult.rows.length, 'items');
          
          return NextResponse.json({ 
            categories: detailedByMajorResult.rows 
          });
        } catch (error) {
          console.error('Error fetching detailed categories by major:', error);
          return NextResponse.json({ 
            categories: [] 
          });
        }case 'get-detailed-categories-for-minors':
        const minorCodesParam = searchParams.get('minorCodes');
        
        if (!minorCodesParam) {
          return NextResponse.json({ error: 'Minor codes required' }, { status: 400 });
        }
        
        try {
          // Split the comma-separated minor codes and get detailed categories for all of them
          const minorCodes = minorCodesParam.split(',');
          console.log('Getting detailed categories for minors:', minorCodes);
          
          // Create a WHERE clause that matches the prefix of each minor code
          const whereConditions = minorCodes.map(() => 'code LIKE ?').join(' OR ');
          const minorPrefixes = minorCodes.map(code => code.substring(0, 5) + '%');            const detailedForMinorsResult = await db.execute({
            sql: `SELECT DISTINCT code, name 
                  FROM occupations 
                  WHERE (${whereConditions})
                  AND occupation_type = 'Summary'
                  AND LENGTH(code) = 7
                  AND SUBSTR(code, 6, 1) != '0'
                  ORDER BY code`,
            args: minorPrefixes
          });
          
          console.log('Detailed categories for minors query result:', detailedForMinorsResult.rows.length, 'items');
          
          return NextResponse.json({ 
            categories: detailedForMinorsResult.rows 
          });
        } catch (error) {
          console.error('Error fetching detailed categories for minors:', error);
          return NextResponse.json({ 
            categories: [] 
          });
        }

      case 'sample-occupations':
      // TEMP: Return first 10 rows from occupations table where category is not 'OTHER'
      const sampleResult = await db.execute("SELECT * FROM occupations WHERE category != 'OTHER' LIMIT 10");
      return NextResponse.json({ sample: sampleResult.rows });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
