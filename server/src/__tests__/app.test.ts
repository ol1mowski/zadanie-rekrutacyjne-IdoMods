import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

vi.mock('../services/idoSellService', () => ({
  default: {
    getOrders: vi.fn().mockResolvedValue([
      { id: '1', worth: 100 },
      { id: '2', worth: 200 }
    ])
  }
}));

vi.mock('../models/orderModel', () => ({
  default: {
    getOrders: vi.fn().mockResolvedValue([
      { id: '1', customer: 'Test Customer 1', worth: 100 },
      { id: '2', customer: 'Test Customer 2', worth: 200 }
    ]),
    getOrderById: vi.fn().mockImplementation((id: string) => {
      if (id === '1') {
        return Promise.resolve({ id: '1', customer: 'Test Customer 1', worth: 100 });
      }
      return Promise.resolve(null);
    }),
    updateOrders: vi.fn().mockResolvedValue({ added: 1, updated: 1, unchanged: 0 }),
    ordersToCSV: vi.fn().mockReturnValue('id,customer,worth\n1,Test Customer 1,100\n2,Test Customer 2,200'),
    orderToDetailedCSV: vi.fn().mockReturnValue('id,customer,worth\n1,Test Customer 1,100')
  }
}));

vi.mock('../schedulers/orderScheduler', () => ({
  default: {
    initialize: vi.fn()
  }
}));

describe('API Integration Tests', () => {
  const authHeader = 'Basic ' + Buffer.from('admin:password123').toString('base64');
  
  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/api/orders');
      expect(response.status).toBe(401);
    });
    
    it('should return 401 for invalid credentials', async () => {
      const wrongAuthHeader = 'Basic ' + Buffer.from('wrong:wrong').toString('base64');
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', wrongAuthHeader);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('Orders API', () => {
    it('should return list of orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', authHeader);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });
    
    it('should return order by ID', async () => {
      const response = await request(app)
        .get('/api/orders/1')
        .set('Authorization', authHeader);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
    });
    
    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/999')
        .set('Authorization', authHeader);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
    
    it('should return CSV file with orders', async () => {
      const response = await request(app)
        .get('/api/orders/csv')
        .set('Authorization', authHeader);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/csv/);
      expect(response.headers['content-disposition']).toMatch(/attachment; filename=orders.csv/);
    });
    
    it('should refresh orders', async () => {
      const response = await request(app)
        .post('/api/orders/refresh')
        .set('Authorization', authHeader);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
    });
  });
  
  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .set('Authorization', authHeader);
      
      expect(response.status).toBe(404);
    });
  });
}); 