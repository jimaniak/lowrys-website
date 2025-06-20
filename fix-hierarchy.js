const { createClient } = require('@libsql/client');
const fs = require('fs');
const csv = require('csv-parser');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Missing Turso credentials in .env.local. Please ensure the file exists and contains TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
  process.exit(1);
}

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const userMappedHierarchy = [];

fs.createReadStream('user-mapped-hierarchy.csv')
    .pipe(csv())
    .on('data', (data) => {
        const cleanedData = {};
        for (const key in data) {
            cleanedData[key.trim()] = data[key];
        }
        userMappedHierarchy.push(cleanedData);
    })
    .on('end', async () => {
        console.log('CSV file successfully processed. Starting database updates...');
        await fixHierarchy();
    });

async function fixHierarchy() {
    let updated = 0;
    let notFound = 0;
    for (const userRow of userMappedHierarchy) {
        const code = userRow.code;
        if (!code) continue;
        const parent_code = userRow.parent_code || null;
        const occupation_type = userRow.occupation_type || null;
        try {
            // Check if the occupation exists
            const rs = await db.execute('SELECT code FROM occupations WHERE code = ?', [code]);
            if (rs.rows.length === 0) {
                console.log(`Occupation code ${code} not found in database.`);
                notFound++;
                continue;
            }
            // Update parent_code and occupation_type
            await db.execute(
                'UPDATE occupations SET parent_code = ?, occupation_type = ? WHERE code = ?',
                [parent_code, occupation_type, code]
            );
            updated++;
        } catch (err) {
            console.error(`Error updating code ${code}:`, err.message);
        }
    }
    console.log(`\nUpdate complete. ${updated} records updated. ${notFound} codes from CSV not found in the database.`);
}
