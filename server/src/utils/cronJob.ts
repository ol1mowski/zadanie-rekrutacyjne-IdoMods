import cron from 'node-cron';
import { OrderService } from '../services/orderService';

export class CronJob {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  startDailyOrdersUpdate(): void {
    cron.schedule('0 0 * * *', async () => {
      console.log('Uruchamianie automatycznej aktualizacji zamówień...');
      try {
        await this.orderService.updateOrders();
        console.log('Zamówienia zostały zaktualizowane pomyślnie.');
      } catch (error) {
        console.error('Błąd podczas automatycznej aktualizacji zamówień:', error);
      }
    });
    
    console.log('Zaplanowano codzienną aktualizację zamówień o północy.');
  }
} 