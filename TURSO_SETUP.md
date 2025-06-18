# Turso Setup for BLS Data

## Step 1: Install Turso CLI and Dependencies

```bash
# Install Turso CLI
npm install -g @libsql/turso-cli

# Install Turso client for Next.js
npm install @libsql/client dotenv
```

## Step 2: Create Turso Account and Database

```bash
# Login to Turso (will open browser)
turso auth login

# Create database
turso db create lowrys-bls-data

# Get database URL and auth token
turso db show lowrys-bls-data
turso db tokens create lowrys-bls-data
```

## Step 3: Add to .env.local

```env
TURSO_DATABASE_URL=libsql://your-database-url
TURSO_AUTH_TOKEN=your-auth-token
```

## Step 4: Database Schema

The schema file is in `db/schema.sql` - run this to create tables:

```bash
turso db shell lowrys-bls-data < db/schema.sql
```

## Step 5: Data Migration

Use the script in `scripts/migrate-to-turso.js` to import your CSV data:

```bash
node scripts/migrate-to-turso.js
```
