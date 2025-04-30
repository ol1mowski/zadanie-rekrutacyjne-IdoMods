import { Request, Response } from 'express';
import fs from 'fs';
import { OrderService } from '../services/orderService';
import { OrderFilter } from '../models/Order';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const filter: OrderFilter = {};
      
      if (req.query.minWorth) {
        filter.minWorth = parseFloat(req.query.minWorth as string);
      }
      
      if (req.query.maxWorth) {
        filter.maxWorth = parseFloat(req.query.maxWorth as string);
      }
      
      const orders = this.orderService.getOrders(filter);
      res.json(orders);
    } catch (error) {
      console.error('Błąd podczas pobierania zamówień:', error);
      res.status(500).json({ error: 'Wystąpił błąd podczas pobierania zamówień' });
    }
  };

  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const order = this.orderService.getOrderById(orderId);
      
      if (!order) {
        res.status(404).json({ error: `Zamówienie o ID ${orderId} nie zostało znalezione` });
        return;
      }
      
      res.json(order);
    } catch (error) {
      console.error(`Błąd podczas pobierania zamówienia ${req.params.id}:`, error);
      res.status(500).json({ error: 'Wystąpił błąd podczas pobierania zamówienia' });
    }
  };

  exportOrdersToCsv = async (req: Request, res: Response): Promise<void> => {
    try {
      const filter: OrderFilter = {};
      
      if (req.query.minWorth) {
        filter.minWorth = parseFloat(req.query.minWorth as string);
      }
      
      if (req.query.maxWorth) {
        filter.maxWorth = parseFloat(req.query.maxWorth as string);
      }
      
      const orders = this.orderService.getOrders(filter);
      const csvFilePath = await this.orderService.generateCsv(orders);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      
      const fileStream = fs.createReadStream(csvFilePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Błąd podczas eksportowania zamówień do CSV:', error);
      res.status(500).json({ error: 'Wystąpił błąd podczas eksportowania zamówień do CSV' });
    }
  };

  updateOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.orderService.updateOrders();
      res.json({ message: 'Zamówienia zostały zaktualizowane' });
    } catch (error) {
      console.error('Błąd podczas aktualizacji zamówień:', error);
      res.status(500).json({ error: 'Wystąpił błąd podczas aktualizacji zamówień' });
    }
  };
} 