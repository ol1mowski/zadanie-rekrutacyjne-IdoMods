import { scheduleJob } from 'node-schedule';
import idoSellService from '../services/idoSellService';
import orderModel from '../models/orderModel';
import { config } from '../config/config';

class OrderScheduler {
  private job: any;
  private isInitialFetchDone: boolean = false;

  initialize(): void {
    const initTime = new Date();
    console.log(`[${initTime.toISOString()}] Inicjalizacja harmonogramu zadań o ${initTime.toLocaleTimeString()}...`);
    
    if (!this.isInitialFetchDone) {
      orderModel.getOrders().then(orders => {
        if (orders.length === 0) {
          console.log(`[${new Date().toISOString()}] Brak danych w bazie. Wykonuję początkowe pobieranie...`);
          this.fetchOrders();
        } else {
          console.log(`[${new Date().toISOString()}] Znaleziono ${orders.length} zamówień w bazie. Pomijam początkowe pobieranie.`);
        }
        this.isInitialFetchDone = true;
      });
    }
    
    if (config.scheduler.enabled) {
      this.job = scheduleJob(config.scheduler.dailyCronExpression, async () => {
        console.log(`[${new Date().toISOString()}] Uruchomiono zaplanowane codzienne pobieranie zamówień...`);
        await this.fetchOrders();
      });

      
      if (this.job && this.job.nextInvocation) {
        const nextRun = this.job.nextInvocation();
        console.log(`[${new Date().toISOString()}] Następne zaplanowane uruchomienie: ${nextRun.toLocaleString()}`);
      }
    } else {
      console.log(`[${new Date().toISOString()}] Scheduler jest wyłączony w konfiguracji.`);
    }
    
    console.log(`[${new Date().toISOString()}] Harmonogram zadań zainicjalizowany pomyślnie.`);
  }

  async fetchOrders(): Promise<void> {
    try {
      const startTime = new Date();
      console.log(`[${startTime.toISOString()}] Rozpoczęcie pobierania zamówień z API idoSell...`);
      
      const orders = await idoSellService.getOrders();
      
      console.log(`[${new Date().toISOString()}] Pobrano ${orders.length} zamówień. Sprawdzanie zmian...`);
      
      const updateResult = await orderModel.updateOrders(orders);
      
      const endTime = new Date();
      const executionTimeMs = endTime.getTime() - startTime.getTime();
      
      if (updateResult.updated > 0 || updateResult.added > 0) {
        console.log(`[${endTime.toISOString()}] Aktualizacja danych zakończona o ${endTime.toLocaleTimeString()}. Czas wykonania: ${executionTimeMs}ms. Dodano nowych: ${updateResult.added}, zaktualizowano zmienionych: ${updateResult.updated}, bez zmian: ${updateResult.unchanged}.`);
      } else {
        console.log(`[${endTime.toISOString()}] Zakończono sprawdzanie o ${endTime.toLocaleTimeString()}. Czas wykonania: ${executionTimeMs}ms. Brak zmian w danych - nie wykonano aktualizacji. Sprawdzono zamówień: ${orders.length}.`);
      }
      
      if (this.job && this.job.nextInvocation) {
        const nextRun = this.job.nextInvocation();
        console.log(`Następne zaplanowane uruchomienie: ${nextRun.toLocaleString()}`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Błąd podczas pobierania i aktualizacji zamówień:`, error);
    }
  }

  stop(): void {
    if (this.job) {
      this.job.cancel();
      const stopTime = new Date();
      console.log(`[${stopTime.toISOString()}] Zadanie schedulera zostało zatrzymane o ${stopTime.toLocaleTimeString()}.`);
    }
  }
  updateSchedule(cronExpression: string): void {
    if (this.job) {
      this.job.cancel();
    }
    
    const updateTime = new Date();
    console.log(`[${updateTime.toISOString()}] Aktualizacja harmonogramu o ${updateTime.toLocaleTimeString()} z nowym wyrażeniem cron: ${cronExpression}`);
    
    this.job = scheduleJob(cronExpression, async () => {
      console.log(`[${new Date().toISOString()}] Uruchomiono zadanie według zaktualizowanego harmonogramu...`);
      await this.fetchOrders();
    });
    
    console.log(`[${new Date().toISOString()}] Harmonogram został zaktualizowany pomyślnie.`);
    
    if (this.job && this.job.nextInvocation) {
      const nextRun = this.job.nextInvocation();
      console.log(`Następne zaplanowane uruchomienie: ${nextRun.toLocaleString()}`);
    }
  }
}

const orderScheduler = new OrderScheduler();
export default orderScheduler; 