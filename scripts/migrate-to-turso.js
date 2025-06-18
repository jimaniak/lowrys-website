const fs = require('fs');
const { createClient } = require('@libsql/client');
const csv = require('csv-parser');
require('dotenv').config({ path: '.env.local' });

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrateBLSData() {
  console.log('Starting BLS data migration to Turso...');

  try {    // Create tables first (read schema from file) - only if they don't exist
    console.log('Creating database schema...');
    const schema = fs.readFileSync('./db/schema.sql', 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Add IF NOT EXISTS to CREATE TABLE statements
          let safeStatement = statement.trim();
          if (safeStatement.toUpperCase().startsWith('CREATE TABLE')) {
            safeStatement = safeStatement.replace(/CREATE TABLE\s+/i, 'CREATE TABLE IF NOT EXISTS ');
          }
          await db.execute(safeStatement);
        } catch (error) {
          // Ignore table already exists errors
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }
    }
    console.log('Schema created successfully!');// Clear existing data (now tables exist) - ONLY if starting fresh
    console.log('Checking existing data...');
    const existingCount = await db.execute('SELECT COUNT(*) as count FROM occupation_data');
    const hasData = existingCount.rows[0].count > 0;
    
    if (hasData) {
      console.log(`Found ${existingCount.rows[0].count} existing records. Continuing migration...`);
      console.log('Tip: To start fresh, manually delete data in Turso dashboard first.');
    } else {
      console.log('No existing data found. Starting fresh migration...');
    }

    // Parse and import CSV data
    const majorGroups = new Map();
    const occupations = new Map();
    const occupationData = [];

    console.log('Reading CSV file...');
    
    // Read CSV file
    const results = [];
    fs.createReadStream('./public/data/bls-benchmarks-flat.csv')
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', async () => {
        console.log(`Processing ${results.length} rows...`);

        // Process each row
        for (const row of results) {
          // Collect major groups
          if (!majorGroups.has(row.MajorGroup)) {
            majorGroups.set(row.MajorGroup, row.MajorGroupName);
          }

          // Collect occupations
          if (!occupations.has(row.DetailedCode)) {
            occupations.set(row.DetailedCode, {
              code: row.DetailedCode,
              name: row.DetailedName,
              majorGroup: row.MajorGroup
            });
          }

          // Collect occupation data
          occupationData.push({
            occupationCode: row.DetailedCode,
            region: row.Region,
            regionName: row.RegionName,
            meanAnnual: parseInt(row.MeanAnnual) || null,
            meanHourly: parseFloat(row.MeanHourly) || null,
            medianAnnual: parseInt(row.MedianAnnual) || null,
            medianHourly: parseFloat(row.MedianHourly) || null,
            benefitAnnual: parseInt(row.BenefitAnnual) || null
          });
        }        // Insert major groups
        console.log(`Inserting ${majorGroups.size} major groups...`);
        for (const [code, name] of majorGroups) {
          await db.execute({
            sql: 'INSERT OR IGNORE INTO major_groups (code, name) VALUES (?, ?)',
            args: [code, name]
          });
        }

        // Insert occupations
        console.log(`Inserting ${occupations.size} occupations...`);
        for (const occupation of occupations.values()) {
          await db.execute({
            sql: 'INSERT OR IGNORE INTO occupations (code, name, major_group_code) VALUES (?, ?, ?)',
            args: [occupation.code, occupation.name, occupation.majorGroup]
          });
        }

        // Insert occupation data in batches
        console.log(`Inserting ${occupationData.length} occupation data records...`);
        const batchSize = 100;
        for (let i = 0; i < occupationData.length; i += batchSize) {
          const batch = occupationData.slice(i, i + batchSize);
          
          for (const data of batch) {            await db.execute({
              sql: `INSERT OR IGNORE INTO occupation_data 
                    (occupation_code, region, region_name, mean_annual, mean_hourly, median_annual, median_hourly, benefit_annual) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                data.occupationCode,
                data.region,
                data.regionName,
                data.meanAnnual,
                data.meanHourly,
                data.medianAnnual,
                data.medianHourly,
                data.benefitAnnual
              ]
            });
          }
          
          console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(occupationData.length / batchSize)}`);
        }

        console.log('Migration completed successfully!');
        console.log(`- Major groups: ${majorGroups.size}`);
        console.log(`- Occupations: ${occupations.size}`);
        console.log(`- Data records: ${occupationData.length}`);

        // Test query
        console.log('\nTesting database...');
        const testResult = await db.execute('SELECT COUNT(*) as count FROM occupation_data');
        console.log(`Total records in database: ${testResult.rows[0].count}`);

      });

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateBLSData();
