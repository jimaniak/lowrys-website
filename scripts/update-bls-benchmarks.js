// Map of state names to postal codes
const STATE_NAME_TO_CODE = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'District of Columbia': 'DC',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL',
  'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA',
  'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN',
  'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
  'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX',
  'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'Puerto Rico': 'PR', 'Guam': 'GU', 'Virgin Islands': 'VI',
  'Northern Mariana Islands': 'MP', 'American Samoa': 'AS'
};
// scripts/update-bls-benchmarks.js
// Weekly automation: Download and update BLS hierarchical benchmarks for the rate calculator
// Place this file in the scripts/ directory. Run with: node scripts/update-bls-benchmarks.js


const fs = require('fs');
const path = require('path');
// Use global fetch (Node.js 18+)
const unzipper = require('unzipper');
const xlsx = require('xlsx');


// BLS OEWS National and State data (update year as needed)
const BLS_OEWS_NAT_ZIP_URL = 'https://www.bls.gov/oes/special.requests/oesm23nat.zip';
const BLS_OEWS_STATE_ZIP_URL = 'https://www.bls.gov/oes/special.requests/oesm23st.zip';
const XLSX_NAT_FILENAME = 'oesm23nat/national_M2023_dl.xlsx';
const XLSX_STATE_FILENAME = 'oesm23st/state_M2023_dl.xlsx';


async function downloadAndExtractXLSX(url, filename) {
  console.log('Downloading BLS OEWS ZIP:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download BLS OEWS ZIP: ' + res.status);
  const buffer = Buffer.from(await res.arrayBuffer());
  // Extract XLSX from ZIP
  const directory = await unzipper.Open.buffer(buffer);
  console.log('Files in ZIP:', directory.files.map(f => f.path));
  const file = directory.files.find(f => f.path === filename);
  if (!file) throw new Error('XLSX file not found in ZIP: ' + filename);
  const xlsxBuffer = await file.buffer();
  return xlsxBuffer;
}

function buildHierarchy(records) {
  // Build a deeply nested object: major -> minor -> broad -> detailed -> regions
  const hierarchy = {};
  // Helper: get or create nested object
  function getOrCreate(obj, key, def) {
    if (!obj[key]) obj[key] = def;
    return obj[key];
  }
  for (const rec of records) {
    const occCode = rec['OCC_CODE'];
    if (!occCode || occCode === '00-0000') continue;

    // BLS hierarchy: major (xx-0000), minor (xx-xxxx where last 3 are 000), broad (xx-xxxx0), detailed (xx-xxxx)
    const majorCode = occCode.slice(0, 2) + '-0000';
    const minorCode = occCode.slice(0, 5) + '0';
    // If minor is same as major, skip (not a real minor group)
    const isMinor = occCode !== majorCode && occCode.endsWith('0');
    const isBroad = occCode !== majorCode && !occCode.endsWith('0');

    // Get names from records or fallback
    const majorName = records.find(r => r['OCC_CODE'] === majorCode)?.OCC_TITLE || 'Other';
    // Try to find a record for the minor group code, otherwise use the first occupation under this minor group
    let minorName = records.find(r => r['OCC_CODE'] === minorCode)?.OCC_TITLE;
    if (!minorName) {
      // Use: "Other [major group name] occupations"
      minorName = `Other ${majorName} occupations`;
    }
    const broadName = rec['OCC_TITLE'];

    // Major group
    const major = getOrCreate(hierarchy, majorCode, { name: majorName, minor_groups: {} });

    // Minor group (only if not same as major)
    let minor;
    if (isMinor) {
      minor = getOrCreate(major.minor_groups, minorCode, { name: minorName, broad_occupations: {} });
    } else {
      // If not a real minor, use a fallback with a unique name
      minor = getOrCreate(major.minor_groups, 'Other', { name: `Other minor group for ${majorName}`, broad_occupations: {} });
    }

    // Broad occupation (if not a group code)
    let broad;
    if (isBroad) {
      broad = getOrCreate(minor.broad_occupations, occCode, { name: broadName, detailed_occupations: {} });
    } else {
      broad = getOrCreate(minor.broad_occupations, 'Other', { name: 'Other', detailed_occupations: {} });
    }

    // Detailed occupation (always use occCode)
    const detailed = getOrCreate(broad.detailed_occupations, occCode, { name: rec['OCC_TITLE'], regions: {} });

    // Region: use PRIM_STATE if present and not empty, else AREA (for US total)
    let regionCode = null;
    if (rec['PRIM_STATE'] && rec['PRIM_STATE'] !== '') {
      regionCode = rec['PRIM_STATE'];
    } else if (rec['AREA_TITLE'] === 'U.S.' || rec['AREA'] === '99') {
      regionCode = 'US';
    } else if (rec['AREA_TITLE'] && STATE_NAME_TO_CODE[rec['AREA_TITLE']]) {
      regionCode = STATE_NAME_TO_CODE[rec['AREA_TITLE']];
    } else if (rec['AREA_TITLE'] && rec['AREA_TITLE'].length === 2 && /^[A-Z]{2}$/.test(rec['AREA_TITLE'])) {
      regionCode = rec['AREA_TITLE'];
    } else {
      // If we can't determine a valid 2-letter code or US, skip this record
      return;
    }
    // Wage/benefit fields
    const wage = {
      mean_annual: rec['A_MEAN'] || null,
      mean_hourly: rec['H_MEAN'] || null,
      median_annual: rec['A_MEDIAN'] || null,
      median_hourly: rec['H_MEDIAN'] || null
    };
    const benefits = {
      avg_percent_of_wages: 31,
      avg_annual: rec['A_MEAN'] ? Math.round(rec['A_MEAN'] * 0.31) : null
    };
    detailed.regions[regionCode] = {
      wage,
      benefits,
      ...rec
    };
  }
  return hierarchy;
}

async function updateBLS() {
  try {
    // Download and extract both National and State XLSX
    const [natXLSX, stateXLSX] = await Promise.all([
      downloadAndExtractXLSX(BLS_OEWS_NAT_ZIP_URL, XLSX_NAT_FILENAME),
      downloadAndExtractXLSX(BLS_OEWS_STATE_ZIP_URL, XLSX_STATE_FILENAME)
    ]);
    // Parse both XLSX files
    const natWorkbook = xlsx.read(natXLSX, { type: 'buffer' });
    const stateWorkbook = xlsx.read(stateXLSX, { type: 'buffer' });
    // Use the first sheet from each
    const natSheetName = natWorkbook.SheetNames[0];
    const stateSheetName = stateWorkbook.SheetNames[0];
    const natRecords = xlsx.utils.sheet_to_json(natWorkbook.Sheets[natSheetName], { defval: '' });
    const stateRecords = xlsx.utils.sheet_to_json(stateWorkbook.Sheets[stateSheetName], { defval: '' });
    // Merge records
    const allRecords = [...natRecords, ...stateRecords];
    // Transform to hierarchy
    const hierarchical = buildHierarchy(allRecords);
    // Wrap in date-keyed object
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const output = { [today]: hierarchical };
    // Write to public/data/bls-benchmarks-hierarchical.json
    const outPath = path.join(__dirname, '../public/data/bls-benchmarks-hierarchical.json');
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log('BLS benchmarks updated:', outPath);
  } catch (err) {
    console.error('BLS update failed:', err);
    process.exit(1);
  }
}

updateBLS();
