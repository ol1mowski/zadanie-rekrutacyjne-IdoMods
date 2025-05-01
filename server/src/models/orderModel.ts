import path from 'path';
import { ProcessedOrder, OrderFilterParams } from '../types/idoSell';
import {
  saveJsonToFile,
  loadJsonFromFile,
  acquireFileLock,
  ordersToCSV,
  orderToDetailedCSV,
  hasOrderChanged,
  logError,
  logInfo,
  logDebug,
  logExecutionTime
} from '../utils';

class OrderModel {
  private dbFilePath: string;
  private lockFilePath: string;
  private orders: ProcessedOrder[] = [];
  private initialized: boolean = false;

  constructor() {
    this.dbFilePath = path.join(__dirname, '../../data/orders.json');
    this.lockFilePath = path.join(__dirname, '../../data/orders.lock');
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.orders = await loadJsonFromFile<ProcessedOrder[]>(this.dbFilePath, []);
      this.initialized = true;
      logDebug(`Zainicjalizowano model zamówień. Wczytano ${this.orders.length} zamówień.`);
    } catch (error) {
      logError('Błąd podczas inicjalizacji modelu zamówień:', error);
      this.orders = [];
      this.initialized = true;
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      const releaseLock = await acquireFileLock(this.lockFilePath);

      try {
        await saveJsonToFile(this.dbFilePath, this.orders);
        logDebug(`Zapisano ${this.orders.length} zamówień do pliku.`);
      } finally {
        releaseLock();
      }
    } catch (error) {
      logError('Błąd podczas zapisywania zamówień do pliku:', error);
      throw error;
    }
  }

  async updateOrders(newOrders: ProcessedOrder[]): Promise<{ updated: number, unchanged: number, added: number }> {
    return await logExecutionTime('updateOrders', async () => {
      await this.init();

      let updated = 0;
      let unchanged = 0;
      let added = 0;

      for (const newOrder of newOrders) {
        const existingOrderIndex = this.orders.findIndex(order => order.orderID === newOrder.orderID);

        if (existingOrderIndex !== -1) {
          const existingOrder = this.orders[existingOrderIndex];

          if (hasOrderChanged(existingOrder, newOrder)) {
            this.orders[existingOrderIndex] = {
              ...newOrder,
              date: new Date().toISOString()
            };
            updated++;
          } else {
            unchanged++;
          }
        } else {
          this.orders.push({
            ...newOrder,
            date: new Date().toISOString()
          });
          added++;
        }
      }

      if (updated > 0 || added > 0) {
        await this.saveToFile();
        logInfo(`Zaktualizowano bazę zamówień. Dodano: ${added}, zaktualizowano: ${updated}, bez zmian: ${unchanged}`);
      } else {
        logInfo(`Brak zmian w bazie zamówień. Sprawdzono ${newOrders.length} zamówień.`);
      }

      return { updated, unchanged, added };
    });
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
    return ordersToCSV(orders);
  }

  orderToDetailedCSV(order: ProcessedOrder): string {
    return orderToDetailedCSV(order);
  }
}

const orderModel = new OrderModel();
export default orderModel; 