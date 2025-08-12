import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function countCategories() {
  try {
    const result = await db.execute(`SELECT category, COUNT(*) as count FROM occupations GROUP BY category`);
    console.log('Category counts:');
    console.table(result.rows);
    const detailed = await db.execute(`SELECT * FROM occupations WHERE category = 'DETAILED' LIMIT 5`);
    console.log('Sample DETAILED:');
    console.table(detailed.rows);
    const occupation = await db.execute(`SELECT * FROM occupations WHERE category = 'OCCUPATION' LIMIT 5`);
    console.log('Sample OCCUPATION:');
    console.table(occupation.rows);
  } catch (error) {
    console.error('Error:', error);
  }
}

countCategories();
