import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

const username = 'admin';
const password = 'password123';
const credentials = Buffer.from(`${username}:${password}`).toString('base64');

test.describe('API Orders', () => {
  test('should return a list of orders', async ({ request }) => {
    const response = await request.get('/api/orders', {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should filter orders by minimum value', async ({ request }) => {
    const response = await request.get('/api/orders?minWorth=100', {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    
    if (body.data.length > 0) {
      body.data.forEach((order: any) => {
        expect(order.orderWorth).toBeGreaterThanOrEqual(100);
      });
    }
  });

  test('should return 401 without authentication', async ({ request }) => {
    const response = await request.get('/api/orders');
    expect(response.status()).toBe(401);
  });

  test('should return 401 with invalid credentials', async ({ request }) => {
    const response = await request.get('/api/orders', {
      headers: {
        'Authorization': 'Basic NIEPRAWIDLOWE'
      }
    });
    expect(response.status()).toBe(401);
  });

  test('should refresh orders and return success status', async ({ request }) => {
    const response = await request.post('/api/orders/refresh', {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
}); 