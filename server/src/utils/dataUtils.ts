import { ProcessedOrder, ProcessedProduct } from '../types/idoSell';

export const hasOrderChanged = (
  existingOrder: ProcessedOrder, 
  newOrder: ProcessedOrder
): boolean => {
  if (existingOrder.orderWorth !== newOrder.orderWorth) {
    return true;
  }
  
  if (existingOrder.customerName !== newOrder.customerName) {
    return true;
  }
  
  if (existingOrder.status !== newOrder.status) {
    return true;
  }
  
  if (existingOrder.products && newOrder.products) {
    if (existingOrder.products.length !== newOrder.products.length) {
      return true;
    }
    
    const existingProductMap = new Map<string, number>();
    for (const product of existingOrder.products) {
      existingProductMap.set(product.productID, product.quantity);
    }
    
    for (const newProduct of newOrder.products) {
      const existingQuantity = existingProductMap.get(newProduct.productID);
      
      if (existingQuantity === undefined || existingQuantity !== newProduct.quantity) {
        return true;
      }
    }
  } else if (existingOrder.products || newOrder.products) {
    return true;
  }
  
  return false;
};

export const processOrderData = (orderData: any): ProcessedOrder | null => {
  if (!orderData) {
    return null;
  }
  
  try {
    const orderID = orderData.id || orderData.orderId || orderData.orderID;
    if (!orderID) {
      return null;
    }
    
    const products: ProcessedProduct[] = [];
    
    const productsData = orderData.orderDetails?.productsResults;
    if (Array.isArray(productsData)) {
      productsData.forEach(productData => {
        if (productData) {
          products.push({
            productID: String(productData.productId || productData.id || ''),
            quantity: productData.productQuantity || productData.quantity || 1,
            name: productData.name
          } as any);
        }
      });
    }
    
    let orderWorth = orderData.worth || orderData.orderWorth;
    if (typeof orderWorth !== 'number' && orderData.orderDetails?.payments?.orderCurrency?.orderProductsCost) {
      orderWorth = parseFloat(orderData.orderDetails.payments.orderCurrency.orderProductsCost);
    }
    
    const result: any = {
      orderID,
      products,
      orderWorth: orderWorth || 0
    };
    
    if (orderData.status || orderData.orderStatus) {
      result.status = orderData.status || orderData.orderStatus;
    }
    
    if (orderData.customer) {
      result.customerName = orderData.customer.name;
      result.customerEmail = orderData.customer.email;
    } else if (orderData.customerName) {
      result.customerName = orderData.customerName;
    }
    
    return result;
  } catch (err) {
    console.error('Błąd podczas przetwarzania danych zamówienia:', err);
    return null;
  }
};

export const filterOrders = (
  orders: ProcessedOrder[], 
  filter: { minWorth?: number; maxWorth?: number; productId?: string; }
): ProcessedOrder[] => {
  return orders.filter(order => {
    const { minWorth, maxWorth, productId } = filter;
    
    if (minWorth !== undefined && order.orderWorth < minWorth) {
      return false;
    }
    
    if (maxWorth !== undefined && order.orderWorth > maxWorth) {
      return false;
    }
    
    if (productId !== undefined) {
      const hasProduct = order.products.some(p => p.productID === productId);
      if (!hasProduct) {
        return false;
      }
    }
    
    return true;
  });
};

export const groupOrdersBy = <K extends keyof ProcessedOrder>(
  orders: ProcessedOrder[], 
  groupByField: K
): Record<string, ProcessedOrder[]> => {
  const result: Record<string, ProcessedOrder[]> = {};
  
  for (const order of orders) {
    const key = String(order[groupByField]);
    
    if (!result[key]) {
      result[key] = [];
    }
    
    result[key].push(order);
  }
  
  return result;
};


export const sortOrders = <K extends keyof ProcessedOrder>(
  orders: ProcessedOrder[], 
  sortField: K, 
  ascending: boolean = true
): ProcessedOrder[] => {
  return [...orders].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    
    if (valueA === valueB) return 0;
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return ascending
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    const numA = Number(valueA);
    const numB = Number(valueB);
    
    return ascending ? numA - numB : numB - numA;
  });
}; 