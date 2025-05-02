import { test, expect } from '@playwright/test';
import { getAuthHeaders } from './setup';

test.describe('API Export', () => {
  test('should return a CSV file with order list', async ({ request }) => {
    const response = await request.get('/api/orders/csv', {
      headers: getAuthHeaders()
    });

    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/csv');
    
    const disposition = response.headers()['content-disposition'];
    expect(disposition).toContain('attachment');
    expect(disposition).toContain('filename=');
    
    const content = await response.text();
    expect(content).toBeTruthy();
    expect(content.split('\n').length).toBeGreaterThan(1);
  });

  test('should return a CSV file for a specific order', async ({ request }) => {
    const ordersResponse = await request.get('/api/orders', {
      headers: getAuthHeaders()
    });
    
    expect(ordersResponse.status()).toBe(200);
    const orders = await ordersResponse.json();
    
    if (orders.data.length > 0) {
      const orderID = orders.data[0].orderID;
      
      const response = await request.get(`/api/orders/${orderID}/csv`, {
        headers: getAuthHeaders()
      });
      
      expect(response.status()).toBe(200);
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/csv');
      
      const disposition = response.headers()['content-disposition'];
      expect(disposition).toContain('attachment');
      expect(disposition).toContain(`filename=order-${orderID}`);
      
      const content = await response.text();
      expect(content).toBeTruthy();
      expect(content.split('\n').length).toBeGreaterThan(1);
    }
  });
}); 