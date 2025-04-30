export interface OrderProduct {
  productID: number | string;
  quantity: number;
}

export interface Order {
  orderID: number | string;
  products: OrderProduct[];
  orderWorth: number;
}

export interface OrderFilter {
  minWorth?: number;
  maxWorth?: number;
} 