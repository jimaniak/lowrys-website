# BLS Data Automation with Turso

This document explains how to set up and use the enhanced BLS data automation that writes directly to your Turso database.

## Overview

We now have **two approaches** for BLS data automation:

1. **Original**: Downloads BLS data → Saves to GitHub → Creates PR
2. **Enhanced**: Downloads BLS data → Writes directly to Turso database

## Available Scripts

### Local Development
```bash
# One-time migration of existing data to Turso
npm run migrate-turso

# Download fresh BLS data and update Turso (new!)
npm run update-bls-turso

# Original: Update static files only
npm run update-bls
```

### GitHub Actions

#### Original Workflow (`.github/workflows/update-bls.yml`)
- Runs weekly (Sunday midnight UTC)
- Updates static JSON files
- Creates PR with changes

#### Enhanced Workflow (`.github/workflows/update-bls-turso.yml`)
- Runs weekly (Sunday midnight UTC)
- Can update both Turso database AND static files
- Manual trigger with options to choose what to update

## Setup Instructions

### 1. Add Turso Secrets to GitHub (for automation)

In your GitHub repository settings → Secrets and variables → Actions:

```
TURSO_DATABASE_URL = libsql://lowrys-bls-data-jimaniak.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN = eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

### 2. Choose Your Automation Strategy

#### Option A: Hybrid (Recommended)
- Keep both workflows active
- Turso gets real-time updates
- Static files provide backup/versioning
- Your apps primarily use Turso for speed

#### Option B: Turso-First
- Disable the original workflow
- Only use the enhanced Turso workflow
- Faster, more efficient, no PR overhead

### 3. Update Your Application Code

Once Turso is populated, update your analytics tools to use the database instead of static files.

## Benefits of Direct Turso Updates

### Performance
- **Faster queries**: No need to load entire JSON files
- **Scalable**: Performance stays consistent as data grows
- **Real-time**: Updates are immediately available

### Flexibility
- **Complex filtering**: SQL WHERE clauses instead of JavaScript filters
- **Aggregations**: GROUP BY, COUNT, AVG, etc.
- **Relationships**: JOIN operations between tables

### Reliability
- **Consistent**: Database ensures data integrity
- **Concurrent**: Multiple users can query simultaneously
- **Indexed**: Fast lookups on occupation codes, regions, etc.

## Example: Rate Calculator Enhancement

### Before (Static Files)
```javascript
// Load entire 50MB+ JSON file
const data = await fetch('/data/bls-benchmarks-hierarchical.json');
const json = await data.json();

// Filter in JavaScript (slow)
const filtered = json.occupations.filter(occ => 
  occ.code.startsWith('15-') && occ.region === 'CA'
);
```

### After (Turso Database)
```javascript
// Fast, indexed query
const results = await db.execute({
  sql: `SELECT o.name, od.mean_annual, od.median_annual 
        FROM occupations o 
        JOIN occupation_data od ON o.code = od.occupation_code 
        WHERE o.code LIKE '15-%' AND od.region = 'CA'`,
  args: []
});
```

## Monitoring & Troubleshooting

### Check Database Status
```bash
# Verify data was imported
node -e "
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
db.execute('SELECT COUNT(*) as count FROM occupation_data').then(r => 
  console.log('Records:', r.rows[0].count)
);
"
```

### GitHub Actions Logs
- Check the Actions tab in your repository
- Look for the "Update Turso database" step
- Verify completion and record counts

### Turso Dashboard
- Visit https://app.turso.tech
- Check your database metrics
- Monitor query performance

## Migration Path

1. ✅ **Current**: Static files working
2. ✅ **Step 1**: Turso database set up and populated
3. 🔄 **Step 2**: Update applications to use Turso (in progress)
4. ⏳ **Step 3**: Enhanced automation deployed
5. ⏳ **Step 4**: Consider deprecating static files (optional)

## Next Steps

1. Test the enhanced automation locally
2. Add GitHub secrets for the workflow
3. Update your Rate Calculator to use Turso
4. Deploy the enhanced automation
5. Monitor performance improvements

The enhanced automation gives you the best of both worlds: real-time database updates with the reliability of your existing static file backup system.
