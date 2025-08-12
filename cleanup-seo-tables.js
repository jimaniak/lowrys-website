ohosconst { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function removeSEOTables() {
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // SEO tables that should be removed from lowrys-website database
    const seoTablesToRemove = [
        'accounts',
        'ai_optimizations',
        'payments',
        'seo_intake_forms',
        'seo_reports',
        'subscriptions',
        'users',
        'website_analytics',
        'website_credentials'
    ];

    try {
        console.log('🧹 Removing SEO tables from lowrys-website database...');
        
        for (const tableName of seoTablesToRemove) {
            try {
                await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
                console.log(`  ✅ Removed table: ${tableName}`);
            } catch (error) {
                console.log(`  ❌ Error removing ${tableName}: ${error.message}`);
            }
        }
        
        console.log('\n🔍 Verifying remaining tables...');
        const result = await db.execute('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name');
        
        console.log('\n📋 Remaining tables:');
        result.rows.forEach(row => {
            console.log(`  - ${row.name}`);
        });
        
        console.log(`\n✅ Cleanup complete! Total remaining tables: ${result.rows.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.close();
    }
}

removeSEOTables();
