const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.TEST_RESTAURANT_API_URL || 'http://localhost:5002';
const AUTH_URL = process.env.TEST_AUTH_API_URL || 'http://localhost:5001';

describe('BiteFlow Restaurant Service - Automated API Test Suite', () => {
  let adminToken = '';
  let createdRestaurantId = '';
  const testRunId = Math.floor(Math.random() * 1000000);

  it('GET /health - should return 200 OK with UP status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'UP');
    assert.equal(data.service, 'restaurant-service');
  });

  it('GET /api/restaurants - should return all available restaurants', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data), 'Expected restaurants array');
  });

  it('POST /api/restaurants - should reject unauthenticated creation with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauthorized Bistro' }),
    });
    assert.equal(res.status, 401);
  });

  it('POST /api/restaurants - should allow Admin to create a new restaurant', async () => {
    // Authenticate Admin via auth-service
    const loginRes = await fetch(`${AUTH_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@biteflow.com', password: 'Admin123!' }),
    });
    const loginBody = await loginRes.json();
    adminToken = loginBody.data.token;

    const res = await fetch(`${BASE_URL}/api/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Test Pizzeria ${testRunId}`,
        cuisineType: 'Italian',
        address: '100 Broadway, NY',
        contactNumber: '+1 555-0199',
        description: 'Authentic stone oven baked pizzas',
        openingTime: '10:00 AM',
        closingTime: '11:00 PM',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.data.name, `Test Pizzeria ${testRunId}`);
    createdRestaurantId = body.data._id || body.data.id;
  });

  it('GET /api/restaurants/:id - should retrieve restaurant by ID', async () => {
    assert.ok(createdRestaurantId, 'Must have a created restaurant ID');
    const res = await fetch(`${BASE_URL}/api/restaurants/${createdRestaurantId}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data._id || body.data.id, createdRestaurantId);
  });

  it('PUT /api/restaurants/:id - should update restaurant details', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants/${createdRestaurantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: 'Updated description: Best hand-tossed artisan pizzas in town',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.description.includes('artisan pizzas'));
  });

  it('DELETE /api/restaurants/:id - should remove restaurant', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants/${createdRestaurantId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.equal(res.status, 200);
  });
});
