export interface InventarioItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
    barcode: string;
  };
  updated_at: string;
}

export interface StockItem {
  product_id: string;
  quantity: number;
}

export interface AddStockRequest {
  items: StockItem[];
  origin: 'production' | 'other';
  notes?: string;
}

export interface AdjustStockRequest {
  quantity: number;
}

export interface InventarioResponse {
  estado: 'exito';
  data: InventarioItem[];
}

export interface AddStockResponse {
  estado: 'exito';
  data: Array<{
    product_id: string;
    quantity_added: number;
  }>;
}

export interface AdjustStockResponse {
  estado: 'exito';
  data: InventarioItem;
}

export type SortOption = '' | 'quantity:asc' | 'quantity:desc' | 'updated_at:asc' | 'updated_at:desc';
