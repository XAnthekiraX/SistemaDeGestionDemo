import type { Product } from '@/types/product.types';
import type { Customer } from '@/types/customer.types';
import type { InventarioItem } from '@/types/inventario.types';
import type { Shipment } from '@/types/shipment.types';
import type { Movimiento } from '@/types/movimientos.types';

const generateId = () => crypto.randomUUID();

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const mockProducts: Product[] = [
  { id: generateId(), name: 'Paleta de Mango', barcode: 'RP01H7K2X9', barcode_url: '', created_at: daysAgo(30) },
  { id: generateId(), name: 'Paleta de Fresa', barcode: 'RP02J8L3Y0', barcode_url: '', created_at: daysAgo(28) },
  { id: generateId(), name: 'Paleta de Coco', barcode: 'RP03K9M4Z1', barcode_url: '', created_at: daysAgo(25) },
  { id: generateId(), name: 'Paleta de Limón', barcode: 'RP04L0N5A2', barcode_url: '', created_at: daysAgo(22) },
  { id: generateId(), name: 'Paleta de Guanábana', barcode: 'RP05M1O6B3', barcode_url: '', created_at: daysAgo(20) },
  { id: generateId(), name: 'Paleta de Maracuyá', barcode: 'RP06N2P7C4', barcode_url: '', created_at: daysAgo(18) },
  { id: generateId(), name: 'Paleta de Tamarindo', barcode: 'RP07O3Q8D5', barcode_url: '', created_at: daysAgo(15) },
  { id: generateId(), name: 'Paleta de Sandía', barcode: 'RP08P4R9E6', barcode_url: '', created_at: daysAgo(12) },
  { id: generateId(), name: 'Paleta de Piña', barcode: 'RP09Q5S0F7', barcode_url: '', created_at: daysAgo(10) },
  { id: generateId(), name: 'Paleta de Mora', barcode: 'RP10R6T1G8', barcode_url: '', created_at: daysAgo(8) },
  { id: generateId(), name: 'Paleta de Naranja', barcode: 'RP11S7U2H9', barcode_url: '', created_at: daysAgo(5) },
  { id: generateId(), name: 'Paleta de Cereza', barcode: 'RP12T8V3I0', barcode_url: '', created_at: daysAgo(3) },
];

export const mockCustomers: Customer[] = [
  { id: generateId(), name: 'Almacenes Éxito', city: 'Bogotá', document_number: '900123456', created_at: daysAgo(30) },
  { id: generateId(), name: 'Supermarket Carulla', city: 'Medellín', document_number: '900234567', created_at: daysAgo(28) },
  { id: generateId(), name: 'Distribuciones La Torre', city: 'Cali', document_number: '900345678', created_at: daysAgo(25) },
  { id: generateId(), name: 'Tiendas Ara', city: 'Barranquilla', document_number: '900456789', created_at: daysAgo(22) },
  { id: generateId(), name: 'Oxxo Colombia', city: 'Bucaramanga', document_number: '900567890', created_at: daysAgo(20) },
  { id: generateId(), name: 'Éxito Express', city: 'Cartagena', document_number: '900678901', created_at: daysAgo(18) },
  { id: generateId(), name: 'Metro de Medellín', city: 'Medellín', document_number: '900789012', created_at: daysAgo(15) },
  { id: generateId(), name: 'Almacenes Olímpica', city: 'Santa Marta', document_number: '900890123', created_at: daysAgo(12) },
  { id: generateId(), name: 'Farmatodo', city: 'Pereira', document_number: '900901234', created_at: daysAgo(10) },
  { id: generateId(), name: 'D1 Minorista', city: 'Manizales', document_number: '901012345', created_at: daysAgo(8) },
];

function buildInventory(): InventarioItem[] {
  return mockProducts.map((p, i) => ({
    id: generateId(),
    product_id: p.id,
    quantity: [180, 45, 120, 8, 200, 60, 15, 95, 150, 30, 110, 75][i],
    products: { name: p.name, barcode: p.barcode },
    updated_at: daysAgo(Math.floor(Math.random() * 5)),
  }));
}

export const mockInventario = buildInventory();

function buildShipments(): Shipment[] {
  const cust = mockCustomers;
  return [
    {
      id: generateId(), destination: cust[0].name, origin: 'despacho', status: 'por confirmar',
      notes: 'Pedido urgente tienda principal', created_at: daysAgo(2), updated_at: daysAgo(2),
      items: [
        { product_id: mockProducts[0].id, name: mockProducts[0].name, quantity: 30 },
        { product_id: mockProducts[1].id, name: mockProducts[1].name, quantity: 45 },
      ],
    },
    {
      id: generateId(), destination: cust[1].name, origin: 'despacho', status: 'confirmado',
      notes: 'Pedido semanal', created_at: daysAgo(5), updated_at: daysAgo(4),
      items: [
        { product_id: mockProducts[2].id, name: mockProducts[2].name, quantity: 60 },
        { product_id: mockProducts[3].id, name: mockProducts[3].name, quantity: 30 },
        { product_id: mockProducts[4].id, name: mockProducts[4].name, quantity: 15 },
      ],
    },
    {
      id: generateId(), destination: cust[2].name, origin: 'despacho', status: 'confirmado',
      notes: '', created_at: daysAgo(7), updated_at: daysAgo(6),
      items: [
        { product_id: mockProducts[5].id, name: mockProducts[5].name, quantity: 90 },
      ],
    },
    {
      id: generateId(), destination: cust[3].name, origin: 'despacho', status: 'cancelado',
      notes: 'Cancelado por falta de stock', created_at: daysAgo(10), updated_at: daysAgo(9),
      items: [
        { product_id: mockProducts[6].id, name: mockProducts[6].name, quantity: 45 },
        { product_id: mockProducts[7].id, name: mockProducts[7].name, quantity: 60 },
      ],
    },
    {
      id: generateId(), destination: cust[4].name, origin: 'despacho', status: 'por confirmar',
      notes: 'Pedido express', created_at: daysAgo(1), updated_at: daysAgo(1),
      items: [
        { product_id: mockProducts[8].id, name: mockProducts[8].name, quantity: 15 },
        { product_id: mockProducts[9].id, name: mockProducts[9].name, quantity: 30 },
        { product_id: mockProducts[10].id, name: mockProducts[10].name, quantity: 45 },
      ],
    },
    {
      id: generateId(), destination: cust[5].name, origin: 'despacho', status: 'confirmado',
      notes: 'Reabastecimiento quincenal', created_at: daysAgo(14), updated_at: daysAgo(13),
      items: [
        { product_id: mockProducts[0].id, name: mockProducts[0].name, quantity: 75 },
        { product_id: mockProducts[11].id, name: mockProducts[11].name, quantity: 60 },
      ],
    },
  ];
}

export const mockShipments = buildShipments();

function buildMovimientos(): Movimiento[] {
  const entries: Movimiento[] = mockInventario.slice(0, 5).map((inv, i) => ({
    id: generateId(),
    type: 'stock_entry' as const,
    origin: 'production',
    notes: `Producción lote #${100 + i}`,
    created_at: daysAgo(i + 1),
    stock_entry_items: [{
      product_id: inv.product_id,
      products: { name: inv.products.name },
      quantity: inv.quantity,
    }],
  }));

  const exits: Movimiento[] = mockShipments.filter(s => s.status !== 'por confirmar').map((s, i) => ({
    id: s.id,
    type: 'shipment' as const,
    destination: s.destination,
    status: s.status,
    created_at: s.updated_at,
    shipment_items: s.items.map(item => ({
      product_id: item.product_id,
      products: { name: item.name },
      quantity: item.quantity,
    })),
  }));

  return [...entries, ...exits].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export const mockMovimientos = buildMovimientos();
