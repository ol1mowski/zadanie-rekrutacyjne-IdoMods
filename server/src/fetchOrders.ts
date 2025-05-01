import idoSellService from './services/idoSellService';
import { AxiosError } from 'axios';

async function fetchOrders() {
  try {

    const orders = await idoSellService.getOrders();
    
    console.log(`Pobrano ${orders.length} zamówień.`);
    
    if (orders.length > 0) { 
      console.log('\n=== Podsumowanie ===');
      console.log(`Łączna liczba zamówień: ${orders.length}`);
      
      let totalProducts = 0;
      let totalValue = 0;
      
      orders.forEach(order => {
        totalProducts += order.products.length;
        totalValue += order.orderWorth;
      });
      
      console.log(`Łączna liczba produktów: ${totalProducts}`);
      console.log(`Łączna wartość zamówień: ${totalValue.toFixed(2)} PLN`);
    }
    
    return orders;
  } catch (error: unknown) {
    console.error('Błąd podczas pobierania zamówień:', error);
    
    if (error instanceof AxiosError) {
      if (error.response) {
        console.error('Status błędu:', error.response.status);
        console.error('Dane odpowiedzi:', error.response.data);
        console.error('Nagłówki odpowiedzi:', error.response.headers);
      } else if (error.request) {
        console.error('Brak odpowiedzi:', error.request);
      } else {
        console.error('Komunikat błędu:', error.message);
      }
    }
    
    throw error;
  }
}

if (require.main === module) {
  fetchOrders()
    .then(() => console.log('Zakończono pobieranie zamówień'))
    .catch(err => console.error('Niepowodzenie pobierania zamówień'));
}

export default fetchOrders; 