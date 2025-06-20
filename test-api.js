// Test the API endpoint directly
async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the search endpoint
    const searchResponse = await fetch('http://localhost:3000/api/rate-calculator?action=search-occupations&search=account');
    console.log('Search response status:', searchResponse.status);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('Search results:', searchData);
    } else {
      const errorData = await searchResponse.text();
      console.log('Search error:', errorData);
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
