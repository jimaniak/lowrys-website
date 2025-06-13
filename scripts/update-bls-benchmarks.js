// scripts/update-bls-benchmarks.js
// Weekly automation: Download and update BLS hierarchical benchmarks for the rate calculator
// Place this file in the scripts/ directory. Run with: node scripts/update-bls-benchmarks.js


const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load .env.local (if present)
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const BLS_URL = process.env.BLS_URL;
if (!BLS_URL) {
  console.error('BLS_URL is not set in .env.local');
  process.exit(1);
}

async function updateBLS() {
  try {
    console.log('Fetching latest BLS hierarchical data...');
    const res = await fetch(BLS_URL);
    if (!res.ok) throw new Error('Failed to fetch BLS data: ' + res.status);
    const blsRaw = await res.json();

    // Optionally, transform the data to your hierarchical format here
    // For now, we assume the downloaded file is already in the correct format
    // If you need to transform, replace the next line with your logic
    const hierarchical = blsRaw;

    // Write to public/data/bls-benchmarks-hierarchical.json
    const outPath = path.join(__dirname, '../public/data/bls-benchmarks-hierarchical.json');
    fs.writeFileSync(outPath, JSON.stringify(hierarchical, null, 2));
    console.log('BLS benchmarks updated:', outPath);
  } catch (err) {
    console.error('BLS update failed:', err);
    process.exit(1);
  }
}

updateBLS();
