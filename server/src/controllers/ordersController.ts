import { Request, Response } from 'express';
import idoSellService from '../services/idoSellService';
import orderModel from '../models/orderModel';
import { OrderFilterParams } from '../types/idoSell';
import { 
  logError, 
  logInfo, 
  asyncHandler, 
  logExecutionTime 
} from '../utils';

const handleControllerError = (res: Response, message: string, error: any): void => {
  logError(message, error);
  res.status(500).json({
    success: false,
    error: message
  });
};

export const getOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await logExecutionTime('getOrders controller', async () => {
    try {
      const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
      const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
      
      const filter: OrderFilterParams = {
        minWorth,
        maxWorth
      };
      
      const orders = await orderModel.getOrders(filter);
      logInfo(`Pobrano ${orders.length} zamówień z filtrem`, filter);
      
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      handleControllerError(res, 'Błąd podczas pobierania zamówień', error);
    }
  });
});

export const getOrdersCSV = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await logExecutionTime('getOrdersCSV controller', async () => {
    try {
      const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
      const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
      
      const filter: OrderFilterParams = {
        minWorth,
        maxWorth
      };
      
      const orders = await orderModel.getOrders(filter);
      const csv = orderModel.ordersToCSV(orders);
      
      logInfo(`Wygenerowano CSV dla ${orders.length} zamówień`);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      
      res.status(200).send(csv);
    } catch (error) {
      handleControllerError(res, 'Błąd podczas generowania CSV z zamówieniami', error);
    }
  });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderModel.getOrderById(id);
    
    if (!order) {
      logInfo(`Zamówienie o ID ${id} nie zostało znalezione`);
      res.status(404).json({
        success: false,
        error: 'Zamówienie nie zostało znalezione'
      });
      return;
    }
    
    logInfo(`Pobrano zamówienie o ID ${id}`);
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    handleControllerError(res, 'Błąd podczas pobierania zamówienia', error);
  }
});

export const getOrderCSV = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderModel.getOrderById(id);
    
    if (!order) {
      logInfo(`Zamówienie o ID ${id} nie zostało znalezione podczas generowania CSV`);
      res.status(404).json({
        success: false,
        error: 'Zamówienie nie zostało znalezione'
      });
      return;
    }
    
    const csv = orderModel.orderToDetailedCSV(order);
    
    logInfo(`Wygenerowano CSV dla zamówienia o ID ${id}`);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=order-${id}.csv`);
    
    res.status(200).send(csv);
  } catch (error) {
    handleControllerError(res, 'Błąd podczas generowania CSV dla zamówienia', error);
  }
});

export const refreshOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await logExecutionTime('refreshOrders controller', async () => {
    try {
      logInfo('Rozpoczęto odświeżanie danych zamówień');
      
      const orders = await idoSellService.getOrders();
      const updateResult = await orderModel.updateOrders(orders);
      
      if (updateResult.updated > 0 || updateResult.added > 0) {
        const successMessage = 'Dane zamówień zostały zaktualizowane';
        logInfo(successMessage, updateResult);
        
        res.status(200).json({
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
        logInfo(infoMessage, { unchanged: updateResult.unchanged });
        
        res.status(200).json({
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
      handleControllerError(res, 'Błąd podczas odświeżania danych zamówień', error);
    }
  });
});
