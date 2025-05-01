import { scheduleJob } from 'node-schedule';
import idoSellService from '../services/idoSellService';
import orderModel from '../models/orderModel';
import { config } from '../config';

class OrderScheduler {
  private job: any;
  private isInitialFetchDone: boolean = false;

  initialize(): void {
    if (!this.isInitialFetchDone) {
      orderModel.getOrders().then(orders => {
        if (orders.length === 0) {
          console.log('Brak danych w bazie. Wykonuję początkowe pobieranie...');
          this.fetchOrders();
        } else {
          console.log(`Znaleziono ${orders.length} zamówień w bazie. Pomijam początkowe pobieranie.`);
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
        console.log(`Następne zaplanowane uruchomienie: ${nextRun}`);
      }
    } else {
      console.log('Scheduler jest wyłączony w konfiguracji.');
    }
    
    console.log('Harmonogram zadań zainicjalizowany pomyślnie.');
  }

  async fetchOrders(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Rozpoczęcie pobierania zamówień z API idoSell...`);
      
      const orders = await idoSellService.getOrders();
      
      console.log(`[${new Date().toISOString()}] Pobrano ${orders.length} zamówień. Aktualizacja bazy danych...`);
      
      await orderModel.updateOrders(orders);
      
      console.log(`[${new Date().toISOString()}] Zamówienia zostały pomyślnie zaktualizowane w bazie danych.`);
      
      if (this.job && this.job.nextInvocation) {
        const nextRun = this.job.nextInvocation();
        console.log(`Następne zaplanowane uruchomienie: ${nextRun}`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Błąd podczas pobierania i aktualizacji zamówień:`, error);
    }
  }

  stop(): void {
    if (this.job) {
      this.job.cancel();
      console.log('Zadanie schedulera zostało zatrzymane.');
    }
  }
  updateSchedule(cronExpression: string): void {
    if (this.job) {
      this.job.cancel();
    }
    
    console.log(`Aktualizacja harmonogramu z nowym wyrażeniem cron: ${cronExpression}`);
    this.job = scheduleJob(cronExpression, async () => {
      console.log(`[${new Date().toISOString()}] Uruchomiono zadanie według zaktualizowanego harmonogramu...`);
      await this.fetchOrders();
    });
    
    console.log('Harmonogram został zaktualizowany pomyślnie.');
    
    if (this.job && this.job.nextInvocation) {
      const nextRun = this.job.nextInvocation();
      console.log(`Następne zaplanowane uruchomienie: ${nextRun}`);
    }
  }
}

const orderScheduler = new OrderScheduler();
export default orderScheduler; 