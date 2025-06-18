import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'major-groups':
        const majorGroupsResult = await db.execute('SELECT * FROM major_groups ORDER BY name');
        return NextResponse.json({ majorGroups: majorGroupsResult.rows });      case 'detailed-occupations':
        const majorGroup = searchParams.get('majorGroup');        // Filter out Summary occupations and NULL occupation_type records
        let occupationsQuery = 'SELECT * FROM occupations WHERE occupation_type IS NOT NULL AND occupation_type != ?';
        let occupationsArgs: any[] = ['Summary'];
          if (majorGroup && majorGroup !== 'ALL') {
          occupationsQuery += ' AND major_group_code = ?';
          occupationsArgs.push(majorGroup);
        }
        
        occupationsQuery += ' ORDER BY name';
        const occupationsResult = await db.execute({ sql: occupationsQuery, args: occupationsArgs });
        return NextResponse.json({ occupations: occupationsResult.rows });

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
        }

        // Get the full hierarchical path for an occupation
        const occupationResult = await db.execute({
          sql: 'SELECT * FROM occupations WHERE code = ?',
          args: [hierarchyOccupation]
        });

        if (occupationResult.rows.length === 0) {
          return NextResponse.json({ hierarchy: null });
        }        const occupationData = occupationResult.rows[0];
        const hierarchy: {
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
          });
          if (majorResult.rows.length > 0) {
            hierarchy.major = {
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
            });
            if (minorResult.rows.length > 0) {
              hierarchy.minor = {
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
            });
            if (broadResult.rows.length > 0) {
              hierarchy.broad = {
                code: broadResult.rows[0].code,
                name: broadResult.rows[0].name
              };
            }
          }
        }

        return NextResponse.json({ hierarchy });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
