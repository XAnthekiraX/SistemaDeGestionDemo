export interface MovimientosFilters {
  type?: 'entrada' | 'salida' | 'all';
  date?: string;
  from?: string;
  to?: string;
  sort?: 'created_at:asc' | 'created_at:desc';
  limit?: number;
}

export interface MovimientosResponse {
  estado: 'exito';
  data: Movimiento[];
}

export interface Movimiento {
  id: string;
  type: 'stock_entry' | 'shipment';
  origin?: string;
  notes?: string;
  destination?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  stock_entry_items?: Array<{
    product_id: string;
    products: { name: string };
    quantity: number;
  }>;
  shipment_items?: Array<{
    product_id: string;
    products: { name: string };
    quantity: number;
  }>;
}
