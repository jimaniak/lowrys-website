// scripts/flatten-bls.js
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '../public/data/bls-benchmarks-hierarchical.json');
const output = path.join(__dirname, '../public/data/bls-benchmarks-flat.csv');

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const refreshDate = Object.keys(data)[0];
const rows = [];
const header = [
  'MajorGroup', 'MajorGroupName', 'DetailedCode', 'DetailedName', 'Region', 'RegionName',
  'MeanAnnual', 'MeanHourly', 'MedianAnnual', 'MedianHourly', 'BenefitAnnual'
];
rows.push(header.join(','));

for (const [majorCode, majorVal] of Object.entries(data[refreshDate])) {
  for (const minor of Object.values(majorVal.minor_groups)) {
    for (const broad of Object.values(minor.broad_occupations)) {
      for (const [dCode, dVal] of Object.entries(broad.detailed_occupations)) {
        for (const [region, regionVal] of Object.entries(dVal.regions)) {
          rows.push([
            majorCode,
            `"${majorVal.name}"`,
            dCode,
            `"${dVal.name}"`,
            region,
            `"${regionVal.AREA_TITLE}"`,
            regionVal.wage.mean_annual,
            regionVal.wage.mean_hourly,
            regionVal.wage.median_annual,
            regionVal.wage.median_hourly,
            regionVal.benefits.avg_annual
          ].join(','));
        }
      }
    }
  }
}

fs.writeFileSync(output, rows.join('\n'));
console.log('CSV written to', output);
