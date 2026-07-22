export type ShipmentStatus = 'por confirmar' | 'confirmado' | 'cancelado';

export interface ShipmentItem {
  product_id: string;
  name: string;
  quantity: number;
}

export interface Shipment {
  id: string;
  destination: string;
  origin: string;
  status: ShipmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: ShipmentItem[];
}

export interface CreateShipmentRequest {
  customer_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  notes?: string;
}

export interface ValidatedItem {
  product_id: string;
  quantity: number;
}

export interface ShipmentDifference {
  product_id: string;
  name: string;
  error: 'cantidad_incorrecta' | 'producto_faltante' | 'producto_no_esperado';
  esperado?: number;
  recibido?: number;
}

export interface ValidateShipmentSuccessResponse {
  estado: 'exito';
  message: string;
  id: string;
  status: 'confirmado';
}

export interface ValidateShipmentErrorResponse {
  estado: 'error';
  differences: ShipmentDifference[];
}

export interface ShipmentsResponse {
  estado: 'exito';
  data: Shipment[];
}

export interface ShipmentResponse {
  estado: 'exito';
  data: Shipment;
}

export interface CancelShipmentResponse {
  estado: 'exito';
  message: string;
  stock_returned: number;
}

export type ShipmentFilter = ShipmentStatus | '';
