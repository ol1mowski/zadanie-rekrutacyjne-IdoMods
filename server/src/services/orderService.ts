import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { Order, OrderFilter } from '../models/Order';
import { IdoSellService } from './idoSellService';

export class OrderService {
  private dataPath: string;
  private idoSellService: IdoSellService;
  private orders: Order[] = [];

  constructor() {
    this.dataPath = path.join(__dirname, '../../data');
    this.idoSellService = new IdoSellService();
    this.ensureDataDirExists();
    this.loadOrdersFromFile();
  }

  private ensureDataDirExists(): void {
    try {
      if (!fs.existsSync(this.dataPath)) {
        fs.mkdirSync(this.dataPath, { recursive: true });
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia katalogu data:', error);
      // Kontynuujemy mimo błędu
    }
  }

  private getOrdersFilePath(): string {
    return path.join(this.dataPath, 'orders.json');
  }

  private loadOrdersFromFile(): void {
    try {
      const filePath = this.getOrdersFilePath();
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        this.orders = JSON.parse(data);
      } else {
        console.log('Plik z zamówieniami nie istnieje. Będzie utworzony przy następnej aktualizacji.');
        this.orders = [];
      }
    } catch (error) {
      console.error('Błąd podczas wczytywania zamówień z pliku:', error);
      this.orders = [];
    }
  }

  private saveOrdersToFile(): void {
    try {
      const filePath = this.getOrdersFilePath();
      fs.writeFileSync(filePath, JSON.stringify(this.orders, null, 2), 'utf8');
      console.log(`Zapisano ${this.orders.length} zamówień do pliku.`);
    } catch (error) {
      console.error('Błąd podczas zapisywania zamówień do pliku:', error);
    }
  }

  async updateOrders(): Promise<void> {
    try {
      console.log('Rozpoczynam aktualizację zamówień...');
      const newOrders = await this.idoSellService.getOrders();
      
      if (newOrders && newOrders.length > 0) {
        this.orders = newOrders;
        this.saveOrdersToFile();
        console.log(`Zaktualizowano ${this.orders.length} zamówień.`);
      } else {
        console.warn('Otrzymano pustą listę zamówień. Dane nie zostały zaktualizowane.');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji zamówień:', error);
      // Nie rzucamy błędu dalej, aby nie przerywać działania aplikacji
    }
  }

  getOrders(filter?: OrderFilter): Order[] {
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

  getOrderById(orderId: string | number): Order | undefined {
    return this.orders.find(order => order.orderID.toString() === orderId.toString());
  }

  async generateCsv(orders: Order[]): Promise<string> {
    try {
      const csvFilePath = path.join(this.dataPath, 'orders_export.csv');
      
      const csvWriter = createObjectCsvWriter({
        path: csvFilePath,
        header: [
          { id: 'orderID', title: 'Order ID' },
          { id: 'productsCount', title: 'Products Count' },
          { id: 'orderWorth', title: 'Order Worth' },
          { id: 'products', title: 'Products (ID:quantity)' }
        ]
      });
      
      const records = orders.map(order => {
        const productsString = order.products
          .map(product => `${product.productID}:${product.quantity}`)
          .join(', ');
        
        return {
          orderID: order.orderID,
          productsCount: order.products.length,
          orderWorth: order.orderWorth,
          products: productsString
        };
      });
      
      await csvWriter.writeRecords(records);
      return csvFilePath;
    } catch (error) {
      console.error('Błąd podczas generowania pliku CSV:', error);
      throw new Error('Nie udało się wygenerować pliku CSV');
    }
  }
} 