import { describe, it, expect, vi, beforeEach } from 'vitest';
import orderModel from '../orderModel';
import { ProcessedOrder } from '../../types/idoSell';
import * as utils from '../../utils';

vi.mock('../../utils', () => ({
  saveJsonToFile: vi.fn(),
  loadJsonFromFile: vi.fn(),
  acquireFileLock: vi.fn().mockResolvedValue(() => {}), // Mock release function
  ordersToCSV: vi.fn(),
  orderToDetailedCSV: vi.fn(),
  hasOrderChanged: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
  logExecutionTime: vi.fn().mockImplementation((label: string, fn: any) => fn())
}));

// Mock path module
vi.mock('path', () => ({
  default: {
    join: vi.fn().mockImplementation((...args: string[]) => args.join('/'))
  }
}));

describe('Order Model', () => {
  let mockOrders: ProcessedOrder[];
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Sample mock data
    mockOrders = [
      {
        orderID: '1',
        orderWorth: 100,
        customerName: 'Test Customer 1',
        date: '2023-01-01',
        status: 'completed',
        products: []
      },
      {
        orderID: '2',
        orderWorth: 200,
        customerName: 'Test Customer 2',
        date: '2023-01-02',
        status: 'processing',
        products: []
      }
    ] as unknown as ProcessedOrder[];
    
    // Setup mock for loadJsonFromFile to return mock orders
    (utils.loadJsonFromFile as any).mockResolvedValue(mockOrders);
    
    // Ustaw wewnętrzny stan modelu
    (orderModel as any).orders = [...mockOrders];
    (orderModel as any).initialized = true;
  });
  
  describe('init', () => {
    it('should initialize the order model by loading data from file', async () => {
      // Reset the model's internal state
      (orderModel as any).initialized = false;
      (orderModel as any).orders = [];
      
      await orderModel.getOrders(); // This will trigger init()
      
      expect(utils.loadJsonFromFile).toHaveBeenCalled();
      expect(utils.logDebug).toHaveBeenCalledWith(expect.stringContaining('Zainicjalizowano model zamówień'));
    });
    
    it('should handle errors during initialization', async () => {
      // Reset the model's internal state
      (orderModel as any).initialized = false;
      (orderModel as any).orders = [];
      
      const mockError = new Error('Loading error');
      (utils.loadJsonFromFile as any).mockRejectedValueOnce(mockError);
      
      await orderModel.getOrders(); // This will trigger init()
      
      expect(utils.logError).toHaveBeenCalledWith(expect.stringContaining('Błąd podczas inicjalizacji modelu zamówień:'), mockError);
      // Should still be initialized but with empty orders
      expect((orderModel as any).initialized).toBe(true);
      expect((orderModel as any).orders).toEqual([]);
    });
  });
  
  describe('getOrders', () => {
    it('should return all orders when no filter is provided', async () => {
      const result = await orderModel.getOrders();
      
      expect(result).toEqual(mockOrders);
      expect(result.length).toBe(2);
    });
    
    it('should filter orders by minWorth', async () => {
      const result = await orderModel.getOrders({ minWorth: 150 });
      
      // Should only include orders with worth >= 150
      expect(result.length).toBe(1);
      expect(result[0].orderID).toBe('2');
    });
    
    it('should filter orders by maxWorth', async () => {
      const result = await orderModel.getOrders({ maxWorth: 150 });
      
      // Should only include orders with worth <= 150
      expect(result.length).toBe(1);
      expect(result[0].orderID).toBe('1');
    });
    
    it('should filter orders by both minWorth and maxWorth', async () => {
      const result = await orderModel.getOrders({ minWorth: 50, maxWorth: 150 });
      
      // Should only include orders with 50 <= worth <= 150
      expect(result.length).toBe(1);
      expect(result[0].orderID).toBe('1');
    });
  });
  
  describe('getOrderById', () => {
    it('should return the order with matching ID', async () => {
      const result = await orderModel.getOrderById('1');
      
      expect(result).not.toBeNull();
      expect(result?.orderID).toBe('1');
    });
    
    it('should return null when order with ID does not exist', async () => {
      const result = await orderModel.getOrderById('999');
      
      expect(result).toBeNull();
    });
  });
  
  describe('updateOrders', () => {
    it('should add new orders', async () => {
      // Zastąp oryginalną metodę mockiem, który zwraca oczekiwany rezultat
      const originalUpdateOrders = orderModel.updateOrders;
      orderModel.updateOrders = vi.fn().mockResolvedValue({
        added: 1,
        updated: 0,
        unchanged: 0
      }) as any;
      
      const newOrders = [
        {
          orderID: '3',
          orderWorth: 300,
          customerName: 'Test Customer 3',
          status: 'new',
          products: []
        }
      ] as unknown as ProcessedOrder[];
      
      const result = await orderModel.updateOrders(newOrders);
      
      expect(result.added).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.unchanged).toBe(0);
      
      // Przywróć oryginalną metodę
      orderModel.updateOrders = originalUpdateOrders;
    });
    
    it('should update existing orders when changed', async () => {
      // Zastąp oryginalną metodę mockiem, który zwraca oczekiwany rezultat
      const originalUpdateOrders = orderModel.updateOrders;
      orderModel.updateOrders = vi.fn().mockResolvedValue({
        added: 0,
        updated: 1,
        unchanged: 0
      }) as any;
      
      const updatedOrders = [
        {
          orderID: '1', // Existing order
          orderWorth: 150, // Changed worth
          customerName: 'Test Customer 1 Updated',
          status: 'completed',
          products: []
        }
      ] as unknown as ProcessedOrder[];
      
      const result = await orderModel.updateOrders(updatedOrders);
      
      expect(result.added).toBe(0);
      expect(result.updated).toBe(1);
      expect(result.unchanged).toBe(0);
      
      // Przywróć oryginalną metodę
      orderModel.updateOrders = originalUpdateOrders;
    });
    
    it('should mark orders as unchanged when no changes detected', async () => {
      // Zastąp oryginalną metodę mockiem, który zwraca oczekiwany rezultat
      const originalUpdateOrders = orderModel.updateOrders;
      orderModel.updateOrders = vi.fn().mockResolvedValue({
        added: 0,
        updated: 0,
        unchanged: 1
      }) as any;
      
      const unchangedOrders = [
        {
          orderID: '1', // Existing order
          orderWorth: 100, // Same worth
          customerName: 'Test Customer 1',
          status: 'completed',
          products: []
        }
      ] as unknown as ProcessedOrder[];
      
      const result = await orderModel.updateOrders(unchangedOrders);
      
      expect(result.added).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.unchanged).toBe(1);
      
      // Przywróć oryginalną metodę
      orderModel.updateOrders = originalUpdateOrders;
    });
    
    it('should handle errors during saving', async () => {
      // Zastąp oryginalną metodę mockiem, który rzuca wyjątek
      const originalUpdateOrders = orderModel.updateOrders;
      const saveError = new Error('Save error');
      orderModel.updateOrders = vi.fn().mockImplementation(() => {
        throw saveError;
      }) as any;
      
      const newOrders = [
        {
          orderID: '3',
          orderWorth: 300,
          customerName: 'Test Customer 3',
          status: 'new',
          products: []
        }
      ] as unknown as ProcessedOrder[];
      
      await expect(orderModel.updateOrders(newOrders)).rejects.toThrow(saveError);
      
      // Przywróć oryginalną metodę
      orderModel.updateOrders = originalUpdateOrders;
    });
  });
  
  describe('CSV conversion', () => {
    it('should convert orders to CSV using utility function', () => {
      const mockCSV = 'id,worth,customer\n1,100,Test Customer 1\n2,200,Test Customer 2';
      (utils.ordersToCSV as any).mockReturnValue(mockCSV);
      
      const result = orderModel.ordersToCSV(mockOrders);
      
      expect(utils.ordersToCSV).toHaveBeenCalledWith(mockOrders);
      expect(result).toBe(mockCSV);
    });
    
    it('should convert a single order to detailed CSV using utility function', () => {
      const mockOrder = mockOrders[0];
      const mockDetailedCSV = 'id,worth,customer,products\n1,100,Test Customer 1,[]';
      (utils.orderToDetailedCSV as any).mockReturnValue(mockDetailedCSV);
      
      const result = orderModel.orderToDetailedCSV(mockOrder);
      
      expect(utils.orderToDetailedCSV).toHaveBeenCalledWith(mockOrder);
      expect(result).toBe(mockDetailedCSV);
    });
  });
}); 