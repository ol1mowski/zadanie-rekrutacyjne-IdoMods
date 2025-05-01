import { Request, Response } from 'express';
import idoSellService from '../services/idoSellService';
import orderModel from '../models/orderModel';
import { OrderFilterParams } from '../types/idoSell';

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
    const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
    
    const filter: OrderFilterParams = {
      minWorth,
      maxWorth
    };
    
    const orders = await orderModel.getOrders(filter);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Błąd w kontrolerze orders:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania zamówień'
    });
  }
};

export const getOrdersCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const minWorth = req.query.minWorth ? parseFloat(req.query.minWorth as string) : undefined;
    const maxWorth = req.query.maxWorth ? parseFloat(req.query.maxWorth as string) : undefined;
    
    const filter: OrderFilterParams = {
      minWorth,
      maxWorth
    };
    
    const orders = await orderModel.getOrders(filter);
    
    const csv = orderModel.ordersToCSV(orders);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    
    res.status(200).send(csv);
  } catch (error) {
    console.error('Błąd podczas generowania CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas generowania CSV z zamówieniami'
    });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderModel.getOrderById(id);
    
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Zamówienie nie zostało znalezione'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Błąd podczas pobierania zamówienia:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania zamówienia'
    });
  }
};

export const getOrderCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderModel.getOrderById(id);
    
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Zamówienie nie zostało znalezione'
      });
      return;
    }
    
    const csv = orderModel.orderToDetailedCSV(order);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=order-${id}.csv`);
    
    res.status(200).send(csv);
  } catch (error) {
    console.error('Błąd podczas generowania CSV dla zamówienia:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas generowania CSV dla zamówienia'
    });
  }
};


export const refreshOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await idoSellService.getOrders();
    
    await orderModel.updateOrders(orders);
    
    res.status(200).json({
      success: true,
      message: 'Dane zamówień zostały zaktualizowane',
      count: orders.length
    });
  } catch (error) {
    console.error('Błąd podczas odświeżania danych zamówień:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas odświeżania danych zamówień'
    });
  }
};
