// Simple script to test what's happening
async function testDashboard() {
  console.log('=== Testing Dashboard Loading Issue ===\n');

  // Test 1: Check if page loads
  console.log('1. Testing dashboard page...');
  try {
    const response = await fetch('http://localhost:3002/dashboard');
    console.log('   Status:', response.status);
    const html = await response.text();
    console.log('   HTML length:', html.length);
    console.log('   Contains "Tasks":', html.includes('Tasks'));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 2: Check auth token endpoint
  console.log('\n2. Testing /api/auth/token...');
  try {
    const response = await fetch('http://localhost:3002/api/auth/token', {
      credentials: 'include'
    });
    console.log('   Status:', response.status);
    const data = await response.json();
    console.log('   Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 3: Check backend
  console.log('\n3. Testing backend...');
  try {
    const response = await fetch('http://localhost:8000/');
    console.log('   Status:', response.status);
    const data = await response.json();
    console.log('   Backend name:', data.name);
  } catch (error) {
    console.log('   Error:', error.message);
  }

  console.log('\n=== Tests Complete ===');
}

testDashboard().catch(console.error);
