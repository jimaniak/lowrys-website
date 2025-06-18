// Debug script to check projections data
import { db } from '../src/lib/database.ts';

async function checkProjectionsData() {
  try {
    console.log('Checking projections table...');
    
    // First, check if the table exists and has data
    const countResult = await db.execute('SELECT COUNT(*) as count FROM projections');
    console.log('Total projections records:', countResult.rows[0].count);
    
    // Get a sample of projection records
    const sampleResult = await db.execute('SELECT * FROM projections LIMIT 5');
    console.log('Sample projections:', sampleResult.rows);
    
    // Check for Computer and Information Systems Managers specifically
    const cisResult = await db.execute({
      sql: 'SELECT * FROM projections WHERE occupation_code LIKE ? OR occupation_code IN (SELECT code FROM occupations WHERE name LIKE ?)',
      args: ['%11-3021%', '%Computer and Information Systems Managers%']
    });
    console.log('Computer and Information Systems Managers projections:', cisResult.rows);
    
    // Check what occupation codes we have
    const occupationResult = await db.execute('SELECT code, name FROM occupations WHERE name LIKE ? LIMIT 3', ['%Computer and Information%']);
    console.log('Computer and Information occupations:', occupationResult.rows);
    
  } catch (error) {
    console.error('Error checking projections:', error);
  }
}

checkProjectionsData();
