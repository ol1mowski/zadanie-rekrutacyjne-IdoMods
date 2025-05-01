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
  const headers = ['orderID', 'orderWorth', 'customerName', 'status', 'date', 'productsCount'];
  let csv = headers.join(',') + '\n';
  
  for (const order of orders) {
    const products = order.products || [];
    const productsCount = products.length;
    
    const row = [
      escapeCSVField(order.orderID),
      escapeCSVField(order.orderWorth),
      escapeCSVField(order.customerName || ''),
      escapeCSVField(order.status || ''),
      escapeCSVField(order.date || ''),
      escapeCSVField(productsCount)
    ];
    
    csv += row.join(',') + '\n';
  }
  
  return csv;
};

export const orderToDetailedCSV = (order: ProcessedOrder | null): string => {
  if (!order) return '';
  
  const headers = ['orderID', 'orderWorth', 'customerName', 'customerEmail', 'customerPhone', 'status', 'date', 'shippingAddress', 'paymentMethod', 'products'];
  
  let csv = headers.join(',') + '\n';
  
  const products = order.products || [];
  const productsStr = products.map(p => p.name || p.productID).join('; ');
  
  const orderRow = [
    escapeCSVField(order.orderID),
    escapeCSVField(order.orderWorth),
    escapeCSVField(order.customerName || ''),
    escapeCSVField(order.customerEmail || ''),
    escapeCSVField(order.customerPhone || ''),
    escapeCSVField(order.status || ''),
    escapeCSVField(order.date || ''),
    escapeCSVField(order.shippingAddress || ''),
    escapeCSVField(order.paymentMethod || ''),
    escapeCSVField(productsStr)
  ];
  
  csv += orderRow.join(',') + '\n';
  
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