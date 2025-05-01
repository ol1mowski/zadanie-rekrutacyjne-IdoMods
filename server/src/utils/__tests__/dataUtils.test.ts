import { describe, it, expect, vi } from 'vitest';
import { hasOrderChanged, processOrderData } from '../dataUtils';

describe('Data Utils', () => {
  describe('hasOrderChanged', () => {
    it('should return true when orders have different worth', () => {
      const existingOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer'
      };
      
      const newOrder = {
        orderID: '1',
        orderWorth: 150, // Different worth
        customerName: 'Test Customer'
      };
      
      const result = hasOrderChanged(existingOrder as any, newOrder as any);
      
      expect(result).toBe(true);
    });
    
    it('should return true when orders have different customer name', () => {
      const existingOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer'
      };
      
      const newOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer Updated' // Different name
      };
      
      const result = hasOrderChanged(existingOrder as any, newOrder as any);
      
      expect(result).toBe(true);
    });
    
    it('should return true when orders have different status', () => {
      const existingOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer',
        status: 'processing'
      };
      
      const newOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer',
        status: 'completed' // Different status
      };
      
      const result = hasOrderChanged(existingOrder as any, newOrder as any);
      
      expect(result).toBe(true);
    });
    
    it('should return false when orders are identical', () => {
      const existingOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer',
        status: 'processing'
      };
      
      const newOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer',
        status: 'processing'
      };
      
      const result = hasOrderChanged(existingOrder as any, newOrder as any);
      
      expect(result).toBe(false);
    });
    
    it('should handle orders with different property sets', () => {
      const existingOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer'
        // Missing status
      };
      
      const newOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer',
        status: 'processing' // New property
      };
      
      const result = hasOrderChanged(existingOrder as any, newOrder as any);
      
      // Should detect the difference because of the new property
      expect(result).toBe(true);
    });
  });
  
  describe('processOrderData', () => {
    it('should process raw order data into proper format', () => {
      const rawOrderData = {
        id: '1',
        worth: 100,
        orderStatus: 'completed',
        customer: {
          name: 'Test Customer',
          email: 'customer@example.com'
        },
        orderDetails: {
          productsResults: [
            { name: 'Product A', price: 50, quantity: 1 },
            { name: 'Product B', price: 50, quantity: 1 }
          ]
        }
      };
      
      const result = processOrderData(rawOrderData as any);
      
      // Check that the data is processed correctly
      expect(result.orderID).toBe('1');
      expect(result.orderWorth).toBe(100);
      expect(result.status).toBe('completed');
      expect(result.customerName).toBe('Test Customer');
      expect(result.customerEmail).toBe('customer@example.com');
      expect(result.products).toHaveLength(2);
      expect(result.products[0].name).toBe('Product A');
    });
    
    it('should handle missing customer data', () => {
      const rawOrderData = {
        id: '1',
        worth: 100,
        orderStatus: 'completed'
        // Missing customer object
      };
      
      const result = processOrderData(rawOrderData);
      
      // Should still process the order without customer data
      expect(result.orderID).toBe('1');
      expect(result.orderWorth).toBe(100);
      expect(result.status).toBe('completed');
      expect(result.customerName).toBeUndefined();
    });
    
    it('should handle missing product data', () => {
      const rawOrderData = {
        id: '1',
        worth: 100,
        orderStatus: 'completed',
        customer: {
          name: 'Test Customer'
        }
        // Missing orderDetails with products
      };
      
      const result = processOrderData(rawOrderData);
      
      // Should process the order with empty products array
      expect(result.orderID).toBe('1');
      expect(result.orderWorth).toBe(100);
      expect(result.products).toEqual([]);
    });
    
    it('should handle alternative property names', () => {
      const rawOrderData = {
        orderID: '1', // Using orderID instead of id
        orderWorth: 100, // Using orderWorth instead of worth
        status: 'completed', // Using status instead of orderStatus
        customerName: 'Test Customer' // Direct property instead of nested
      };
      
      const result = processOrderData(rawOrderData);
      
      // Should handle the alternative property names
      expect(result.orderID).toBe('1');
      expect(result.orderWorth).toBe(100);
      expect(result.status).toBe('completed');
      expect(result.customerName).toBe('Test Customer');
    });
    
    it('should return null for invalid input', () => {
      const invalidData = null;
      
      // @ts-ignore - Deliberately passing null for testing
      const result = processOrderData(invalidData);
      
      expect(result).toBeNull();
    });
  });
}); 