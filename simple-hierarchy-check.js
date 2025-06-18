const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

db.execute({
  sql: 'SELECT code, name, major_group_code FROM occupations WHERE code = ?',
  args: ['27-2011']
}).then(result => {
  console.log('Actors:', result.rows[0]);
  return db.execute({
    sql: 'SELECT code, name FROM occupations WHERE code = ?',
    args: [result.rows[0].major_group_code]
  });
}).then(majorResult => {
  console.log('Major group:', majorResult.rows[0]);
  process.exit(0);
}).catch(console.error);
