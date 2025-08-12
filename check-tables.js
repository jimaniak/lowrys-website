const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    try {
        console.log('🔍 Checking tables in lowrys-website Turso database...');
        const result = await db.execute('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name');
        
        console.log('\n📋 Current tables:');
        result.rows.forEach(row => {
            console.log(`  - ${row.name}`);
        });
        
        console.log(`\n📊 Total tables: ${result.rows.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.close();
    }
}

checkTables();
