export interface ApiError {
  estado: 'error';
  mensaje?: string;
  message?: string;
}

export interface StockError {
  product_id: string;
  name: string;
  requested: number;
  available: number;
}

export interface StockInsufficientErrorResponse extends ApiError {
  estado: 'error';
  mensaje: 'Stock insuficiente';
  stock_errors: StockError[];
}

export interface Metricas {
  total_products: number;
  total_stock: number;
  pending_shipments: number;
  total_customers: number;
}

export interface MetricasResponse {
  estado: 'exito';
  data: Metricas;
}
