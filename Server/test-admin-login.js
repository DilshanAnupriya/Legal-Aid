// Admin Login Test
// This file demonstrates how to test the admin login functionality

const adminLoginTest = {
  // Test data for admin login
  loginData: {
    username: 'admin',
    password: 'admin'
  },

  // Expected response format
  expectedResponse: {
    success: true,
    message: 'Admin login successful',
    token: 'JWT_TOKEN_HERE',
    admin: {
      id: 'ADMIN_ID',
      email: 'admin@legalaid.com',
      role: 'admin',
      adminName: 'System Administrator',
      permissions: ['manage_users', 'manage_content', 'view_analytics'],
      status: 'active'
    },
    loginTime: 'ISO_TIMESTAMP'
  },

  // Test using curl command (run in terminal)
  curlCommand: `
curl -X POST http://localhost:3000/api/admin/login \\
-H "Content-Type: application/json" \\
-d '{"username": "admin", "password": "admin"}'
  `,

  // Test using fetch (JavaScript)
  fetchExample: `
const response = await fetch('http://localhost:3000/api/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin'
  })
});

const data = await response.json();
console.log('Admin login response:', data);

// If login successful, use token for protected routes
if (data.success) {
  const profileResponse = await fetch('http://localhost:3000/api/admin/profile', {
    headers: {
      'Authorization': 'Bearer ' + data.token
    }
  });
  
  const profile = await profileResponse.json();
  console.log('Admin profile:', profile);
}
  `,

  // Admin API endpoints
  endpoints: {
    login: 'POST /api/admin/login',
    profile: 'GET /api/admin/profile (requires admin token)',
    users: 'GET /api/admin/users (requires admin token)',
    updateUserStatus: 'PUT /api/admin/users/:id/status (requires admin token)',
    deleteUser: 'DELETE /api/admin/users/:id (requires admin token)',
    stats: 'GET /api/admin/stats (requires admin token)'
  }
};

module.exports = adminLoginTest;

// Instructions for testing:
// 1. Start the server: npm start or node server.js
// 2. Use the curl command above or create a frontend form with username: 'admin' and password: 'admin'
// 3. On successful login, you'll receive a JWT token
// 4. Use this token in the Authorization header for protected admin routes
// 5. The admin user will be automatically created in the database on first login