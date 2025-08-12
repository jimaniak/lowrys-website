import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function printDetailedSamples() {
  try {
    const result = await db.execute(`SELECT occ_code, occ_title, occupation_type, category FROM occupations WHERE category = 'DETAILED' LIMIT 10`);
    console.table(result.rows);
  } catch (error) {
    console.error('Error:', error);
  }
}

printDetailedSamples();
