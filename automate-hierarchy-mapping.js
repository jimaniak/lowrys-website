const fs = require('fs');
const csv = require('csv-parser');

// Helper functions for code classification
function isTop(code) {
    return code === '00-0000';
}
function isMajor(code, occupation_type) {
    return occupation_type === 'Summary' && code.endsWith('0000') && code.slice(0,2) !== '00';
}
function isBroad(code, occupation_type) {
    return occupation_type === 'Summary' && code[3] !== '0' && code.slice(-2) === '00';
}
function isMinor(code, occupation_type) {
    return occupation_type === 'Summary' && code[3] !== '0' && code.slice(-3) === '000';
}
function isDetailed(code, occupation_type) {
    return occupation_type === 'Summary' && code[6] !== '0';
}

// Read BLS data (replace with your actual BLS data file)
const inputFile = 'user-mapped-hierarchy.csv';
const outputFile = 'automated-hierarchy-output.csv';

const allRows = [];
fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (row) => {
        allRows.push(row);
    })
    .on('end', () => {
        // Build lookup maps
        const summaryMap = {};
        const majorMap = {};
        const broadMap = {};
        const minorMap = {};
        const detailedMap = {};
        const lineItems = [];
        allRows.forEach(row => {
            const code = row.code;
            const occupation_type = row.occupation_type;
            if (isTop(code)) summaryMap[code] = row;
            else if (isMajor(code, occupation_type)) majorMap[code] = row;
            else if (isBroad(code, occupation_type)) broadMap[code] = row;
            else if (isMinor(code, occupation_type)) minorMap[code] = row;
            else if (isDetailed(code, occupation_type)) detailedMap[code] = row;
            else lineItems.push(row);
        });

        // Assign parent codes
        allRows.forEach(row => {
            const code = row.code;
            let parent = '';
            if (isTop(code)) parent = '';
            else if (isMajor(code, row.occupation_type)) parent = '00-0000';
            else if (isBroad(code, row.occupation_type) || isMinor(code, row.occupation_type)) parent = code.slice(0,3) + '0000';
            else if (isDetailed(code, row.occupation_type)) {
                // Try to find matching Broad code
                const broadKey = code.slice(0,6) + '00';
                if (broadMap[broadKey]) parent = broadKey;
                else parent = code.slice(0,4) + '000';
            } else {
                // Line item logic
                // 1st: match first 6 chars to Detailed
                const detailedKey = code.slice(0,6);
                if (detailedMap[detailedKey]) parent = detailedKey;
                // 2nd: match first 4 chars to Minor
                else if (minorMap[code.slice(0,4) + '000']) parent = code.slice(0,4) + '000';
                // 3rd: match first 5 chars to Broad
                else if (broadMap[code.slice(0,5) + '00']) parent = code.slice(0,5) + '00';
                else parent = 'REVIEW';
            }
            row.parent_code = parent;
        });

        // Write output
        const headers = Object.keys(allRows[0]);
        const csvRows = [headers.join(',')];
        allRows.forEach(row => {
            csvRows.push(headers.map(h => row[h]).join(','));
        });
        fs.writeFileSync(outputFile, csvRows.join('\n'));
        console.log(`Automated hierarchy mapping complete. Output written to ${outputFile}`);
    });
