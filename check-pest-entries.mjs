import { db } from './src/lib/database.ts';

async function checkPestEntries() {
  try {
    const result = await db.execute({
      sql: `SELECT DISTINCT name, category, code FROM occupations WHERE name LIKE '%pest%' ORDER BY name, code`,
      args: []
    });
    
    console.log('Pest control entries in occupations:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPestEntries();
