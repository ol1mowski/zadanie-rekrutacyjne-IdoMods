export interface OrdersSearchParams {
  params?: {
    orderPrepaidStatus?: string;
    ordersStatuses?: string[];
    shippmentStatus?: string;
    couriersName?: string[];
    couriersId?: number[];
    orderPaymentType?: string;
    withMissingSalesDocuments?: string[];
    orderType?: string;
    dropshippingOrderStatus?: string;
    ordersIds?: string[];
    ordersSerialNumbers?: number[];
    clients?: any[];
    ordersRange?: any;
    orderSource?: any;
    products?: any[];
    clientRequestInvoice?: string;
    packages?: any;
    stocks?: any[];
    campaign?: any;
    loyaltyPointsMode?: string;
    orderOperatorLogin?: string;
    orderPackingPersonLogin?: string;
    ordersBy?: any[];
    searchingOperatorTypeMatch?: string;
    ordersDelayed?: string;
    showBundles?: boolean;
    orderExternalId?: string;
    orderCurrency?: string;
  };
  resultsPage?: number;
  resultsLimit?: number;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface Order {
  order_id: string;
  order_source?: string;
  payment_method_cod?: string;
  shipping_method?: string;
  packages?: Package[];
  products: OrderProduct[];
  client?: Client;
  date_add?: string;
  date_approved?: string;
  payment_status_name?: string;
  order_status_name?: string;
  sum: string;
  currency?: string;
}

export interface OrderProduct {
  product_id: string;
  price: string;
  quantity: number;
  stock_id?: string;
  name?: string;
}

export interface Package {
  package_id: string;
}

export interface Client {
  client_id: string;
  email?: string;
}

export interface ProcessedOrder {
  orderID: string;
  products: ProcessedProduct[];
  orderWorth: number;
  date?: string;
}

export interface ProcessedProduct {
  productID: string;
  quantity: number;
}

export interface OrderFilterParams {
  minWorth?: number;
  maxWorth?: number;
}

export interface AuthUser {
  username: string;
  password: string;
}

export interface DatabaseOrder extends ProcessedOrder {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 