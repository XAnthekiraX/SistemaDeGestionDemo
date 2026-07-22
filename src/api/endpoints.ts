import { api } from './client';
import type { CreateCustomerRequest, UpdateCustomerRequest, CustomersResponse, CustomerResponse } from '@/types/customer.types';
import type { CreateProductRequest, UpdateProductRequest, ProductsResponse, ProductResponse } from '@/types/product.types';
import type { AddStockRequest, AddStockResponse, AdjustStockRequest, AdjustStockResponse, InventarioResponse, SortOption } from '@/types/inventario.types';
import type { CreateShipmentRequest, ShipmentsResponse, ShipmentResponse, ValidatedItem, ValidateShipmentSuccessResponse, ValidateShipmentErrorResponse, CancelShipmentResponse, ShipmentFilter } from '@/types/shipment.types';
import type { MetricasResponse } from '@/types/api.types';
import type { MovimientosFilters, MovimientosResponse } from '@/types/movimientos.types';

export const customersApi = {
  getAll: () => api.get<CustomersResponse>('/private/customers'),
  create: (data: CreateCustomerRequest) => api.post<CustomerResponse>('/private/customers', data),
  update: (id: string, data: UpdateCustomerRequest) => api.put<CustomerResponse>(`/private/customers/${id}`, data),
  delete: (id: string) => api.delete<void>(`/private/customers/${id}`),
};

export const productsApi = {
  getAll: () => api.get<ProductsResponse>('/private/products'),
  create: (data: CreateProductRequest) => api.post<ProductResponse>('/private/products', data),
  update: (id: string, data: UpdateProductRequest) => api.put<ProductResponse>(`/private/products/${id}`, data),
  delete: (id: string) => api.delete<{ estado: string; message: string }>(`/private/products/${id}`),
};

export const inventarioApi = {
  getAll: (sort?: SortOption) =>
    api.get<InventarioResponse>('/private/inventario', { params: sort ? { sort } : undefined }),
  addStock: (data: AddStockRequest) => api.post<AddStockResponse>('/private/inventario', data),
  adjustStock: (id: string, data: AdjustStockRequest) =>
    api.put<AdjustStockResponse>(`/private/inventario/${id}`, data),
};

export const shipmentsApi = {
  getAll: (filter?: ShipmentFilter, search?: string, id?: string) =>
    api.get<ShipmentsResponse>('/private/shipments', {
      params: { status: filter || undefined, search: search || undefined, id: id || undefined }
    }),
  create: (data: CreateShipmentRequest) => api.post<ShipmentResponse>('/private/shipments', data),
  validate: (id: string, items: ValidatedItem[]) =>
    api.post<ValidateShipmentSuccessResponse | ValidateShipmentErrorResponse>(`/private/validate_shipments/${id}`, { items }),
  cancel: (id: string) => api.delete<CancelShipmentResponse>(`/private/shipments/${id}`),
};

export const metricasApi = {
  get: () => api.get<MetricasResponse>('/private/metricas'),
};

export const movimientosApi = {
  getAll: (filters?: MovimientosFilters) =>
    api.get<MovimientosResponse>('/private/movimientos', { params: filters }),
};
