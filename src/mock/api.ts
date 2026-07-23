import type { User, UserRole } from '@/types/auth.types';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer.types';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product.types';
import type { InventarioItem, AddStockRequest, AdjustStockRequest, SortOption } from '@/types/inventario.types';
import type { Shipment, CreateShipmentRequest, ValidatedItem, ShipmentDifference } from '@/types/shipment.types';
import type { Movimiento, MovimientosFilters } from '@/types/movimientos.types';
import type { Metricas } from '@/types/api.types';
import { mockProducts, mockCustomers, mockInventario, mockShipments, mockMovimientos } from './data';

const LS_KEYS = {
  products: 'demo_products',
  customers: 'demo_customers',
  inventario: 'demo_inventario',
  shipments: 'demo_shipments',
  movimientos: 'demo_movimientos',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

function initIfNeeded() {
  if (!localStorage.getItem(LS_KEYS.products)) save(LS_KEYS.products, mockProducts);
  if (!localStorage.getItem(LS_KEYS.customers)) save(LS_KEYS.customers, mockCustomers);
  if (!localStorage.getItem(LS_KEYS.inventario)) save(LS_KEYS.inventario, mockInventario);
  if (!localStorage.getItem(LS_KEYS.shipments)) save(LS_KEYS.shipments, mockShipments);
  if (!localStorage.getItem(LS_KEYS.movimientos)) save(LS_KEYS.movimientos, mockMovimientos);
}

initIfNeeded();

function delay(ms = 300) {
  return new Promise(r => setTimeout(r, ms + Math.random() * 200));
}

function uuid() {
  return crypto.randomUUID();
}

function generateBarcode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RP${ts}${rand}`;
}

const TEST_USERS: Record<string, { password: string; user: User }> = {
  'admin@demo.com': {
    password: 'admin123',
    user: { id: uuid(), email: 'admin@demo.com', role: 'admin' },
  },
  'despacho@demo.com': {
    password: 'despacho123',
    user: { id: uuid(), email: 'despacho@demo.com', role: 'despacho' },
  },
  'produccion@demo.com': {
    password: 'produccion123',
    user: { id: uuid(), email: 'produccion@demo.com', role: 'produccion' },
  },
};

// ─── Auth ───────────────────────────────────────────────────────────────
export async function mockLogin(email: string, password: string) {
  await delay(400);
  const entry = TEST_USERS[email];
  if (!entry || entry.password !== password) {
    throw { response: { status: 401, data: { estado: 'error', mensaje: 'Credenciales inválidas' } } };
  }
  const fakeToken = `demo_token_${Date.now()}`;
  return {
    estado: 'exito' as const,
    access_token: fakeToken,
    refresh_token: `demo_refresh_${Date.now()}`,
    user: entry.user,
  };
}

export async function mockRefreshToken() {
  await delay(200);
  return {
    access_token: `demo_token_${Date.now()}`,
    refresh_token: `demo_refresh_${Date.now()}`,
    expires_in: 36000,
  };
}

// ─── Products ───────────────────────────────────────────────────────────
export async function mockGetProducts(): Promise<Product[]> {
  await delay();
  return load<Product[]>(LS_KEYS.products, mockProducts);
}

export async function mockCreateProduct(data: CreateProductRequest): Promise<Product> {
  await delay(500);
  const products = load<Product[]>(LS_KEYS.products, mockProducts);
  const product: Product = {
    id: uuid(),
    name: data.name,
    barcode: generateBarcode(),
    barcode_url: '',
    created_at: new Date().toISOString(),
  };
  products.unshift(product);
  save(LS_KEYS.products, products);
  return product;
}

export async function mockUpdateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
  await delay();
  const products = load<Product[]>(LS_KEYS.products, mockProducts);
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) throw { response: { status: 404, data: { estado: 'error', mensaje: 'Producto no encontrado' } } };
  products[idx] = { ...products[idx], name: data.name };
  save(LS_KEYS.products, products);
  return products[idx];
}

export async function mockDeleteProduct(id: string): Promise<void> {
  await delay();
  const products = load<Product[]>(LS_KEYS.products, mockProducts);
  save(LS_KEYS.products, products.filter(p => p.id !== id));
}

// ─── Customers ──────────────────────────────────────────────────────────
export async function mockGetCustomers(): Promise<Customer[]> {
  await delay();
  return load<Customer[]>(LS_KEYS.customers, mockCustomers);
}

export async function mockCreateCustomer(data: CreateCustomerRequest): Promise<Customer> {
  await delay(400);
  const customers = load<Customer[]>(LS_KEYS.customers, mockCustomers);
  if (customers.some(c => c.document_number === data.document_number)) {
    throw { response: { status: 400, data: { estado: 'error', mensaje: 'El numero de documento ya existe' } } };
  }
  const customer: Customer = {
    id: uuid(),
    name: data.name,
    city: data.city,
    document_number: data.document_number,
    created_at: new Date().toISOString(),
  };
  customers.unshift(customer);
  save(LS_KEYS.customers, customers);
  return customer;
}

export async function mockUpdateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
  await delay();
  const customers = load<Customer[]>(LS_KEYS.customers, mockCustomers);
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) throw { response: { status: 404, data: { estado: 'error', mensaje: 'Cliente no encontrado' } } };
  customers[idx] = { ...customers[idx], ...data };
  save(LS_KEYS.customers, customers);
  return customers[idx];
}

export async function mockDeleteCustomer(id: string): Promise<void> {
  await delay();
  const customers = load<Customer[]>(LS_KEYS.customers, mockCustomers);
  save(LS_KEYS.customers, customers.filter(c => c.id !== id));
}

// ─── Inventario ─────────────────────────────────────────────────────────
export async function mockGetInventario(sort?: SortOption): Promise<InventarioItem[]> {
  await delay();
  let items = load<InventarioItem[]>(LS_KEYS.inventario, mockInventario);
  if (sort) {
    const [col, dir] = sort.split(':');
    const asc = dir === 'asc';
    items = [...items].sort((a, b) => {
      const aVal = col === 'quantity' ? a.quantity : new Date(a.updated_at).getTime();
      const bVal = col === 'quantity' ? b.quantity : new Date(b.updated_at).getTime();
      return asc ? aVal - bVal : bVal - aVal;
    });
  }
  return items;
}

export async function mockAddStock(data: AddStockRequest): Promise<{ product_id: string; quantity_added: number }[]> {
  await delay(600);
  const items = load<InventarioItem[]>(LS_KEYS.inventario, mockInventario);
  const results: { product_id: string; quantity_added: number }[] = [];

  for (const req of data.items) {
    const existing = items.find(i => i.product_id === req.product_id);
    if (existing) {
      existing.quantity += req.quantity;
      existing.updated_at = new Date().toISOString();
    } else {
      const products = load<Product[]>(LS_KEYS.products, mockProducts);
      const product = products.find(p => p.id === req.product_id);
      items.push({
        id: uuid(),
        product_id: req.product_id,
        quantity: req.quantity,
        products: { name: product?.name || 'Desconocido', barcode: product?.barcode || '' },
        updated_at: new Date().toISOString(),
      });
    }
    results.push({ product_id: req.product_id, quantity_added: req.quantity });
  }

  save(LS_KEYS.inventario, items);

  const movimientos = load<Movimiento[]>(LS_KEYS.movimientos, mockMovimientos);
  movimientos.unshift({
    id: uuid(),
    type: 'stock_entry',
    origin: data.origin || 'production',
    notes: data.notes || null,
    created_at: new Date().toISOString(),
    stock_entry_items: data.items.map(item => {
      const products = load<Product[]>(LS_KEYS.products, mockProducts);
      const p = products.find(pr => pr.id === item.product_id);
      return { product_id: item.product_id, products: { name: p?.name || '' }, quantity: item.quantity };
    }),
  });
  save(LS_KEYS.movimientos, movimientos);

  return results;
}

export async function mockAdjustStock(id: string, data: AdjustStockRequest): Promise<InventarioItem> {
  await delay();
  const items = load<InventarioItem[]>(LS_KEYS.inventario, mockInventario);
  const item = items.find(i => i.id === id);
  if (!item) throw { response: { status: 404, data: { estado: 'error', mensaje: 'Inventario no encontrado' } } };
  item.quantity += data.quantity;
  item.updated_at = new Date().toISOString();
  save(LS_KEYS.inventario, items);
  return item;
}

// ─── Shipments ──────────────────────────────────────────────────────────
export async function mockGetShipments(status?: string, search?: string, id?: string): Promise<Shipment[]> {
  await delay();
  let shipments = load<Shipment[]>(LS_KEYS.shipments, mockShipments);
  if (status) shipments = shipments.filter(s => s.status === status);
  if (id) shipments = shipments.filter(s => s.id === id);
  if (search) {
    const term = search.toLowerCase();
    shipments = shipments.filter(s => s.destination.toLowerCase().includes(term));
  }
  return shipments;
}

export async function mockCreateShipment(data: CreateShipmentRequest): Promise<Shipment> {
  await delay(500);
  const customers = load<Customer[]>(LS_KEYS.customers, mockCustomers);
  const customer = customers.find(c => c.id === data.customer_id);
  if (!customer) throw { response: { status: 404, data: { estado: 'error', mensaje: 'Cliente no encontrado' } } };

  const products = load<Product[]>(LS_KEYS.products, mockProducts);
  const inventario = load<InventarioItem[]>(LS_KEYS.inventario, mockInventario);

  const stockErrors: { product_id: string; name: string; requested: number; available: number }[] = [];
  for (const item of data.items) {
    const inv = inventario.find(i => i.product_id === item.product_id);
    const available = inv?.quantity || 0;
    if (item.quantity > available) {
      const product = products.find(p => p.id === item.product_id);
      stockErrors.push({
        product_id: item.product_id,
        name: product?.name || item.product_id,
        requested: item.quantity,
        available,
      });
    }
  }

  if (stockErrors.length > 0) {
    throw { response: { status: 400, data: { estado: 'error', mensaje: 'Stock insuficiente', stock_errors: stockErrors } } };
  }

  const shipment: Shipment = {
    id: uuid(),
    destination: customer.name,
    origin: 'despacho',
    status: 'por confirmar',
    notes: data.notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: data.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return { product_id: item.product_id, name: product?.name || 'Desconocido', quantity: item.quantity };
    }),
  };

  const shipments = load<Shipment[]>(LS_KEYS.shipments, mockShipments);
  shipments.unshift(shipment);
  save(LS_KEYS.shipments, shipments);
  return shipment;
}

export async function mockValidateShipment(id: string, items: ValidatedItem[]): Promise<{ estado: 'exito'; message: string } | { estado: 'error'; differences: ShipmentDifference[] }> {
  await delay(600);
  const shipments = load<Shipment[]>(LS_KEYS.shipments, mockShipments);
  const shipment = shipments.find(s => s.id === id);
  if (!shipment) throw { response: { status: 404, data: { estado: 'error', mensaje: 'Pedido no encontrado' } } };

  const expectedMap = new Map(shipment.items.map(i => [i.product_id, i]));
  const scannedMap = new Map<number, { product_id: string; quantity: number }>();
  items.forEach((item, idx) => scannedMap.set(idx, item));

  const differences: ShipmentDifference[] = [];
  const scannedProductIds = new Set(items.map(i => i.product_id));

  for (const exp of shipment.items) {
    const scanned = items.find(i => i.product_id === exp.product_id);
    if (!scanned) {
      differences.push({ product_id: exp.product_id, name: exp.name, error: 'producto_faltante' });
    } else if (scanned.quantity !== exp.quantity) {
      differences.push({ product_id: exp.product_id, name: exp.name, error: 'cantidad_incorrecta', esperado: exp.quantity, recibido: scanned.quantity });
    }
  }

  for (const scanned of items) {
    if (!expectedMap.has(scanned.product_id)) {
      differences.push({ product_id: scanned.product_id, name: 'Desconocido', error: 'producto_no_esperado', recibido: scanned.quantity });
    }
  }

  if (differences.length > 0) {
    return { estado: 'error', differences };
  }

  const inventario = load<InventarioItem[]>(LS_KEYS.inventario, mockInventario);
  for (const item of items) {
    const inv = inventario.find(i => i.product_id === item.product_id);
    if (inv) inv.quantity -= item.quantity;
  }
  save(LS_KEYS.inventario, inventario);

  shipment.status = 'confirmado';
  shipment.updated_at = new Date().toISOString();
  save(LS_KEYS.shipments, shipments);

  const movimientos = load<Movimiento[]>(LS_KEYS.movimientos, mockMovimientos);
  movimientos.unshift({
    id: uuid(),
    type: 'shipment',
    destination: shipment.destination,
    status: 'confirmado',
    created_at: new Date().toISOString(),
    shipment_items: items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return { product_id: item.product_id, products: { name: product?.name || 'Desconocido' }, quantity: item.quantity };
    }),
  });
  save(LS_KEYS.movimientos, movimientos);

  return { estado: 'exito', message: 'Pedido validado correctamente' };
}

export async function mockCancelShipment(id: string): Promise<{ message: string; stock_returned: number }> {
  await delay(400);
  const shipments = load<Shipment[]>(LS_KEYS.shipments, mockShipments);
  const shipment = shipments.find(s => s.id === id);
  if (!shipment) throw { response: { status: 404, data: { estado: 'error', mensaje: 'Pedido no encontrado' } } };

  if (shipment.status === 'cancelado') {
    throw { response: { status: 400, data: { estado: 'error', mensaje: 'Shipment ya cancelado' } } };
  }

  let stockReturned = 0;

  if (shipment.status === 'confirmado') {
    const inventario = load<InventarioItem[]>(LS_KEYS.inventario, mockInventario);
    for (const item of shipment.items) {
      const inv = inventario.find(i => i.product_id === item.product_id);
      if (inv) {
        inv.quantity += item.quantity;
        stockReturned += item.quantity;
      }
    }
    save(LS_KEYS.inventario, inventario);
    shipment.status = 'cancelado';
    shipment.updated_at = new Date().toISOString();
    save(LS_KEYS.shipments, shipments);

    const movimientos = load<Movimiento[]>(LS_KEYS.movimientos, mockMovimientos);
    movimientos.unshift({
      id: uuid(),
      type: 'shipment',
      destination: shipment.destination,
      status: 'cancelado',
      created_at: new Date().toISOString(),
      shipment_items: shipment.items.map(item => ({
        product_id: item.product_id,
        products: { name: item.name },
        quantity: item.quantity,
      })),
    });
    save(LS_KEYS.movimientos, movimientos);
  } else {
    save(LS_KEYS.shipments, shipments.filter(s => s.id !== id));
  }

  return { message: shipment.status === 'confirmado' ? 'Pedido cancelado' : 'Pedido eliminado', stock_returned: stockReturned };
}

// ─── Metricas ───────────────────────────────────────────────────────────
export async function mockGetMetricas(): Promise<Metricas> {
  await delay();
  const products = load<Product[]>(LS_KEYS.products, mockProducts);
  const inventario = load<InventarioItem[]>(LS_KEYS.inventario, mockInventario);
  const shipments = load<Shipment[]>(LS_KEYS.shipments, mockShipments);
  const customers = load<Customer[]>(LS_KEYS.customers, mockCustomers);

  return {
    total_products: products.length,
    total_stock: inventario.reduce((sum, i) => sum + i.quantity, 0),
    pending_shipments: shipments.filter(s => s.status === 'por confirmar').length,
    total_customers: customers.length,
  };
}

// ─── Movimientos ────────────────────────────────────────────────────────
export async function mockGetMovimientos(filters?: MovimientosFilters): Promise<Movimiento[]> {
  await delay();
  let movimientos = load<Movimiento[]>(LS_KEYS.movimientos, mockMovimientos);

  if (filters?.type && filters.type !== 'all') {
    movimientos = movimientos.filter(m => {
      if (filters.type === 'entrada') return m.type === 'stock_entry';
      if (filters.type === 'salida') return m.type === 'shipment';
      return true;
    });
  }

  if (filters?.date) {
    const [y, mo, d] = filters.date.split('-').map(Number);
    const dayStart = new Date(y, mo - 1, d, 0, 0, 0);
    const dayEnd = new Date(y, mo - 1, d, 23, 59, 59);
    movimientos = movimientos.filter(m => {
      const t = new Date(m.created_at).getTime();
      return t >= dayStart.getTime() && t <= dayEnd.getTime();
    });
  } else if (filters?.from || filters?.to) {
    const fromTime = filters.from ? new Date(filters.from).getTime() : 0;
    const toTime = filters.to ? new Date(filters.to).getTime() : Date.now();
    movimientos = movimientos.filter(m => {
      const t = new Date(m.created_at).getTime();
      return t >= fromTime && t <= toTime;
    });
  }

  const limit = filters?.limit || 50;
  return movimientos.slice(0, limit);
}
