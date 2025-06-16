// scripts/update-bls-benchmarks.js
// Weekly automation: Download and update BLS hierarchical benchmarks for the rate calculator
// Place this file in the scripts/ directory. Run with: node scripts/update-bls-benchmarks.js


const fs = require('fs');
const path = require('path');
// Use global fetch (Node.js 18+)
const unzipper = require('unzipper');
const xlsx = require('xlsx');

// BLS OEWS National data (update year as needed)
const BLS_OEWS_ZIP_URL = 'https://www.bls.gov/oes/special.requests/oesm23nat.zip';
const XLSX_FILENAME = 'oesm23nat/national_M2023_dl.xlsx';

async function downloadAndExtractCSV(url, filename) {
  console.log('Downloading BLS OEWS ZIP:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download BLS OEWS ZIP: ' + res.status);
  const buffer = Buffer.from(await res.arrayBuffer());
  // Extract CSV from ZIP
  const directory = await unzipper.Open.buffer(buffer);
  console.log('Files in ZIP:', directory.files.map(f => f.path));
  const file = directory.files.find(f => f.path === XLSX_FILENAME);
  if (!file) throw new Error('XLSX file not found in ZIP');
  const xlsxBuffer = await file.buffer();
  return xlsxBuffer;
}

function buildHierarchy(records) {
  // Example: group by OCC_GROUP (Major Group), then by OCC_TITLE (Occupation)
  // You can refine this logic to match your app's needs
  const hierarchy = {};
  for (const rec of records) {
    const group = rec['OCC_GROUP'] || 'Other';
    if (!hierarchy[group]) hierarchy[group] = { group, occupations: [] };
    // Include all fields from the record for each occupation
    hierarchy[group].occupations.push({ ...rec });
  }
  return Object.values(hierarchy);
}

async function updateBLS() {
  try {
    // Download and extract XLSX
    const xlsxBuffer = await downloadAndExtractCSV(BLS_OEWS_ZIP_URL, XLSX_FILENAME);
    // Parse XLSX
    const workbook = xlsx.read(xlsxBuffer, { type: 'buffer' });
    // Use the first sheet
    const sheetName = workbook.SheetNames[0];
    const records = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    // Transform to hierarchy
    const hierarchical = buildHierarchy(records);
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
