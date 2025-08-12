
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const viewsToRemove = [
  'occupation_summary',
  'job_stability',
  'occupation_status',
  'current_occupation_data',
  'current_projections',
  'current_fastest_growing',
  'current_most_job_growth',
  'current_fastest_declining',
  'current_largest_declines',
];

async function removeAllViews() {
  console.log('Starting to remove all database views...');
  try {
    for (const view of viewsToRemove) {
      try {
        await db.execute(`DROP VIEW IF EXISTS ${view}`);
        console.log(`Successfully dropped view: ${view}`);
      } catch (error) {
        console.error(`Error dropping view ${view}:`, error);
      }
    }
    console.log('All specified views have been processed.');
  } catch (error) {
    console.error('An error occurred during view removal:', error);
  }
}

removeAllViews();
