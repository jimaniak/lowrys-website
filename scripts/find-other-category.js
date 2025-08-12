
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function findOtherCategory() {
  try {
    const result = await db.execute("SELECT * FROM occupations WHERE category = 'OTHER'");
    console.log("Found 'OTHER' category records:");
    console.table(result.rows);
  } catch (error) {
    console.error("Error fetching 'OTHER' category records:", error);
  }
}

findOtherCategory();
