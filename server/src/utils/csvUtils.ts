import { ProcessedOrder, ProcessedProduct } from '../types/idoSell';

export const escapeCSVField = (value: string | number | undefined): string => {
  if (value === undefined || value === null) {
    return '';
  }
  
  const stringValue = String(value);
  
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

export const ordersToCSV = (orders: ProcessedOrder[]): string => {
  const headers = ['OrderID', 'OrderWorth', 'ProductsCount', 'ProductIDs', 'ProductQuantities', 'Date'];
  let csv = headers.join(',') + '\n';
  
  for (const order of orders) {
    const productIDs = order.products.map(p => p.productID).join(';');
    const productQuantities = order.products.map(p => p.quantity).join(';');
    
    const row = [
      escapeCSVField(order.orderID),
      escapeCSVField(order.orderWorth),
      escapeCSVField(order.products.length),
      escapeCSVField(productIDs),
      escapeCSVField(productQuantities),
      escapeCSVField(order.date || '')
    ];
    
    csv += row.join(',') + '\n';
  }
  
  return csv;
};

export const orderToDetailedCSV = (order: ProcessedOrder | null): string => {
  if (!order) return '';
  
  let csv = `Zamówienie: ${escapeCSVField(order.orderID)}\n`;
  csv += `Wartość zamówienia: ${escapeCSVField(order.orderWorth)}\n`;
  csv += `Data aktualizacji: ${escapeCSVField(order.date || '')}\n\n`;
  
  csv += 'ProductID,Quantity\n';
  
  for (const product of order.products) {
    const row = [
      escapeCSVField(product.productID),
      escapeCSVField(product.quantity)
    ];
    
    csv += row.join(',') + '\n';
  }
  
  return csv;
};

export const objectArrayToCSV = <T>(
  data: T[], 
  headers: string[], 
  mapper: (item: T) => (string | number | undefined)[]
): string => {
  let csv = headers.join(',') + '\n';
  
  for (const item of data) {
    const values = mapper(item).map(escapeCSVField);
    csv += values.join(',') + '\n';
  }
  
  return csv;
}; 