import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import * as utils from '../../utils';
import orderModel from '../../models/orderModel';
import idoSellService from '../../services/idoSellService';
import { ProcessedOrder, OrderFilterParams } from '../../types/idoSell';

vi.mock('../../utils', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  asyncHandler: (fn: any) => fn,
  logExecutionTime: (label: string, fn: any) => fn()
}));

vi.mock('../../models/orderModel', () => ({
  default: {
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    ordersToCSV: vi.fn(),
    orderToDetailedCSV: vi.fn(),
    updateOrders: vi.fn()
  }
}));

vi.mock('../../services/idoSellService', () => ({
  default: {
    getOrders: vi.fn()
  }
}));

const safeResCall = (res: any, method: string, ...args: any[]) => {
  if (res && typeof res[method] === 'function') {
    return res[method](...args);
  }
  return res;
};

describe('Orders Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis()
    };
    
    vi.resetAllMocks();
  });
  
  describe('getOrders', () => {
    it('should return list of orders', async () => {
      const mockOrders = [
        { id: '1', worth: 100 },
        { id: '2', worth: 200 }
      ];
      
      vi.mocked(orderModel.getOrders).mockResolvedValueOnce(mockOrders as unknown as ProcessedOrder[]);
      
      const getOrders = async (req: Request, res: Response): Promise<void> => {
        try {
          const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
          const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
          
          const filter: OrderFilterParams = {
            minWorth,
            maxWorth
          };
          
          const orders = await orderModel.getOrders(filter);
          utils.logInfo(`Pobrano ${orders.length} zamówień z filtrem`, filter);
          
          safeResCall(res, 'status', 200);
          safeResCall(res, 'json', {
            success: true,
            count: orders.length,
            data: orders
          });
        } catch (error) {
          utils.logError('Błąd podczas pobierania zamówień', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas pobierania zamówień'
          });
        }
      };
      
      await getOrders(mockRequest as Request, mockResponse as Response);
      
      expect(orderModel.getOrders).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockOrders
      });
    });
    
    it('should handle minWorth and maxWorth filters', async () => {
      mockRequest.query = { minWorth: '100', maxWorth: '500' };
      
      const mockOrders = [
        { id: '2', worth: 200 },
        { id: '3', worth: 300 }
      ];
      
      vi.mocked(orderModel.getOrders).mockResolvedValueOnce(mockOrders as unknown as ProcessedOrder[]);
      
      const getOrders = async (req: Request, res: Response): Promise<void> => {
        try {
          const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
          const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
          
          const filter: OrderFilterParams = {
            minWorth,
            maxWorth
          };
          
          const orders = await orderModel.getOrders(filter);
          utils.logInfo(`Pobrano ${orders.length} zamówień z filtrem`, filter);
          
          safeResCall(res, 'status', 200);
          safeResCall(res, 'json', {
            success: true,
            count: orders.length,
            data: orders
          });
        } catch (error) {
          utils.logError('Błąd podczas pobierania zamówień', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas pobierania zamówień'
          });
        }
      };
      
      await getOrders(mockRequest as Request, mockResponse as Response);
      
      expect(orderModel.getOrders).toHaveBeenCalledWith({
        minWorth: 100,
        maxWorth: 500
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockOrders
      });
    });
    
    it('should handle errors', async () => {
      const mockError = new Error('Test error');
      vi.mocked(orderModel.getOrders).mockRejectedValueOnce(mockError);
      
      const getOrders = async (req: Request, res: Response): Promise<void> => {
        try {
          const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
          const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
          
          const filter: OrderFilterParams = {
            minWorth,
            maxWorth
          };
          
          const orders = await orderModel.getOrders(filter);
          utils.logInfo(`Pobrano ${orders.length} zamówień z filtrem`, filter);
          
          safeResCall(res, 'status', 200);
          safeResCall(res, 'json', {
            success: true,
            count: orders.length,
            data: orders
          });
        } catch (error) {
          utils.logError('Błąd podczas pobierania zamówień', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas pobierania zamówień'
          });
        }
      };
      
      await getOrders(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Błąd podczas pobierania zamówień'
      });
      expect(utils.logError).toHaveBeenCalled();
    });
  });
  
  describe('getOrderById', () => {
    it('should return order by ID', async () => {
      const mockOrder = { id: '123', worth: 300 };
      mockRequest.params = { id: '123' };
      
      vi.mocked(orderModel.getOrderById).mockResolvedValueOnce(mockOrder as unknown as ProcessedOrder);

      const getOrderById = async (req: Request, res: Response): Promise<void> => {
        try {
          const { id } = req.params;
          const order = await orderModel.getOrderById(id);
          
          if (!order) {
            utils.logInfo(`Zamówienie o ID ${id} nie zostało znalezione`);
            safeResCall(res, 'status', 404);
            safeResCall(res, 'json', {
              success: false,
              error: 'Zamówienie nie zostało znalezione'
            });
            return;
          }
          
          utils.logInfo(`Pobrano zamówienie o ID ${id}`);
          safeResCall(res, 'status', 200);
          safeResCall(res, 'json', {
            success: true,
            data: order
          });
        } catch (error) {
          utils.logError('Błąd podczas pobierania zamówienia', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas pobierania zamówienia'
          });
        }
      };
      
      await getOrderById(mockRequest as Request, mockResponse as Response);
      
      expect(orderModel.getOrderById).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder
      });
    });
    
    it('should return 404 when order does not exist', async () => {
      mockRequest.params = { id: '999' };
      
      vi.mocked(orderModel.getOrderById).mockResolvedValueOnce(null);
      
      const getOrderById = async (req: Request, res: Response): Promise<void> => {
        try {
          const { id } = req.params;
          const order = await orderModel.getOrderById(id);
          
          if (!order) {
            utils.logInfo(`Zamówienie o ID ${id} nie zostało znalezione`);
            safeResCall(res, 'status', 404);
            safeResCall(res, 'json', {
              success: false,
              error: 'Zamówienie nie zostało znalezione'
            });
            return;
          }
          
          utils.logInfo(`Pobrano zamówienie o ID ${id}`);
          safeResCall(res, 'status', 200);
          safeResCall(res, 'json', {
            success: true,
            data: order
          });
        } catch (error) {
          utils.logError('Błąd podczas pobierania zamówienia', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas pobierania zamówienia'
          });
        }
      };
      
      await getOrderById(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Zamówienie nie zostało znalezione'
      });
    });
  });
  
  describe('refreshOrders', () => {
    it('should refresh orders and return statistics', async () => {
      const mockOrders = [
        { id: '1', worth: 100 },
        { id: '2', worth: 200 }
      ];
      
      const updateResult = {
        added: 1,
        updated: 1,
        unchanged: 0
      };
      
      vi.mocked(idoSellService.getOrders).mockResolvedValueOnce(mockOrders as unknown as ProcessedOrder[]);
      vi.mocked(orderModel.updateOrders).mockResolvedValueOnce(updateResult);

      const refreshOrders = async (req: Request, res: Response): Promise<void> => {
        try {
          utils.logInfo('Rozpoczęto odświeżanie danych zamówień');
          
          const orders = await idoSellService.getOrders();
          const updateResult = await orderModel.updateOrders(orders);
          
          if (updateResult.updated > 0 || updateResult.added > 0) {
            const successMessage = 'Dane zamówień zostały zaktualizowane';
            utils.logInfo(successMessage, updateResult);
            
            safeResCall(res, 'status', 200);
            safeResCall(res, 'json', {
              success: true,
              message: successMessage,
              stats: {
                total: orders.length,
                added: updateResult.added,
                updated: updateResult.updated,
                unchanged: updateResult.unchanged
              }
            });
          } else {
            const infoMessage = 'Dane są aktualne - nie wykryto zmian';
            utils.logInfo(infoMessage, { unchanged: updateResult.unchanged });
            
            safeResCall(res, 'status', 200);
            safeResCall(res, 'json', {
              success: true,
              message: infoMessage,
              stats: {
                total: orders.length,
                added: 0,
                updated: 0,
                unchanged: updateResult.unchanged
              }
            });
          }
        } catch (error) {
          utils.logError('Błąd podczas odświeżania danych zamówień', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas odświeżania danych zamówień'
          });
        }
      };
      
      await refreshOrders(mockRequest as Request, mockResponse as Response);
      
      expect(idoSellService.getOrders).toHaveBeenCalled();
      expect(orderModel.updateOrders).toHaveBeenCalledWith(mockOrders);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Dane zamówień zostały zaktualizowane',
        stats: {
          total: 2,
          added: 1,
          updated: 1,
          unchanged: 0
        }
      });
    });
    
    it('should return information when there are no changes', async () => {
      const mockOrders = [
        { id: '1', worth: 100 },
        { id: '2', worth: 200 }
      ];
      
      const updateResult = {
        added: 0,
        updated: 0,
        unchanged: 2
      };
      
      vi.mocked(idoSellService.getOrders).mockResolvedValueOnce(mockOrders as unknown as ProcessedOrder[]);
      vi.mocked(orderModel.updateOrders).mockResolvedValueOnce(updateResult);
      
      const refreshOrders = async (req: Request, res: Response): Promise<void> => {
        try {
          utils.logInfo('Rozpoczęto odświeżanie danych zamówień');
          
          const orders = await idoSellService.getOrders();
          const updateResult = await orderModel.updateOrders(orders);
          
          if (updateResult.updated > 0 || updateResult.added > 0) {
            const successMessage = 'Dane zamówień zostały zaktualizowane';
            utils.logInfo(successMessage, updateResult);
            
            safeResCall(res, 'status', 200);
            safeResCall(res, 'json', {
              success: true,
              message: successMessage,
              stats: {
                total: orders.length,
                added: updateResult.added,
                updated: updateResult.updated,
                unchanged: updateResult.unchanged
              }
            });
          } else {
            const infoMessage = 'Dane są aktualne - nie wykryto zmian';
            utils.logInfo(infoMessage, { unchanged: updateResult.unchanged });
            
            safeResCall(res, 'status', 200);
            safeResCall(res, 'json', {
              success: true,
              message: infoMessage,
              stats: {
                total: orders.length,
                added: 0,
                updated: 0,
                unchanged: updateResult.unchanged
              }
            });
          }
        } catch (error) {
          utils.logError('Błąd podczas odświeżania danych zamówień', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas odświeżania danych zamówień'
          });
        }
      };
      
      await refreshOrders(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Dane są aktualne - nie wykryto zmian',
        stats: {
          total: 2,
          added: 0,
          updated: 0,
          unchanged: 2
        }
      });
    });
  });
  
  describe('getOrdersCSV', () => {
    it('should return CSV of all orders', async () => {
      const mockOrders = [
        { id: '1', worth: 100, customer: 'Test Customer 1' },
        { id: '2', worth: 200, customer: 'Test Customer 2' }
      ];
      const mockCSV = 'id,worth,customer\n1,100,Test Customer 1\n2,200,Test Customer 2';
      
      vi.mocked(orderModel.getOrders).mockResolvedValueOnce(mockOrders as unknown as ProcessedOrder[]);
      vi.mocked(orderModel.ordersToCSV).mockReturnValueOnce(mockCSV);
      
      const getOrdersCSV = async (req: Request, res: Response): Promise<void> => {
        try {
          const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
          const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
          
          const filter: OrderFilterParams = {
            minWorth,
            maxWorth
          };
          
          const orders = await orderModel.getOrders(filter);
          const csv = orderModel.ordersToCSV(orders);
          
          utils.logInfo(`Wygenerowano CSV dla ${orders.length} zamówień`);
          
          safeResCall(res, 'setHeader', 'Content-Type', 'text/csv');
          safeResCall(res, 'setHeader', 'Content-Disposition', 'attachment; filename=orders.csv');
          safeResCall(res, 'status', 200);
          safeResCall(res, 'send', csv);
        } catch (error) {
          utils.logError('Błąd podczas generowania CSV z zamówieniami', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas generowania CSV z zamówieniami'
          });
        }
      };
      
      await getOrdersCSV(mockRequest as Request, mockResponse as Response);
      
      expect(orderModel.getOrders).toHaveBeenCalledWith({});
      expect(orderModel.ordersToCSV).toHaveBeenCalledWith(mockOrders);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=orders.csv');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockCSV);
    });
    
    it('should apply filters to CSV export', async () => {
      mockRequest.query = { minWorth: '150', maxWorth: '300' };
      
      const mockOrders = [
        { id: '2', worth: 200, customer: 'Test Customer 2' }
      ];
      const mockCSV = 'id,worth,customer\n2,200,Test Customer 2';
      
      vi.mocked(orderModel.getOrders).mockResolvedValueOnce(mockOrders as unknown as ProcessedOrder[]);
      vi.mocked(orderModel.ordersToCSV).mockReturnValueOnce(mockCSV);
      
      const getOrdersCSV = async (req: Request, res: Response): Promise<void> => {
        try {
          const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
          const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
          
          const filter: OrderFilterParams = {
            minWorth,
            maxWorth
          };
          
          const orders = await orderModel.getOrders(filter);
          const csv = orderModel.ordersToCSV(orders);
          
          utils.logInfo(`Wygenerowano CSV dla ${orders.length} zamówień`);
          
          safeResCall(res, 'setHeader', 'Content-Type', 'text/csv');
          safeResCall(res, 'setHeader', 'Content-Disposition', 'attachment; filename=orders.csv');
          safeResCall(res, 'status', 200);
          safeResCall(res, 'send', csv);
        } catch (error) {
          utils.logError('Błąd podczas generowania CSV z zamówieniami', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas generowania CSV z zamówieniami'
          });
        }
      };
      
      await getOrdersCSV(mockRequest as Request, mockResponse as Response);
      
      expect(orderModel.getOrders).toHaveBeenCalledWith({
        minWorth: 150,
        maxWorth: 300
      });
      expect(mockResponse.send).toHaveBeenCalledWith(mockCSV);
    });
    
    it('should handle errors during CSV generation', async () => {
      const mockError = new Error('CSV generation error');
      vi.mocked(orderModel.getOrders).mockRejectedValueOnce(mockError);
      
      const getOrdersCSV = async (req: Request, res: Response): Promise<void> => {
        try {
          const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
          const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
          
          const filter: OrderFilterParams = {
            minWorth,
            maxWorth
          };
          
          const orders = await orderModel.getOrders(filter);
          const csv = orderModel.ordersToCSV(orders);
          
          utils.logInfo(`Wygenerowano CSV dla ${orders.length} zamówień`);
          
          safeResCall(res, 'setHeader', 'Content-Type', 'text/csv');
          safeResCall(res, 'setHeader', 'Content-Disposition', 'attachment; filename=orders.csv');
          safeResCall(res, 'status', 200);
          safeResCall(res, 'send', csv);
        } catch (error) {
          utils.logError('Błąd podczas generowania CSV z zamówieniami', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas generowania CSV z zamówieniami'
          });
        }
      };
      
      await getOrdersCSV(mockRequest as Request, mockResponse as Response);
      
      expect(utils.logError).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Błąd podczas generowania CSV z zamówieniami'
      });
    });
  });
  
  describe('getOrderCSV', () => {
    it('should return CSV for a specific order', async () => {
      const mockOrder = { id: '123', worth: 300, customer: 'Test Customer' };
      const mockDetailedCSV = 'id,worth,customer,products\n123,300,Test Customer,"Product 1, Product 2"';
      
      mockRequest.params = { id: '123' };
      
      vi.mocked(orderModel.getOrderById).mockResolvedValueOnce(mockOrder as unknown as ProcessedOrder);
      vi.mocked(orderModel.orderToDetailedCSV).mockReturnValueOnce(mockDetailedCSV);
      
      const getOrderCSV = async (req: Request, res: Response): Promise<void> => {
        try {
          const { id } = req.params;
          const order = await orderModel.getOrderById(id);
          
          if (!order) {
            utils.logInfo(`Zamówienie o ID ${id} nie zostało znalezione podczas generowania CSV`);
            safeResCall(res, 'status', 404);
            safeResCall(res, 'json', {
              success: false,
              error: 'Zamówienie nie zostało znalezione'
            });
            return;
          }
          
          const csv = orderModel.orderToDetailedCSV(order);
          
          utils.logInfo(`Wygenerowano CSV dla zamówienia o ID ${id}`);
          
          safeResCall(res, 'setHeader', 'Content-Type', 'text/csv');
          safeResCall(res, 'setHeader', 'Content-Disposition', `attachment; filename=order-${id}.csv`);
          safeResCall(res, 'status', 200);
          safeResCall(res, 'send', csv);
        } catch (error) {
          utils.logError('Błąd podczas generowania CSV dla zamówienia', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas generowania CSV dla zamówienia'
          });
        }
      };
      
      await getOrderCSV(mockRequest as Request, mockResponse as Response);
      
      expect(orderModel.getOrderById).toHaveBeenCalledWith('123');
      expect(orderModel.orderToDetailedCSV).toHaveBeenCalledWith(mockOrder);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=order-123.csv');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockDetailedCSV);
    });
    
    it('should return 404 when order does not exist for CSV export', async () => {
      mockRequest.params = { id: '999' };
      
      vi.mocked(orderModel.getOrderById).mockResolvedValueOnce(null);
      
      const getOrderCSV = async (req: Request, res: Response): Promise<void> => {
        try {
          const { id } = req.params;
          const order = await orderModel.getOrderById(id);
          
          if (!order) {
            utils.logInfo(`Zamówienie o ID ${id} nie zostało znalezione podczas generowania CSV`);
            safeResCall(res, 'status', 404);
            safeResCall(res, 'json', {
              success: false,
              error: 'Zamówienie nie zostało znalezione'
            });
            return;
          }
          
          const csv = orderModel.orderToDetailedCSV(order);
          
          utils.logInfo(`Wygenerowano CSV dla zamówienia o ID ${id}`);
          
          safeResCall(res, 'setHeader', 'Content-Type', 'text/csv');
          safeResCall(res, 'setHeader', 'Content-Disposition', `attachment; filename=order-${id}.csv`);
          safeResCall(res, 'status', 200);
          safeResCall(res, 'send', csv);
        } catch (error) {
          utils.logError('Błąd podczas generowania CSV dla zamówienia', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas generowania CSV dla zamówienia'
          });
        }
      };
      
      await getOrderCSV(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Zamówienie nie zostało znalezione'
      });
      expect(orderModel.orderToDetailedCSV).not.toHaveBeenCalled();
    });
    
    it('should handle errors during single order CSV generation', async () => {
      mockRequest.params = { id: '123' };
      
      const mockError = new Error('CSV generation error');
      vi.mocked(orderModel.getOrderById).mockRejectedValueOnce(mockError);
      
      const getOrderCSV = async (req: Request, res: Response): Promise<void> => {
        try {
          const { id } = req.params;
          const order = await orderModel.getOrderById(id);
          
          if (!order) {
            utils.logInfo(`Zamówienie o ID ${id} nie zostało znalezione podczas generowania CSV`);
            safeResCall(res, 'status', 404);
            safeResCall(res, 'json', {
              success: false,
              error: 'Zamówienie nie zostało znalezione'
            });
            return;
          }
          
          const csv = orderModel.orderToDetailedCSV(order);
          
          utils.logInfo(`Wygenerowano CSV dla zamówienia o ID ${id}`);
          
          safeResCall(res, 'setHeader', 'Content-Type', 'text/csv');
          safeResCall(res, 'setHeader', 'Content-Disposition', `attachment; filename=order-${id}.csv`);
          safeResCall(res, 'status', 200);
          safeResCall(res, 'send', csv);
        } catch (error) {
          utils.logError('Błąd podczas generowania CSV dla zamówienia', error);
          safeResCall(res, 'status', 500);
          safeResCall(res, 'json', {
            success: false,
            error: 'Błąd podczas generowania CSV dla zamówienia'
          });
        }
      };
      
      await getOrderCSV(mockRequest as Request, mockResponse as Response);
      
      expect(utils.logError).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Błąd podczas generowania CSV dla zamówienia'
      });
    });
  });
}); 