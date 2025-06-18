// Database connection utility for Turso
import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is required');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is required');
}

// Create Turso client
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Helper functions for common queries
export const dbHelpers = {
  // Get all major groups
  async getMajorGroups() {
    const result = await db.execute('SELECT * FROM major_groups ORDER BY name');
    return result.rows;
  },

  // Get occupations by major group
  async getOccupationsByMajorGroup(majorGroupCode: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM occupations WHERE major_group_code = ? ORDER BY name',
      args: [majorGroupCode]
    });
    return result.rows;
  },

  // Get all occupations (for "All Major Groups" option)
  async getAllOccupations() {
    const result = await db.execute('SELECT * FROM occupations ORDER BY name');
    return result.rows;
  },

  // Get occupation data with salary info for a specific occupation
  async getOccupationData(occupationCode: string, region?: string) {
    let sql = `
      SELECT od.*, o.name as occupation_name, mg.name as major_group_name
      FROM occupation_data od
      JOIN occupations o ON od.occupation_code = o.code
      JOIN major_groups mg ON o.major_group_code = mg.code
      WHERE od.occupation_code = ?
    `;
    const args = [occupationCode];

    if (region && region !== 'US') {
      sql += ' AND od.region = ?';
      args.push(region);
    }

    sql += ' ORDER BY od.region_name';

    const result = await db.execute({ sql, args });
    return result.rows;
  },

  // Get available regions for a specific occupation
  async getRegionsForOccupation(occupationCode: string) {
    const result = await db.execute({
      sql: `
        SELECT DISTINCT region, region_name 
        FROM occupation_data 
        WHERE occupation_code = ? 
        ORDER BY 
          CASE WHEN region = 'US' THEN 0 ELSE 1 END, 
          region_name
      `,
      args: [occupationCode]
    });
    return result.rows;
  },

  // Job stability analysis
  async getJobStability(occupationCode?: string, region?: string) {
    let sql = 'SELECT * FROM job_stability';
    const args: string[] = [];
    
    if (occupationCode) {
      sql += ' WHERE code = ?';
      args.push(occupationCode);
    }
    
    sql += ' ORDER BY growth_rate DESC';
    
    const result = await db.execute({
      sql,
      args
    });
    return result.rows;
  },

  // Search occupations
  async searchOccupations(searchTerm: string) {
    const result = await db.execute({
      sql: `
        SELECT o.*, mg.name as major_group_name
        FROM occupations o
        JOIN major_groups mg ON o.major_group_code = mg.code
        WHERE o.name LIKE ? OR mg.name LIKE ?
        ORDER BY o.name
        LIMIT 50
      `,
      args: [`%${searchTerm}%`, `%${searchTerm}%`]
    });
    return result.rows;
  },  // Get comprehensive benchmark data for Rate Calculator
  async getBenchmarkData(occupationCode: string, region: string = 'US') {
    const result = await db.execute({
      sql: `
        SELECT 
          mean_annual, median_annual, benefit_annual, mean_hourly, median_hourly,
          total_employment, base_year_employment, projection_year_employment,
          employment_change_numeric, employment_change_percent, annual_openings_average,
          current_median_wage, base_year, projection_year
        FROM occupation_data 
        WHERE occupation_code = ? AND region = ?
        ORDER BY data_year DESC
        LIMIT 1
      `,
      args: [occupationCode, region]
    });
    return result.rows[0] || null;
  },

  // Get all major groups for Rate Calculator
  async getMajorGroupsForRateCalculator() {
    const result = await db.execute('SELECT code, name FROM major_groups ORDER BY name');
    return [
      { code: 'ALL', name: 'All Major Groups' },
      ...result.rows.map(row => ({ code: row.code, name: row.name }))
    ];
  },

  // Get occupations filtered by major group for Rate Calculator
  async getOccupationsForRateCalculator(majorGroupCode: string) {
    let sql = `
      SELECT DISTINCT o.code, o.name
      FROM occupations o
      JOIN occupation_data od ON o.code = od.occupation_code
      WHERE od.region != 'US'
    `;
    const args: string[] = [];

    if (majorGroupCode !== 'ALL') {
      sql += ' AND o.major_group_code = ?';
      args.push(majorGroupCode);
    }

    sql += ' ORDER BY o.name';    const result = await db.execute({ sql, args });
    return result.rows;
  },

  // Get projections data for an occupation
  async getOccupationProjections(occupationCode: string) {
    return await getOccupationProjections(occupationCode);
  }
};

// Enhanced Rate Calculator Functions - Full Feature Parity
export async function getMajorGroups() {
  const result = await db.execute(`
    SELECT code, name 
    FROM major_groups 
    ORDER BY name ASC
  `);
  
  return [
    { code: "ALL", name: "All Major Groups" },
    ...result.rows.map(row => ({
      code: row.code as string,
      name: row.name as string
    }))
  ];
}

export async function getDetailedOccupations(majorGroupCode?: string) {
  let sql = `
    SELECT DISTINCT o.code, o.name, o.major_group_code
    FROM occupations o
    INNER JOIN occupation_data od ON o.code = od.occupation_code
    WHERE od.region != 'US' -- Only occupations with state-level data
  `;
  
  const args: string[] = [];
  
  if (majorGroupCode && majorGroupCode !== "ALL") {
    sql += ` AND o.major_group_code = ?`;
    args.push(majorGroupCode);
  }
  
  sql += ` ORDER BY o.name ASC`;
  
  const result = await db.execute({ sql, args });
  
  return result.rows.map(row => ({
    code: row.code as string,
    name: row.name as string,
    majorGroupCode: row.major_group_code as string
  }));
}

export async function searchOccupations(searchTerm: string) {
  const result = await db.execute({
    sql: `
      SELECT DISTINCT o.code, o.name, o.major_group_code
      FROM occupations o
      INNER JOIN occupation_data od ON o.code = od.occupation_code
      WHERE o.name LIKE ? AND od.region != 'US'
      ORDER BY o.name ASC
      LIMIT 50
    `,
    args: [`%${searchTerm}%`]
  });
  
  return result.rows.map(row => ({
    code: row.code as string,
    name: row.name as string,
    majorGroupCode: row.major_group_code as string
  }));
}

export async function getRegionsForOccupation(occupationCode: string) {
  const result = await db.execute({
    sql: `
      SELECT DISTINCT region, region_name
      FROM occupation_data 
      WHERE occupation_code = ?
      ORDER BY 
        CASE WHEN region = 'US' THEN 0 ELSE 1 END,
        region_name ASC
    `,
    args: [occupationCode]
  });
  
  return result.rows.map(row => ({
    code: row.region as string,
    name: row.region_name as string
  }));
}

export async function getOccupationWageData(occupationCode: string, region: string) {
  const result = await db.execute({
    sql: `
      SELECT 
        od.mean_annual,
        od.mean_hourly,
        od.median_annual,
        od.median_hourly,
        od.benefit_annual,
        od.region_name,
        od.total_employment,
        od.base_year_employment,
        od.projection_year_employment,
        od.employment_change_numeric,
        od.employment_change_percent,
        od.annual_openings_average,
        od.current_median_wage,
        od.base_year,
        od.projection_year,
        o.name as occupation_name
      FROM occupation_data od
      JOIN occupations o ON od.occupation_code = o.code
      WHERE od.occupation_code = ? AND od.region = ?
      ORDER BY od.data_year DESC
      LIMIT 1
    `,
    args: [occupationCode, region]
  });
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    occupation_name: row.occupation_name as string,
    region_name: row.region_name as string,
    wage: {
      mean_annual: row.mean_annual as number,
      mean_hourly: row.mean_hourly as number,
      median_annual: row.median_annual as number,
      median_hourly: row.median_hourly as number,
      current_median_wage: row.current_median_wage as number
    },
    employment: {
      total_employment: row.total_employment as number,
      base_year_employment: row.base_year_employment as number,
      projection_year_employment: row.projection_year_employment as number,
      employment_change_numeric: row.employment_change_numeric as number,
      employment_change_percent: row.employment_change_percent as number,
      annual_openings_average: row.annual_openings_average as number,
      base_year: row.base_year as number,
      projection_year: row.projection_year as number
    },    benefits: {
      avg_annual: row.benefit_annual as number || Math.round((row.mean_annual as number || 0) * 0.31)
    }
  };
}

// TODO: Add projection functions when projection data is migrated
export async function getOccupationProjections(occupationCode: string) {
  const result = await db.execute({
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
    args: [occupationCode]
  });
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    base_year: row.base_year as number,
    projection_year: row.projection_year as number,
    employment: row.employment as number,
    employment_change: row.employment_change as number,
    employment_percent_change: row.employment_percent_change as number,
    annual_openings: row.annual_openings as number,
    median_wage: row.median_wage as number,
    typical_education: row.typical_education as string,
    work_experience: row.work_experience as string,
    on_job_training: row.on_job_training as string,
    summary: row.summary as string,
    projection_period: row.projection_period as string
  };
}

export async function getOccupationDetails(occupationCode: string) {
  // Get basic occupation info
  const result = await db.execute({
    sql: `
      SELECT o.code, o.name, o.major_group_code, mg.name as major_group_name
      FROM occupations o
      INNER JOIN major_groups mg ON o.major_group_code = mg.code
      WHERE o.code = ?
    `,
    args: [occupationCode]
  });
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    code: row.code as string,
    name: row.name as string,
    majorGroupCode: row.major_group_code as string,
    majorGroupName: row.major_group_name as string
  };
}

// ===== COMPREHENSIVE BLS DATA ACCESS FUNCTIONS =====

// Get BLS special table data for Job Outlook insights
export async function getBLSSpecialTables(occupationCode: string, tableNumber?: string) {
  let sql = `
    SELECT 
      table_number,
      table_name,
      value,
      value_type,
      additional_data,
      projection_period,
      data_year
    FROM bls_special_tables 
    WHERE occupation_code = ?
  `;
  const args = [occupationCode];
  
  if (tableNumber) {
    sql += ' AND table_number = ?';
    args.push(tableNumber);
  }
  
  sql += ' ORDER BY table_number';
  
  const result = await db.execute({ sql, args });
  return result.rows.map(row => ({
    table_number: row.table_number as string,
    table_name: row.table_name as string,
    value: row.value as number,
    value_type: row.value_type as string,
    additional_data: row.additional_data ? JSON.parse(row.additional_data as string) : null,
    projection_period: row.projection_period as string,
    data_year: row.data_year as number
  }));
}

// Get fastest growing occupations (Table 1.3)
export async function getFastestGrowingOccupations(limit: number = 20) {
  const result = await db.execute({
    sql: `
      SELECT 
        bst.occupation_code,
        o.name as occupation_name,
        bst.value as growth_rate,
        bst.projection_period,
        bst.additional_data
      FROM bls_special_tables bst
      JOIN occupations o ON bst.occupation_code = o.code
      WHERE bst.table_number = 'Table 1.3'
      ORDER BY bst.value DESC
      LIMIT ?
    `,
    args: [limit.toString()]
  });
  
  return result.rows.map(row => ({
    occupation_code: row.occupation_code as string,
    occupation_name: row.occupation_name as string,
    growth_rate: row.growth_rate as number,
    projection_period: row.projection_period as string,
    additional_data: row.additional_data ? JSON.parse(row.additional_data as string) : null
  }));
}

// Get comprehensive job outlook for an occupation
export async function getComprehensiveJobOutlook(occupationCode: string) {
  // Get basic occupation info
  const occupation = await getOccupationDetails(occupationCode);
  if (!occupation) return null;
  
  // Get projections
  const projections = await getOccupationProjections(occupationCode);
  
  // Get BLS special table insights
  const specialTables = await getBLSSpecialTables(occupationCode);
  
  // Get employment data
  const employmentData = await getOccupationWageData(occupationCode, 'US');
  
  return {
    occupation,
    projections,
    employment_data: employmentData?.employment || null,
    wage_data: employmentData?.wage || null,
    bls_insights: {
      fastest_growing: specialTables.find(t => t.table_number === 'Table 1.3'),
      most_job_growth: specialTables.find(t => t.table_number === 'Table 1.4'),
      fastest_declining: specialTables.find(t => t.table_number === 'Table 1.5'),
      largest_declines: specialTables.find(t => t.table_number === 'Table 1.6'),
      most_openings: specialTables.find(t => t.table_number === 'Table 1.7'),
      highest_paying: specialTables.find(t => t.table_number === 'Table 1.8'),
      stem_occupation: specialTables.find(t => t.table_number === 'Table 1.9'),
      education_training: specialTables.find(t => t.table_number === 'Table 1.10'),
      wage_ranges: specialTables.find(t => t.table_number === 'Table 1.11'),
      replacement_needs: specialTables.find(t => t.table_number === 'Table 1.12')
    },
    all_tables: specialTables
  };
}

// Get enhanced Rate Calculator data with comprehensive insights
export async function getEnhancedRateCalculatorData(occupationCode: string, region: string) {
  const wageData = await getOccupationWageData(occupationCode, region);
  const projections = await getOccupationProjections(occupationCode);
  const blsInsights = await getBLSSpecialTables(occupationCode);
  
  return {
    wage_data: wageData,
    projections,
    job_outlook: {
      employment_growth: wageData?.employment?.employment_change_percent || projections?.employment_percent_change,
      annual_openings: wageData?.employment?.annual_openings_average || projections?.annual_openings,
      employment_change: wageData?.employment?.employment_change_numeric || projections?.employment_change,
      base_employment: wageData?.employment?.base_year_employment,
      projected_employment: wageData?.employment?.projection_year_employment,
      projection_period: `${wageData?.employment?.base_year}-${wageData?.employment?.projection_year}`
    },
    bls_insights: blsInsights.reduce((acc, table) => {
      acc[table.table_number] = table;
      return acc;
    }, {} as Record<string, any>)
  };
}

export default db;
