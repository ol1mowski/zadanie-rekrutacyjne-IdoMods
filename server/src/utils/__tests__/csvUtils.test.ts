import { describe, it, expect, vi } from 'vitest';
import { ordersToCSV, orderToDetailedCSV } from '../csvUtils';
import { ProcessedOrder } from '../../types/idoSell';

describe('CSV Utils', () => {
  describe('ordersToCSV', () => {
    it('should convert orders to CSV format', () => {
      const mockOrders = [
        {
          orderID: '1',
          orderWorth: 100,
          customerName: 'Test Customer 1',
          status: 'completed',
          date: '2023-01-01'
        },
        {
          orderID: '2',
          orderWorth: 200,
          customerName: 'Test Customer 2',
          status: 'processing',
          date: '2023-01-02'
        }
      ] as unknown as ProcessedOrder[];
      
      const csv = ordersToCSV(mockOrders);
      
      // CSV should have a header and two data rows
      const lines = csv.trim().split('\n');
      expect(lines.length).toBe(3);
      
      // Check that header contains important columns
      expect(lines[0]).toContain('orderID');
      expect(lines[0]).toContain('orderWorth');
      expect(lines[0]).toContain('customerName');
      
      // Check that data rows contain the expected values
      expect(lines[1]).toContain('1');
      expect(lines[1]).toContain('100');
      expect(lines[1]).toContain('Test Customer 1');
      
      expect(lines[2]).toContain('2');
      expect(lines[2]).toContain('200');
      expect(lines[2]).toContain('Test Customer 2');
    });
    
    it('should handle empty orders array', () => {
      const csv = ordersToCSV([]);
      
      // Should still have a header row but no data rows
      const lines = csv.trim().split('\n');
      expect(lines.length).toBe(1);
      expect(lines[0]).toContain('orderID');
    });
    
    it('should handle orders with missing properties', () => {
      const mockOrders = [
        {
          orderID: '1',
          // Missing orderWorth
          customerName: 'Test Customer 1'
        }
      ] as unknown as ProcessedOrder[];
      
      const csv = ordersToCSV(mockOrders);
      
      // Should handle the missing property without throwing errors
      const lines = csv.trim().split('\n');
      expect(lines.length).toBe(2);
      expect(lines[1]).toContain('1');
      expect(lines[1]).toContain('Test Customer 1');
    });
  });
  
  describe('orderToDetailedCSV', () => {
    it('should convert a single order to detailed CSV format', () => {
      const mockOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer 1',
        status: 'completed',
        date: '2023-01-01',
        products: [
          { name: 'Product A', price: 50, quantity: 1 },
          { name: 'Product B', price: 50, quantity: 1 }
        ]
      } as unknown as ProcessedOrder;
      
      const csv = orderToDetailedCSV(mockOrder);
      
      // CSV should have a header and one data row
      const lines = csv.trim().split('\n');
      expect(lines.length).toBe(2);
      
      // Check that header contains important columns, including detailed ones
      expect(lines[0]).toContain('orderID');
      expect(lines[0]).toContain('orderWorth');
      expect(lines[0]).toContain('customerName');
      expect(lines[0]).toContain('products');
      
      // Check that data rows contain the expected values and product details
      expect(lines[1]).toContain('1');
      expect(lines[1]).toContain('100');
      expect(lines[1]).toContain('Test Customer 1');
      expect(lines[1]).toContain('Product A');
      expect(lines[1]).toContain('Product B');
    });
    
    it('should handle an order with missing products', () => {
      const mockOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer 1',
        status: 'completed',
        date: '2023-01-01'
        // Missing products array
      } as unknown as ProcessedOrder;
      
      const csv = orderToDetailedCSV(mockOrder);
      
      // Should handle the missing products without throwing errors
      const lines = csv.trim().split('\n');
      expect(lines.length).toBe(2);
      expect(lines[1]).toContain('1');
      expect(lines[1]).toContain('100');
      expect(lines[1]).toContain('Test Customer 1');
    });
    
    it('should include all order properties in the detailed CSV', () => {
      const mockOrder = {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer 1',
        customerEmail: 'customer1@example.com',
        customerPhone: '123456789',
        status: 'completed',
        date: '2023-01-01',
        shippingAddress: '123 Main St',
        paymentMethod: 'Credit Card',
        products: [
          { name: 'Product A', price: 50, quantity: 1 }
        ]
      } as unknown as ProcessedOrder;
      
      const csv = orderToDetailedCSV(mockOrder);
      
      // Should include all the provided properties
      const lines = csv.trim().split('\n');
      expect(lines[0]).toContain('customerEmail');
      expect(lines[0]).toContain('customerPhone');
      expect(lines[0]).toContain('shippingAddress');
      expect(lines[0]).toContain('paymentMethod');
      
      expect(lines[1]).toContain('customer1@example.com');
      expect(lines[1]).toContain('123456789');
      expect(lines[1]).toContain('123 Main St');
      expect(lines[1]).toContain('Credit Card');
    });
  });
}); 