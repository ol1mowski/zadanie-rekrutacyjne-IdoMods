import { AxiosError } from 'axios';
import { config } from '../config/config';
import { type ProcessedOrder } from '../types/idoSell';
import { 
  createHttpClient, 
  createSearchParams,
  processOrderData,
  logError,
  logInfo,
  logWarn,
  logDebug,
  retry,
  logExecutionTime
} from '../utils';

class IdoSellService {
  private baseUrl: string;
  private apiKey: string;
  private httpClient: ReturnType<typeof createHttpClient>;

  constructor() {
    this.baseUrl = `https://${config.idoSell.panelUrl}/api/admin/v5`;
    this.apiKey = config.idoSell.apiKey || '';
    
    this.httpClient = createHttpClient(this.baseUrl, {
      'accept': 'application/json',
      'content-type': 'application/json',
      'X-API-KEY': this.apiKey
    });
  }

  async getOrders(): Promise<ProcessedOrder[]> {
    return logExecutionTime('getOrders', async () => {
      try {
        const searchParams = createSearchParams(0, 100, {
          orderPrepaidStatus: 'unpaid',
          ordersStatuses: ['finished', 'ready', 'payment_waiting', 'new']
        });

        logInfo('Pobieranie zamówień z API idoSell', searchParams);
        
        const response = await this.httpClient.post('/orders/orders/search', searchParams);

        if (response.data && response.data.Results && Array.isArray(response.data.Results)) {
          logInfo(`API zwróciło ${response.data.Results.length} zamówień`);
          return this.processOrders(response.data.Results);
        } else {
          logWarn('Odpowiedź API ma nieprawidłową strukturę', response.data);
          return [];
        }
      } catch (error: unknown) {
        logError('Błąd podczas pobierania zamówień z idoSell', error);

        if (error instanceof AxiosError && error.response?.data?.errors?.faultString?.includes('nie podano żadnych parametrów')) {
          logInfo('Próba z innymi parametrami...');
          return this.getOrdersAlternative();
        }

        throw error;
      }
    });
  }

  private async getOrdersAlternative(): Promise<ProcessedOrder[]> {
    return logExecutionTime('getOrdersAlternative', async () => {
      try {
        const searchParams = createSearchParams(0, 50, {
          ordersStatuses: ['finished']
        });

        logInfo('Pobieranie zamówień alternatywną metodą', searchParams);
        
        const response = await retry(
          () => this.httpClient.post('/orders/orders/search', searchParams),
          3,
          1000
        );

        if (response.data && response.data.Results && Array.isArray(response.data.Results)) {
          logInfo(`API zwróciło ${response.data.Results.length} zamówień (alternatywna metoda)`);
          return this.processOrders(response.data.Results);
        } else {
          logWarn('Odpowiedź API ma nieprawidłową strukturę (alternatywna metoda)', response.data);
          return [];
        }
      } catch (error: unknown) {
        logError('Błąd podczas alternatywnego pobierania zamówień', error);
        throw error;
      }
    });
  }

  private processOrders(ordersData: any[]): ProcessedOrder[] {
    try {
      if (!Array.isArray(ordersData) || ordersData.length === 0) {
        logWarn('Brak danych zamówień do przetworzenia');
        return [];
      }

      if (ordersData.length > 0 && process.env.NODE_ENV === 'development') {
        logDebug('Struktura pierwszego zamówienia:', {
          keys: Object.keys(ordersData[0]),
          hasProductsResults: !!ordersData[0].orderDetails?.productsResults
        });
      }

      const processedOrders = ordersData
        .map(orderData => processOrderData(orderData))
        .filter(Boolean) as ProcessedOrder[];
      
      logInfo(`Przetworzono ${processedOrders.length} zamówień z ${ordersData.length} otrzymanych`);
      return processedOrders;
    } catch (err) {
      logError('Błąd podczas przetwarzania zamówień', err);
      return [];
    }
  }
}

const idoSellService = new IdoSellService();
export default idoSellService; 