import axios, { AxiosError } from 'axios';
import { config } from '../config';
import {
  ProcessedOrder,
  ProcessedProduct
} from '../types/idoSell';

class IdoSellService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = `https://${config.idoSell.panelUrl}/api/admin/v5`;
    this.apiKey = config.idoSell.apiKey || '';
  }


  async getOrders(): Promise<ProcessedOrder[]> {
    try {
      const searchParams = {
        params: {
          orderPrepaidStatus: 'unpaid',
          ordersStatuses: ['finished', 'ready', 'payment_waiting', 'new'],
        },
        resultsPage: 0,
        resultsLimit: 100
      };

      const options = {
        method: 'POST',
        url: `${this.baseUrl}/orders/orders/search`,
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'X-API-KEY': this.apiKey
        },
        data: searchParams
      };

      const response = await axios.request(options);


      if (response.data && response.data.Results && Array.isArray(response.data.Results)) {
        console.log(`API zwróciło ${response.data.Results.length} zamówień`);
        return this.processOrders(response.data.Results);
      } else {
        console.log('Odpowiedź API ma nieprawidłową strukturę', response.data);
        return [];
      }
    } catch (error: unknown) {
      console.error('Błąd podczas pobierania zamówień z idoSell:', error);

      if (error instanceof AxiosError && error.response?.data?.errors?.faultString?.includes('nie podano żadnych parametrów')) {
        console.log('Próba z innymi parametrami...');
        return this.getOrdersAlternative();
      }

      throw error;
    }
  }

  private async getOrdersAlternative(): Promise<ProcessedOrder[]> {
    try {
      const searchParams = {
        params: {
          ordersStatuses: ['finished']
        },
        resultsPage: 0,
        resultsLimit: 50
      };

      const options = {
        method: 'POST',
        url: `${this.baseUrl}/orders/orders/search`,
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'X-API-KEY': this.apiKey
        },
        data: searchParams
      };

      const response = await axios.request(options);


      if (response.data && response.data.Results && Array.isArray(response.data.Results)) {
        console.log(`API zwróciło ${response.data.Results.length} zamówień`);
        return this.processOrders(response.data.Results);
      } else {
        console.log('Odpowiedź API ma nieprawidłową strukturę', response.data);
        return [];
      }
    } catch (error: unknown) {
      console.error('Błąd podczas alternatywnego pobierania zamówień:', error);
      throw error;
    }
  }

  private processOrders(ordersData: any[]): ProcessedOrder[] {
    try {
      if (!Array.isArray(ordersData) || ordersData.length === 0) {
        console.log('Brak danych zamówień do przetworzenia');
        return [];
      }

      if (ordersData.length > 0) {
        console.log('Struktura pierwszego zamówienia:',
          Object.keys(ordersData[0]),
          'Posiada productsResults:',
          !!ordersData[0].orderDetails?.productsResults
        );
      }

      return ordersData
        .filter(order => order && order.orderId && order.orderDetails)
        .map(order => {
          try {
            const orderID = order.orderId;

            const products: ProcessedProduct[] = [];

            const productsData = order.orderDetails?.productsResults;
            if (Array.isArray(productsData)) {
              productsData.forEach(productData => {
                if (productData && productData.productId !== undefined && productData.productQuantity !== undefined) {
                  products.push({
                    productID: String(productData.productId),
                    quantity: productData.productQuantity
                  });
                }
              });
            }

            let orderWorth = 0;
            if (order.orderDetails?.payments?.orderCurrency?.orderProductsCost) {
              orderWorth = parseFloat(order.orderDetails.payments.orderCurrency.orderProductsCost);
            }

            return {
              orderID,
              products,
              orderWorth
            };
          } catch (err) {
            console.error('Błąd podczas przetwarzania pojedynczego zamówienia:', err);
            return null;
          }
        })
        .filter(Boolean) as ProcessedOrder[];
    } catch (err) {
      console.error('Błąd podczas przetwarzania zamówień:', err);
      return [];
    }
  }
}

const idoSellService = new IdoSellService();
export default idoSellService; 