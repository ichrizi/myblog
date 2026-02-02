const http = require('http');

// Test helper
const makeRequest = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// Tests
const runTests = async () => {
  console.log('\n===== Testing Error Handling & Logging =====\n');

  try {
    // Test 1: Health check
    console.log('Test 1: Health Check');
    const health = await makeRequest('GET', '/');
    console.log(`Status: ${health.status}`);
    console.log(`Response: ${health.body}\n`);

    // Test 2: Invalid route (should 404)
    console.log('Test 2: Invalid Route (404 Expected)');
    const notFound = await makeRequest('GET', '/invalid-route');
    console.log(`Status: ${notFound.status}`);
    console.log(`Response:`, notFound.body, '\n');

    // Test 3: Register with missing fields
    console.log('Test 3: Register with Missing Fields');
    const missingFields = await makeRequest('POST', '/api/auth/register', {
      email: 'test@example.com'
      // missing username and password
    });
    console.log(`Status: ${missingFields.status}`);
    console.log(`Response:`, missingFields.body, '\n');

    // Test 4: Register with invalid email
    console.log('Test 4: Register with Invalid Email');
    const invalidEmail = await makeRequest('POST', '/api/auth/register', {
      username: 'testuser',
      email: 'not-an-email',
      password: 'Password123'
    });
    console.log(`Status: ${invalidEmail.status}`);
    console.log(`Response:`, invalidEmail.body, '\n');

    // Test 5: Register valid user
    console.log('Test 5: Register Valid User');
    const register = await makeRequest('POST', '/api/auth/register', {
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: 'TestPassword123'
    });
    console.log(`Status: ${register.status}`);
    console.log(`Response:`, register.body, '\n');

    // Test 6: Login with wrong password
    console.log('Test 6: Login with Wrong Password');
    const wrongPassword = await makeRequest('POST', '/api/auth/login', {
      email: 'testuser1@example.com',
      password: 'WrongPassword'
    });
    console.log(`Status: ${wrongPassword.status}`);
    console.log(`Response:`, wrongPassword.body, '\n');

    // Test 7: Login successful
    console.log('Test 7: Login Successful');
    const login = await makeRequest('POST', '/api/auth/login', {
      email: 'testuser1@example.com',
      password: 'TestPassword123'
    });
    console.log(`Status: ${login.status}`);
    console.log(`Response:`, login.body, '\n');

    // Test 8: Get all posts
    console.log('Test 8: Get All Posts');
    const posts = await makeRequest('GET', '/api/blog');
    console.log(`Status: ${posts.status}`);
    console.log(`Response (first 2):`, posts.body.slice(0, 2), '\n');

    // Test 9: Get invalid post ID
    console.log('Test 9: Get Invalid Post ID');
    const invalidPost = await makeRequest('GET', '/api/blog/invalid-id');
    console.log(`Status: ${invalidPost.status}`);
    console.log(`Response:`, invalidPost.body, '\n');

    console.log('✅ All tests completed!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during tests:', err);
    process.exit(1);
  }
};

// Wait for server to be ready
setTimeout(runTests, 2000);
