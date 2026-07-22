import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { LoginRequest, LoginResponse, RefreshTokenResponse } from '@/types/auth.types';
import type { CustomersResponse, CustomerResponse, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer.types';
import type { ProductsResponse, ProductResponse, CreateProductRequest, UpdateProductRequest } from '@/types/product.types';
import type { InventarioResponse, AddStockResponse, AdjustStockResponse, AddStockRequest, AdjustStockRequest, SortOption } from '@/types/inventario.types';
import type { ShipmentsResponse, ShipmentResponse, CancelShipmentResponse, CreateShipmentRequest, ValidateShipmentSuccessResponse, ValidateShipmentErrorResponse, ValidatedItem } from '@/types/shipment.types';
import type { MetricasResponse } from '@/types/api.types';
import type { MovimientosResponse, MovimientosFilters } from '@/types/movimientos.types';
import {
  mockLogin, mockRefreshToken,
  mockGetProducts, mockCreateProduct, mockUpdateProduct, mockDeleteProduct,
  mockGetCustomers, mockCreateCustomer, mockUpdateCustomer, mockDeleteCustomer,
  mockGetInventario, mockAddStock, mockAdjustStock,
  mockGetShipments, mockCreateShipment, mockValidateShipment, mockCancelShipment,
  mockGetMetricas, mockGetMovimientos,
} from '../mock/api';

const api: AxiosInstance = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error)
);

function ok<T>(data: T, status = 200): AxiosResponse<T> {
  return { data, status, statusText: 'OK', headers: {}, config: {} as InternalAxiosRequestConfig };
}

function err(status: number, data: unknown): never {
  const error = new Error('Mock API Error') as Error & { response: { status: number; data: unknown } };
  error.response = { status, data };
  throw error;
}

// ─── Route matching helper ──────────────────────────────────────────────
function matchRoute(method: string, url: string): {
  resource: string;
  id?: string;
  action?: string;
} | null {
  const cleanUrl = url.split('?')[0];

  if (cleanUrl === '/public/login' && method === 'POST') return { resource: 'login' };
  if (cleanUrl === '/private/auth/refresh-token' && method === 'POST') return { resource: 'refresh-token' };
  if (cleanUrl === '/private/metricas' && method === 'GET') return { resource: 'metricas' };

  if (cleanUrl.startsWith('/private/validate_shipments/')) {
    const id = cleanUrl.split('/').pop();
    return { resource: 'validate_shipment', id, action: 'validate' };
  }

  if (cleanUrl.match(/^\/private\/customers\/[^/]+$/) && method === 'PUT') {
    return { resource: 'customers', id: cleanUrl.split('/').pop() };
  }
  if (cleanUrl.match(/^\/private\/customers\/[^/]+$/) && method === 'DELETE') {
    return { resource: 'customers', id: cleanUrl.split('/').pop(), action: 'delete' };
  }
  if (cleanUrl === '/private/customers' && method === 'GET') return { resource: 'customers', action: 'list' };
  if (cleanUrl === '/private/customers' && method === 'POST') return { resource: 'customers', action: 'create' };

  if (cleanUrl.match(/^\/private\/products\/[^/]+$/) && method === 'PUT') {
    return { resource: 'products', id: cleanUrl.split('/').pop() };
  }
  if (cleanUrl.match(/^\/private\/products\/[^/]+$/) && method === 'DELETE') {
    return { resource: 'products', id: cleanUrl.split('/').pop(), action: 'delete' };
  }
  if (cleanUrl === '/private/products' && method === 'GET') return { resource: 'products', action: 'list' };
  if (cleanUrl === '/private/products' && method === 'POST') return { resource: 'products', action: 'create' };

  if (cleanUrl.match(/^\/private\/inventario\/[^/]+$/) && method === 'PUT') {
    return { resource: 'inventario', id: cleanUrl.split('/').pop() };
  }
  if (cleanUrl === '/private/inventario' && method === 'GET') return { resource: 'inventario', action: 'list' };
  if (cleanUrl === '/private/inventario' && method === 'POST') return { resource: 'inventario', action: 'create' };

  if (cleanUrl.match(/^\/private\/shipments\/[^/]+$/) && method === 'DELETE') {
    return { resource: 'shipments', id: cleanUrl.split('/').pop(), action: 'delete' };
  }
  if (cleanUrl === '/private/shipments' && method === 'GET') return { resource: 'shipments', action: 'list' };
  if (cleanUrl === '/private/shipments' && method === 'POST') return { resource: 'shipments', action: 'create' };

  if (cleanUrl === '/private/movimientos' && method === 'GET') return { resource: 'movimientos', action: 'list' };

  return null;
}

function parseParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const qIdx = url.indexOf('?');
  if (qIdx === -1) return params;
  const qs = url.substring(qIdx + 1);
  qs.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return params;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();
  let url = config.url || '';
  if (config.params && Object.keys(config.params).length > 0) {
    const qs = Object.entries(config.params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }
  const route = matchRoute(method, url);
  if (!route) return config;

  const params = parseParams(url);
  const body = config.data;

  let result: unknown;

  switch (route.resource) {
    case 'login': {
      const { email, password } = body as LoginRequest;
      const res = await mockLogin(email, password);
      result = res;
      break;
    }
    case 'refresh-token': {
      result = await mockRefreshToken();
      break;
    }
    case 'metricas': {
      const data = await mockGetMetricas();
      result = { estado: 'exito', data };
      break;
    }
    case 'customers': {
      if (route.action === 'list') result = { estado: 'exito', data: await mockGetCustomers() };
      else if (route.action === 'create') result = { estado: 'exito', data: await mockCreateCustomer(body as CreateCustomerRequest) };
      else if (route.action === 'delete') { await mockDeleteCustomer(route.id!); result = { estado: 'exito', data: null }; }
      else result = { estado: 'exito', data: await mockUpdateCustomer(route.id!, body as UpdateCustomerRequest) };
      break;
    }
    case 'products': {
      if (route.action === 'list') result = { estado: 'exito', data: await mockGetProducts() };
      else if (route.action === 'create') result = { estado: 'exito', data: await mockCreateProduct(body as CreateProductRequest) };
      else if (route.action === 'delete') { await mockDeleteProduct(route.id!); result = { estado: 'exito', data: null }; }
      else result = { estado: 'exito', data: await mockUpdateProduct(route.id!, body as UpdateProductRequest) };
      break;
    }
    case 'inventario': {
      if (route.action === 'list') result = { estado: 'exito', data: await mockGetInventario(params.sort as SortOption) };
      else if (route.action === 'create') result = { estado: 'exito', data: await mockAddStock(body as AddStockRequest) };
      else result = { estado: 'exito', data: await mockAdjustStock(route.id!, body as AdjustStockRequest) };
      break;
    }
    case 'validate_shipment': {
      const res = await mockValidateShipment(route.id!, (body as { items: ValidatedItem[] }).items);
      result = res;
      break;
    }
    case 'shipments': {
      if (route.action === 'list') result = { estado: 'exito', data: await mockGetShipments(params.status, params.search, params.id) };
      else if (route.action === 'create') result = { estado: 'exito', data: await mockCreateShipment(body as CreateShipmentRequest) };
      else {
        const res = await mockCancelShipment(route.id!);
        result = { estado: 'exito', ...res };
      }
      break;
    }
    case 'movimientos': {
      const filters: MovimientosFilters = {
        type: params.type as MovimientosFilters['type'],
        date: params.date,
        from: params.from,
        to: params.to,
        sort: params.sort as MovimientosFilters['sort'],
        limit: params.limit ? parseInt(params.limit) : undefined,
      };
      result = { estado: 'exito', data: await mockGetMovimientos(filters) };
      break;
    }
  }

  // Inject mock response directly
  (config as any)._mockResult = result;
  return config;
}, undefined);

// Override adapter to return mock results
const originalAdapter = api.defaults.adapter;
(api as any).defaults.adapter = async (config: InternalAxiosRequestConfig) => {
  const mockResult = (config as any)._mockResult;
  if (mockResult !== undefined) {
    return { data: mockResult, status: 200, statusText: 'OK', headers: {}, config } as AxiosResponse;
  }
  return originalAdapter ? originalAdapter(config) : Promise.reject(new Error('No adapter'));
};

// Auth API for direct use in LoginPage
export const authApi = {
  login: async (data: LoginRequest) => {
    const result = await mockLogin(data.email, data.password);
    return ok<LoginResponse>(result);
  },
  refreshToken: async (data: { refresh_token: string }) => {
    const result = await mockRefreshToken();
    return ok<RefreshTokenResponse>(result);
  },
};

export { api };
