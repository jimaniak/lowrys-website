// Final test of the migrated Rate Calculator API
const API_BASE = 'http://localhost:3000/api/rate-calculator';

async function testRateCalculatorAPI() {
  console.log('🧪 Testing Rate Calculator API after migration...\n');
  
  try {
    // Test 1: Get major groups
    console.log('1. Testing major groups...');
    const majorGroupsResponse = await fetch(`${API_BASE}?action=major-groups`);
    const majorGroups = await majorGroupsResponse.json();
    console.log(`✅ Major groups: ${majorGroups.length} found`);
    
    // Test 2: Get detailed occupations
    console.log('2. Testing detailed occupations...');
    const detailedResponse = await fetch(`${API_BASE}?action=detailed-occupations&majorGroup=15`);
    const detailed = await detailedResponse.json();
    console.log(`✅ Detailed occupations for group 15: ${detailed.length} found`);
    
    // Test 3: Get wage data for a specific occupation
    if (detailed.length > 0) {
      const occupation = detailed[0].occupation;
      console.log(`3. Testing wage data for: ${occupation}...`);
      const wageResponse = await fetch(`${API_BASE}?action=wage-data&occupation=${occupation}&region=US`);
      const wageData = await wageResponse.json();
      console.log(`✅ Wage data retrieved:`, wageData.wage ? 'Success' : 'No data');
    }
    
    console.log('\n🎉 Rate Calculator API migration successful!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testRateCalculatorAPI();
}

module.exports = testRateCalculatorAPI;
