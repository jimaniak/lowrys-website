const { createClient } = require('@libsql/client');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function exportToExcel() {
  try {
    console.log('📊 Exporting database to Excel...\n');
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // 1. Export occupations table
    console.log('📋 Exporting occupations table...');
    const occupations = await client.execute(`
      SELECT 
        code,
        name,
        occupation_type,
        parent_code,
        major_group_code,
        CASE 
          WHEN code LIKE '%-0000' THEN 'Major'
          WHEN code LIKE '%-_000' THEN 'Minor'  
          WHEN code LIKE '%-__00' THEN 'Broad'
          ELSE 'Detailed'
        END as code_pattern_suggests
      FROM occupations 
      ORDER BY code
    `);
    
    const occupationsSheet = XLSX.utils.json_to_sheet(occupations.rows);
    XLSX.utils.book_append_sheet(workbook, occupationsSheet, 'Occupations');
    
    // 2. Export major_groups table
    console.log('🏢 Exporting major groups...');
    const majorGroups = await client.execute('SELECT * FROM major_groups ORDER BY code');
    const majorGroupsSheet = XLSX.utils.json_to_sheet(majorGroups.rows);
    XLSX.utils.book_append_sheet(workbook, majorGroupsSheet, 'Major Groups');
    
    // 3. Export occupation_data sample (first 1000 rows)
    console.log('💰 Exporting occupation data sample...');
    const occupationData = await client.execute(`
      SELECT * FROM occupation_data 
      ORDER BY occupation_code, region 
      LIMIT 1000
    `);
    const occupationDataSheet = XLSX.utils.json_to_sheet(occupationData.rows);
    XLSX.utils.book_append_sheet(workbook, occupationDataSheet, 'Wage Data Sample');
    
    // 4. Export projections sample (first 1000 rows)
    console.log('📈 Exporting projections sample...');
    const projections = await client.execute(`
      SELECT * FROM projections 
      ORDER BY occupation_code 
      LIMIT 1000
    `);
    const projectionsSheet = XLSX.utils.json_to_sheet(projections.rows);
    XLSX.utils.book_append_sheet(workbook, projectionsSheet, 'Projections Sample');
    
    // 5. Create analysis sheet
    console.log('🔍 Creating analysis sheet...');
    const analysis = [
      { Metric: 'Total Occupations', Value: occupations.rows.length },
      { Metric: 'Line Item Count', Value: occupations.rows.filter(r => r.occupation_type === 'Line item').length },
      { Metric: 'Summary Count', Value: occupations.rows.filter(r => r.occupation_type === 'Summary').length },
      { Metric: 'NULL Type Count', Value: occupations.rows.filter(r => r.occupation_type === null).length },
      { Metric: 'Has Parent Code', Value: occupations.rows.filter(r => r.parent_code !== null).length },
      { Metric: 'No Parent Code', Value: occupations.rows.filter(r => r.parent_code === null).length },
      { Metric: 'Major Pattern (-0000)', Value: occupations.rows.filter(r => r.code && r.code.endsWith('-0000')).length },
      { Metric: 'Minor Pattern (-X000)', Value: occupations.rows.filter(r => r.code && /.*-\d000$/.test(r.code)).length },
      { Metric: 'Broad Pattern (-XX00)', Value: occupations.rows.filter(r => r.code && /.*-\d\d00$/.test(r.code)).length },
      { Metric: 'Detailed Pattern', Value: occupations.rows.filter(r => r.code && !/.*-\d*00+$/.test(r.code)).length }
    ];
    
    const analysisSheet = XLSX.utils.json_to_sheet(analysis);
    XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Analysis');
    
    // 6. Create NULL occupation_type analysis
    const nullTypes = occupations.rows.filter(r => r.occupation_type === null);
    if (nullTypes.length > 0) {
      const nullTypesSheet = XLSX.utils.json_to_sheet(nullTypes);
      XLSX.utils.book_append_sheet(workbook, nullTypesSheet, 'NULL Occupation Types');
    }
    
    // 7. Create hierarchy issues sheet
    console.log('🔗 Analyzing hierarchy issues...');
    const hierarchyIssues = [];
    
    for (const occ of occupations.rows) {
      if (occ.parent_code) {
        const parentExists = occupations.rows.find(p => p.code === occ.parent_code);
        if (!parentExists) {
          hierarchyIssues.push({
            code: occ.code,
            name: occ.name,
            parent_code: occ.parent_code,
            issue: 'Parent code does not exist'
          });
        }
      }
    }
    
    if (hierarchyIssues.length > 0) {
      const hierarchyIssuesSheet = XLSX.utils.json_to_sheet(hierarchyIssues);
      XLSX.utils.book_append_sheet(workbook, hierarchyIssuesSheet, 'Hierarchy Issues');
    }
    
    // Save the workbook
    const filename = `lowrys-database-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    console.log(`\n✅ Export completed! File saved as: ${filename}`);
    console.log(`📁 Location: ${process.cwd()}\\${filename}`);
    console.log('\nWorkbook contains:');
    console.log('  📋 Occupations - All occupation records with analysis columns');
    console.log('  🏢 Major Groups - All major group records');
    console.log('  💰 Wage Data Sample - First 1000 wage records');
    console.log('  📈 Projections Sample - First 1000 projection records');
    console.log('  🔍 Analysis - Summary statistics');
    if (nullTypes.length > 0) {
      console.log('  ❓ NULL Occupation Types - Records with missing occupation_type');
    }
    if (hierarchyIssues.length > 0) {
      console.log('  🔗 Hierarchy Issues - Parent relationship problems');
    }
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await client.close();
  }
}

exportToExcel();
