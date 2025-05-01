import { describe, it, expect, vi, beforeEach } from 'vitest';
import idoSellService from '../idoSellService';
import * as utils from '../../utils';

vi.mock('../../utils', () => ({
  createHttpClient: vi.fn(),
  createSearchParams: vi.fn(),
  processOrderData: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logDebug: vi.fn(),
  retry: vi.fn(),
  logExecutionTime: vi.fn()
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  },
  AxiosError: Error
}));

vi.mock('../../config/config', () => ({
  config: {
    idoSell: {
      panelUrl: 'test-panel.ido.pl',
      apiKey: 'test-api-key'
    }
  }
}));

describe('IdoSell Service', () => {
  let mockHttpClient: any;

  beforeEach(() => {
    vi.resetAllMocks();
    
    mockHttpClient = {
      post: vi.fn()
    };
    
    (idoSellService as any).httpClient = mockHttpClient;
    
    (utils.retry as any).mockImplementation((fn: any) => fn());
    (utils.logExecutionTime as any).mockImplementation((label: string, fn: any) => fn());
    (utils.createSearchParams as any).mockImplementation((page: number, limit: number, params: Record<string, any>) => ({ 
      page, 
      limit, 
      ...params 
    }));
  });

  describe('getOrders', () => {
    it('should fetch and process orders successfully', async () => {
      const mockApiResponse = {
        data: {
          Results: [
            { id: '1', orderWorth: 100 },
            { id: '2', orderWorth: 200 }
          ]
        }
      };

      mockHttpClient.post.mockResolvedValue(mockApiResponse);
      
      (utils.processOrderData as any).mockImplementation((data: any) => ({
        orderID: data.id,
        orderWorth: data.orderWorth
      }));

      const result = await idoSellService.getOrders();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/orders/orders/search', expect.any(Object));
      expect(utils.createSearchParams).toHaveBeenCalledWith(0, 100, {
        orderPrepaidStatus: 'unpaid',
        ordersStatuses: ['finished', 'ready', 'payment_waiting', 'new']
      });
      expect(utils.processOrderData).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0].orderID).toBe('1');
      expect(result[1].orderID).toBe('2');
    });

    it('should handle empty results from API', async () => {
      const mockApiResponse = {
        data: {
          Results: []
        }
      };

      mockHttpClient.post.mockResolvedValue(mockApiResponse);

      const result = await idoSellService.getOrders();

      expect(result).toHaveLength(0);
      expect(utils.logInfo).toHaveBeenCalledWith('API zwróciło 0 zamówień');
    });

    it('should handle API response with invalid structure', async () => {
      const mockApiResponse = {
        data: {
          status: 'success'
        }
      };

      mockHttpClient.post.mockResolvedValue(mockApiResponse);

      const result = await idoSellService.getOrders();

      expect(result).toHaveLength(0);
      expect(utils.logWarn).toHaveBeenCalledWith('Odpowiedź API ma nieprawidłową strukturę', mockApiResponse.data);
    });

    it('should use alternative method when API returns specific error', async () => {
      const axiosError = new Error('API Error');
      (axiosError as any).response = {
        data: {
          errors: {
            faultString: 'nie podano żadnych parametrów'
          }
        }
      };
      mockHttpClient.post.mockRejectedValueOnce(axiosError);
      
      const mockApiResponse = {
        data: {
          Results: [
            { id: '3', orderWorth: 300 }
          ]
        }
      };
      mockHttpClient.post.mockResolvedValueOnce(mockApiResponse);
      
      (utils.processOrderData as any).mockImplementation((data: any) => ({
        orderID: data.id,
        orderWorth: data.orderWorth
      }));

      const result = await idoSellService.getOrders();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/orders/orders/search', expect.any(Object));
      expect(utils.logError).toHaveBeenCalledWith('Błąd podczas pobierania zamówień z idoSell', axiosError);
      
      expect(utils.createSearchParams).toHaveBeenCalledWith(0, 50, {
        ordersStatuses: ['finished']
      });
      expect(utils.logInfo).toHaveBeenCalledWith('Pobieranie zamówień alternatywną metodą', expect.any(Object));
      
      expect(result).toHaveLength(1);
      expect(result[0].orderID).toBe('3');
    });

    it('should handle errors during order processing', async () => {
      const mockApiResponse = {
        data: {
          Results: [
            { id: '1', orderWorth: 100 },
            { id: '2', orderWorth: 200 }
          ]
        }
      };

      mockHttpClient.post.mockResolvedValue(mockApiResponse);
      
      const processingError = new Error('Processing error');
      (utils.processOrderData as any).mockImplementation(() => {
        throw processingError;
      });

      const result = await idoSellService.getOrders();

      expect(utils.logError).toHaveBeenCalledWith('Błąd podczas przetwarzania zamówień', processingError);
      expect(result).toHaveLength(0);
    });
  });
}); 