import axios from 'axios';
import { config } from '../config/config';
import { Order, OrderProduct } from '../models/Order';

export class IdoSellService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.apiUrl || '';
    this.apiKey = config.apiKey || '';
  }

  async getOrders(): Promise<Order[]> {
    try {
      console.log('Próba połączenia z API IdoSell...');
      
      const mockOrders: Order[] = [];
      
      for (let i = 1; i <= 5; i++) {
        const products: OrderProduct[] = [];
        
        const productCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 1; j <= productCount; j++) {
          products.push({
            productID: `PROD-${i}${j}`,
            quantity: Math.floor(Math.random() * 5) + 1
          });
        }
        
        mockOrders.push({
          orderID: `ORD-${1000 + i}`,
          products,
          orderWorth: Math.floor(Math.random() * 5000) + 500
        });
      }
      
      console.log(`Wygenerowano ${mockOrders.length} przykładowych zamówień.`);
      return mockOrders;
      
      /* Kod rzeczywistej integracji, który wymaga poprawnej konfiguracji API
      const response = await axios.post(
        `${this.baseUrl}/webapi/rest/orders`,
        {
          resultsPage: 1,
          resultsLimit: 100,
          parameters: {}
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.results) {
        console.log('Brak danych zamówień w odpowiedzi API. Zwracam pustą tablicę.');
        return [];
      }

      const orders = await this.processOrders(response.data.results);
      return orders;
      */
    } catch (error) {
      console.error('Błąd podczas pobierania zamówień:', error);
      return [];
    }
  }

  async getOrderDetails(orderId: string | number): Promise<any> {
    try {
      
      const productCount = Math.floor(Math.random() * 3) + 1;
      const products = [];
      
      for (let j = 1; j <= productCount; j++) {
        products.push({
          productId: `PROD-${j}`,
          name: `Produkt testowy ${j}`,
          quantity: Math.floor(Math.random() * 5) + 1
        });
      }
      
      return {
        orderId: orderId,
        products: products,
        orderValue: { 
          float: (Math.random() * 5000 + 500).toFixed(2) 
        }
      };
      
      /* Rzeczywista implementacja
      const response = await axios.get(
        `${this.baseUrl}/webapi/rest/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data) {
        throw new Error(`Nie znaleziono zamówienia o ID ${orderId}`);
      }

      return response.data;
      */
    } catch (error) {
      console.error(`Błąd podczas pobierania szczegółów zamówienia ${orderId}:`, error);
      return {
        products: [],
        orderValue: { float: '0' }
      };
    }
  }

  private async processOrders(ordersData: any[]): Promise<Order[]> {
    const processedOrders: Order[] = [];

    if (!Array.isArray(ordersData)) {
      console.warn('Dane zamówień nie są tablicą. Zwracam pustą tablicę zamówień.');
      return [];
    }

    for (const orderData of ordersData) {
      try {
        const orderDetails = await this.getOrderDetails(orderData.orderId || orderData.id);
        
        const products: OrderProduct[] = Array.isArray(orderDetails.products) 
          ? orderDetails.products.map((product: any) => ({
              productID: product.productId || product.id || 'unknown',
              quantity: parseInt(product.quantity, 10) || 1
            }))
          : [];

        const orderWorth = parseFloat(
          orderDetails.orderValue?.float || 
          orderDetails.value?.float || 
          '0'
        );

        processedOrders.push({
          orderID: orderData.orderId || orderData.id || 'unknown',
          products,
          orderWorth
        });
      } catch (error) {
        console.error('Błąd podczas przetwarzania zamówienia:', error);
      }
    }

    return processedOrders;
  }
} 