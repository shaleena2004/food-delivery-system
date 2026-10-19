const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5001';

describe('BiteFlow Auth Service - Automated API Test Suite', () => {
  let adminToken = '';
  let customerToken = '';
  let customerUser = null;
  const testRunId = Math.floor(Math.random() * 1000000);
  const testCustomerEmail = `test_customer_${testRunId}@biteflow.com`;
  const testCustomerPassword = 'SecurePassword123!';

  // Step 1: Health Check
  it('GET /health - should return service health status 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'UP');
    assert.equal(data.service, 'auth-service');
  });

  // Step 2: Public Registration - Customer Role
  it('POST /api/auth/register - should successfully register a new customer', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Automated Test Customer ${testRunId}`,
        email: testCustomerEmail,
        password: testCustomerPassword,
        role: 'CUSTOMER',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.data.token, 'Should return a JWT auth token');
    assert.equal(body.data.user.email, testCustomerEmail);
    assert.equal(body.data.user.role, 'CUSTOMER');
    customerToken = body.data.token;
    customerUser = body.data.user;
  });

  // Step 3: Public Registration - Validation Failure
  it('POST /api/auth/register - should return 400 Bad Request when fields are missing', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Incomplete User',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('required'));
  });

  // Step 4: Role Guard - Block Non-Customer Public Registration
  it('POST /api/auth/register - should return 403 Forbidden when attempting to register as RESTAURANT_ADMIN', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious Restaurant Admin',
        email: `hacker_owner_${testRunId}@biteflow.com`,
        password: 'Password123!',
        role: 'RESTAURANT_ADMIN',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.ok(body.message.includes('Public registration is only available for Customers'));
  });

  it('POST /api/auth/register - should return 403 Forbidden when attempting to register as DELIVERY_PERSON', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious Rider',
        email: `hacker_rider_${testRunId}@biteflow.com`,
        password: 'Password123!',
        role: 'DELIVERY_PERSON',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.ok(body.message.includes('Public registration is only available for Customers'));
  });

  // Step 5: User Login
  it('POST /api/auth/login - should authenticate valid user credentials and return JWT token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: testCustomerPassword,
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.token, 'Should return JWT token');
    assert.equal(body.data.user.email, testCustomerEmail);
  });

  it('POST /api/auth/login - should reject invalid password with 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: 'WrongPassword999!',
      }),
    });

    assert.equal(res.status, 401);
  });

  // Step 6: Authenticated Profile Endpoint
  it('GET /api/auth/me - should reject requests without token with 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    assert.equal(res.status, 401);
  });

  it('GET /api/auth/me - should return user profile when authenticated with valid token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.email, testCustomerEmail);
    assert.equal(body.data.role, 'CUSTOMER');
  });

  // Step 7: Admin Login & Authorization Guard
  it('POST /api/auth/login - should authenticate System Administrator', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@biteflow.com',
        password: 'Admin123!',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.user.role, 'ADMIN');
    adminToken = body.data.token;
  });

  it('GET /api/auth/users - should reject non-admin users with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    assert.equal(res.status, 403);
  });

  it('GET /api/auth/users - should allow System Administrator to list all registered users', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data), 'Should return array of users');
    assert.ok(body.data.length > 0, 'Users array should not be empty');
  });

  // Step 8: Admin User Provisioning
  let provisionedRiderId = '';
  const provisionedRiderEmail = `automated_rider_${testRunId}@biteflow.com`;

  it('POST /api/auth/users - should allow admin to provision new Rider account', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Automated Rider ${testRunId}`,
        email: provisionedRiderEmail,
        password: 'InitialPassword123!',
        role: 'DELIVERY_PERSON',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.data.email, provisionedRiderEmail);
    assert.equal(body.data.role, 'DELIVERY_PERSON');
    assert.equal(body.data.status, 'ACTIVE');
    provisionedRiderId = body.data.id || body.data._id;
  });

  // Step 9: Admin Account Activation / Deactivation
  it('PATCH /api/auth/users/:id/status - should toggle user status between ACTIVE and INACTIVE', async () => {
    // Deactivate
    const deactRes = await fetch(`${BASE_URL}/api/auth/users/${provisionedRiderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'INACTIVE' }),
    });

    assert.equal(deactRes.status, 200);
    const deactBody = await deactRes.json();
    assert.equal(deactBody.data.status, 'INACTIVE');

    // Reactivate
    const actRes = await fetch(`${BASE_URL}/api/auth/users/${provisionedRiderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });

    assert.equal(actRes.status, 200);
    const actBody = await actRes.json();
    assert.equal(actBody.data.status, 'ACTIVE');
  });

  // Step 10: Forgot Password / Password Reset
  it('POST /api/auth/reset-password - should reset password and permit login with new password', async () => {
    const newPassword = 'BrandNewPassword789!';

    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: provisionedRiderEmail,
        newPassword,
      }),
    });

    assert.equal(resetRes.status, 200);
    const resetBody = await resetRes.json();
    assert.ok(resetBody.message.includes('successfully'));

    // Verify login with new password
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: provisionedRiderEmail,
        password: newPassword,
      }),
    });

    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.ok(loginBody.data.token, 'Should log in successfully with new password');
  });
});
