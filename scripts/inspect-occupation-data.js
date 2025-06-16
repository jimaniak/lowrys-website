const xlsx = require('xlsx');
const path = require('path');

// Read the occupation.xlsx file
const occupationPath = path.join(__dirname, '../public/data/occupation.xlsx');
const workbook = xlsx.readFile(occupationPath);

console.log('Sheet names:', workbook.SheetNames);
console.log('\n');

// Check the first few rows of each sheet to see the column structure
workbook.SheetNames.forEach(sheetName => {
  console.log(`=== Sheet: ${sheetName} ===`);
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  if (data.length > 0) {
    console.log('Headers (Row 1):', data[0]);
    if (data.length > 1) {
      console.log('Sample data (Row 2):', data[1]);
    }
    console.log('Total rows:', data.length);
  } else {
    console.log('No data found');
  }
  console.log('\n');
});
