// Smart BLS File Discovery
// Automatically finds the latest available BLS OEWS files
const https = require('https');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function discoverBLSFiles() {
  console.log('🔍 Discovering available BLS OEWS files...\n');
  
  try {
    // Check the BLS special requests directory
    const directoryUrl = 'https://www.bls.gov/oes/special.requests/';
    console.log(`📂 Checking directory: ${directoryUrl}`);
    
    // For now, let's test with the known 2023 files since you confirmed they download
    const testUrls = [
      'https://www.bls.gov/oes/special.requests/oesm23nat.zip',
      'https://www.bls.gov/oes/special.requests/oesm23st.zip'
    ];
    
    for (const url of testUrls) {
      console.log(`\n🧪 Testing: ${url}`);
      
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Last-Modified: ${response.headers.get('last-modified')}`);
        
        if (response.ok) {
          console.log(`   ✅ Available`);
        } else {
          console.log(`   ❌ Not available`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Test downloading a small portion to check ZIP format
    console.log(`\n📥 Testing ZIP file format...`);
    const testUrl = 'https://www.bls.gov/oes/special.requests/oesm23nat.zip';
    
    try {
      const response = await fetch(testUrl);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`   Downloaded: ${buffer.length} bytes`);
        
        // Check ZIP file signature (first 4 bytes should be PK\x03\x04 or PK\x05\x06)
        const signature = buffer.slice(0, 4);
        const isValidZip = signature[0] === 0x50 && signature[1] === 0x4B;
        
        console.log(`   ZIP signature: ${signature.toString('hex')} (${isValidZip ? 'valid' : 'invalid'})`);
        console.log(`   First 16 bytes: ${buffer.slice(0, 16).toString('hex')}`);
        
        if (isValidZip) {
          console.log(`   ✅ Valid ZIP file format`);
        } else {
          console.log(`   ❌ Invalid ZIP file - might be HTML error page or different format`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Download test failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error);
  }
}

// Also test the unzipper library with a simple ZIP
async function testUnzipperLibrary() {
  console.log(`\n🧪 Testing unzipper library...`);
  
  try {
    const unzipper = require('unzipper');
    console.log('   ✅ unzipper library loaded successfully');
    
    // Test with the downloaded file if it exists
    const fs = require('fs');
    const testFiles = ['oesm23nat.zip', 'oesm23st.zip'];
    
    for (const filename of testFiles) {
      if (fs.existsSync(filename)) {
        console.log(`   📁 Found local file: ${filename}`);
        
        try {
          const zip = await unzipper.Open.file(filename);
          console.log(`   📋 ZIP contains ${zip.files.length} files:`);
          zip.files.forEach(file => {
            console.log(`      - ${file.path} (${file.uncompressedSize} bytes)`);
          });
        } catch (zipError) {
          console.log(`   ❌ ZIP parsing error: ${zipError.message}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`   ❌ unzipper library error: ${error.message}`);
  }
}

async function main() {
  await discoverBLSFiles();
  await testUnzipperLibrary();
}

main();
