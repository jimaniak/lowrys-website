const { createClient } = require('@libsql/client');
const fs = require('fs');
const csv = require('csv-parser');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Turso client setup
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
        // Clean up keys from CSV - they might have extra spaces or BOM characters
        const cleanedData = {};
        for (const key in data) {
            cleanedData[key.trim()] = data[key];
        }
        userMappedHierarchy.push(cleanedData);
    })
    .on('end', async () => {
        console.log('CSV file successfully processed.');
        await compareHierarchies();
    });

const output = [];

async function compareHierarchies() {
    try {
        console.log('Connecting to Turso database to fetch occupations...');
        const rs = await db.execute(`SELECT code, parent_code, occupation_type FROM occupations`);
        console.log(`Successfully fetched ${rs.rows.length} records from Turso.`);

        const dbHierarchy = {};
        rs.rows.forEach(row => {
            dbHierarchy[row.code] = {
                parent_code: row.parent_code,
                occupation_type: row.occupation_type
            };
        });

        let mismatches = 0;
        let notFound = 0;

        console.log('Comparing hierarchies...');
        userMappedHierarchy.forEach(userRow => {
            const occupationCode = userRow.code;
            if (!occupationCode) {
                // Skip empty rows in the CSV
                return;
            }
            const dbRow = dbHierarchy[occupationCode];

            if (dbRow) {
                let hasMismatch = false;
                // Normalize null/undefined to empty strings for comparison
                const dbParent = dbRow.parent_code || '';
                const userParent = userRow.parent_code || '';
                const dbType = dbRow.occupation_type || '';
                const userType = userRow.occupation_type || '';

                if (dbParent.trim() !== userParent.trim()) {
                    if (!hasMismatch) {
                        output.push(`\nMismatch for code: ${occupationCode}`);
                        hasMismatch = true;
                    }
                    output.push(`  - parent_code: DB='${dbParent}', User='${userParent}'`);
                }
                if (dbType.trim() !== userType.trim()) {
                    if (!hasMismatch) {
                        output.push(`\nMismatch for code: ${occupationCode}`);
                        hasMismatch = true;
                    }
                    output.push(`  - occupation_type: DB='${dbType}', User='${userType}'`);
                }
                if(hasMismatch) {
                    mismatches++;
                }
            } else {
                output.push(`Occupation code ${occupationCode} from CSV not found in the database.`);
                notFound++;
            }
        });

        const fs = require('fs');
        fs.writeFileSync('hierarchy-mismatches.txt', output.join('\n'));

        if (mismatches === 0 && notFound === 0) {
            console.log('\n✅ No mismatches found. The database hierarchy matches the user-mapped hierarchy.');
        } else {
            console.log(`\nFound ${mismatches} total records with mismatches and ${notFound} codes from the CSV that were not found in the database.`);
            console.log('See hierarchy-mismatches.txt for details.');
        }
    } catch (err) {
        console.error('Error comparing hierarchies:', err);
    }
}
