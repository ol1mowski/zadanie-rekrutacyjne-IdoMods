import fs from 'fs';
import path from 'path';
import { ProcessedOrder, OrderFilterParams } from '../types/idoSell';

class OrderModel {
  private dbFilePath: string;
  private orders: ProcessedOrder[] = [];
  private initialized: boolean = false;

  constructor() {
    this.dbFilePath = path.join(__dirname, '../../data/orders.json');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    const dataDir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const data = fs.readFileSync(this.dbFilePath, 'utf8');
        this.orders = JSON.parse(data);
      } else {
        this.orders = [];
        await this.saveToFile();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Błąd podczas inicjalizacji modelu zamówień:', error);
      this.orders = [];
      this.initialized = true;
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(this.orders, null, 2));
    } catch (error) {
      console.error('Błąd podczas zapisywania zamówień do pliku:', error);
      throw error;
    }
  }

  async updateOrders(newOrders: ProcessedOrder[]): Promise<void> {
    await this.init();
    
    for (const newOrder of newOrders) {
      const existingOrderIndex = this.orders.findIndex(order => order.orderID === newOrder.orderID);
      
      if (existingOrderIndex !== -1) {
        this.orders[existingOrderIndex] = {
          ...newOrder,
          date: new Date().toISOString()
        };
      } else {
        this.orders.push({
          ...newOrder,
          date: new Date().toISOString()
        });
      }
    }
    
    await this.saveToFile();
  }

  async getOrders(filter?: OrderFilterParams): Promise<ProcessedOrder[]> {
    await this.init();
    
    if (!filter) {
      return this.orders;
    }
    
    return this.orders.filter(order => {
      const { minWorth, maxWorth } = filter;
      
      if (minWorth !== undefined && order.orderWorth < minWorth) {
        return false;
      }
      
      if (maxWorth !== undefined && order.orderWorth > maxWorth) {
        return false;
      }
      
      return true;
    });
  }

  async getOrderById(orderID: string): Promise<ProcessedOrder | null> {
    await this.init();
    
    const order = this.orders.find(order => order.orderID === orderID);
    return order || null;
  }

  ordersToCSV(orders: ProcessedOrder[]): string {
    let csv = 'OrderID,OrderWorth,ProductsCount,ProductIDs,ProductQuantities,Date\n';
    
    for (const order of orders) {
      const productIDs = order.products.map(p => p.productID).join(';');
      const productQuantities = order.products.map(p => p.quantity).join(';');
      
      csv += `${order.orderID},${order.orderWorth},${order.products.length},${productIDs},${productQuantities},${order.date || ''}\n`;
    }
    
    return csv;
  }

  orderToDetailedCSV(order: ProcessedOrder): string {
    if (!order) return '';
    
    let csv = `Zamówienie: ${order.orderID}\n`;
    csv += `Wartość zamówienia: ${order.orderWorth}\n`;
    csv += `Data aktualizacji: ${order.date || ''}\n\n`;
    
    csv += 'ProductID,Quantity\n';
    
    for (const product of order.products) {
      csv += `${product.productID},${product.quantity}\n`;
    }
    
    return csv;
  }
}

const orderModel = new OrderModel();
export default orderModel; 