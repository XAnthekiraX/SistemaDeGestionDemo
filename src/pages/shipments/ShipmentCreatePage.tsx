import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { customersApi, productsApi, inventarioApi, shipmentsApi } from '@/api/endpoints';
import { useAuthStore, selectUserRole } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useFormPersist } from '@/hooks/useFormPersist';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Customer } from '@/types/customer.types';
import type { Product } from '@/types/product.types';
import type { InventarioItem } from '@/types/inventario.types';

interface ShipmentItemDraft {
  product_id: string;
  name: string;
  barcode: string;
  quantity: number;
  packages: number;
  units: number;
}

interface FormDraft {
  scannerMode: boolean;
  customerId: string;
  items: ShipmentItemDraft[];
  notes: string;
}

export const ShipmentCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userRole = useAuthStore(selectUserRole);
  const addToast = useUIStore((s) => s.addToast);
  const isAdmin = userRole === 'admin';
  const scannerRef = useRef<HTMLInputElement>(null);

  const [form, setForm, clearForm] = useFormPersist<FormDraft>('shipment_createDraft', {
    scannerMode: true, customerId: '', items: [], notes: '',
  });
  const [scannerValue, setScannerValue] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => { const res = await customersApi.getAll(); return res.data.data as Customer[]; },
  });
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const res = await productsApi.getAll(); return res.data.data as Product[]; },
  });
  const { data: inventario } = useQuery({
    queryKey: ['inventario'],
    queryFn: async () => { const res = await inventarioApi.getAll(); return res.data.data as InventarioItem[]; },
  });

  const createMutation = useMutation({
    mutationFn: () => shipmentsApi.create({
      customer_id: form.customerId,
      items: form.items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      notes: form.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      addToast('Envío creado', 'success');
      clearForm();
      navigate('/shipments');
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      if (data?.stock_errors) {
        data.stock_errors.forEach((e: any) => addToast(`Stock insuficiente: ${e.name} (solicitado: ${e.requested}, disponible: ${e.available})`, 'error'));
      } else {
        addToast(data?.mensaje || 'Error al crear envío', 'error');
      }
    },
  });

  const selectedCustomer = customers?.find(c => c.id === form.customerId);

  const filteredCustomers = useMemo(() => {
    if (!customers || !customerSearch) return [];
    return customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 5);
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    if (!products || !productSearch) return [];
    return products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.barcode.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5);
  }, [products, productSearch]);

  useEffect(() => {
    if (form.scannerMode && scannerRef.current) scannerRef.current.focus();
  }, [form.scannerMode]);

  const addItemByBarcode = (barcode: string) => {
    const product = products?.find(p => p.barcode === barcode);
    if (!product) { addToast('Producto no encontrado', 'error'); setScannerValue(''); return; }
    const existing = form.items.find(i => i.product_id === product.id);
    if (existing) {
      setForm(prev => ({ ...prev, items: prev.items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 15, packages: i.packages + 1 } : i) }));
    } else {
      setForm(prev => ({ ...prev, items: [...prev.items, { product_id: product.id, name: product.name, barcode: product.barcode, quantity: 15, packages: 1, units: 0 }] }));
    }
    addToast(`${product.name} +1 paquete`, 'success');
    setScannerValue('');
  };

  const addItemFromSearch = (product: Product) => {
    if (!form.items.find(i => i.product_id === product.id)) {
      setForm(prev => ({ ...prev, items: [...prev.items, { product_id: product.id, name: product.name, barcode: product.barcode, quantity: 0, packages: 0, units: 0 }] }));
    }
    setProductSearch('');
    setShowProductSuggestions(false);
  };

  const updateItemQuantity = (productId: string, field: 'packages' | 'units', delta: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(i => {
        if (i.product_id !== productId) return i;
        const newPackages = field === 'packages' ? Math.max(0, i.packages + delta) : i.packages;
        const newUnits = field === 'units' ? Math.max(0, i.units + delta) : i.units;
        return { ...i, packages: newPackages, units: newUnits, quantity: newPackages * 15 + newUnits };
      }),
    }));
  };

  const removeItem = (productId: string) => {
    setForm(prev => ({ ...prev, items: prev.items.filter(i => i.product_id !== productId) }));
  };

  const totalUnits = form.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <PageContainer title="Nuevo Envío">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Customer selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
          {selectedCustomer ? (
            <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{selectedCustomer.name}</p>
                <p className="text-xs text-slate-500">{selectedCustomer.city} — {selectedCustomer.document_number}</p>
              </div>
              <button onClick={() => setForm(prev => ({ ...prev, customerId: '' }))} className="p-1.5 hover:bg-slate-200 rounded-lg"><Icon icon="mdi:close" className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="relative">
              <Input placeholder="Buscar cliente..." value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCustomerSuggestions(true); }} onFocus={() => setShowCustomerSuggestions(true)} />
              {showCustomerSuggestions && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-lg">
                  {filteredCustomers.map(c => (
                    <button key={c.id} onClick={() => { setForm(prev => ({ ...prev, customerId: c.id })); setCustomerSearch(''); setShowCustomerSuggestions(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">{c.name} <span className="text-slate-400 ml-2">{c.city}</span></button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product scanner/search */}
        {form.customerId && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setForm(prev => ({ ...prev, scannerMode: true }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${form.scannerMode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Icon icon="mdi:barcode-scan" className="w-4 h-4 mr-1 inline" /> Escáner
              </button>
              <button onClick={() => setForm(prev => ({ ...prev, scannerMode: false }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!form.scannerMode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Icon icon="mdi:keyboard" className="w-4 h-4 mr-1 inline" /> Manual
              </button>
            </div>

            {form.scannerMode ? (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Escanear código de barras</label>
                <input ref={scannerRef} type="text" value={scannerValue} onChange={e => setScannerValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && scannerValue.trim()) addItemByBarcode(scannerValue.trim()); }}
                  placeholder="Escanear o escribir código..." className="w-full px-4 py-3 border border-slate-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-4 relative">
                <Input placeholder="Buscar producto..." value={productSearch} onChange={e => { setProductSearch(e.target.value); setShowProductSuggestions(true); }} onFocus={() => setShowProductSuggestions(true)} />
                {showProductSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                    {filteredProducts.map(p => (
                      <button key={p.id} onClick={() => addItemFromSearch(p)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">{p.name} <span className="text-slate-400 ml-2">{p.barcode}</span></button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Items list */}
            {form.items.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{form.items.length} producto(s)</span>
                  <span className="text-sm font-bold text-primary">{totalUnits} unidades totales</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {form.items.map(item => {
                    const inv = inventario?.find(i => i.product_id === item.product_id);
                    const available = inv?.quantity || 0;
                    const isLow = item.quantity > available;
                    return (
                      <div key={item.product_id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.barcode} {isLow && <span className="text-error">(Stock: {available})</span>}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {isAdmin ? (
                            <>
                              <button onClick={() => updateItemQuantity(item.product_id, 'packages', -1)} className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"><Icon icon="mdi:minus" className="w-4 h-4" /></button>
                              <div className="text-center min-w-[60px]">
                                <p className="text-sm font-bold">{item.packages} x15</p>
                                <p className="text-xs text-slate-500">+ {item.units} uds</p>
                              </div>
                              <button onClick={() => updateItemQuantity(item.product_id, 'packages', 1)} className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"><Icon icon="mdi:plus" className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-primary">{item.quantity} uds</span>
                          )}
                          <button onClick={() => removeItem(item.product_id)} className="w-8 h-8 rounded hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-error ml-2">
                            <Icon icon="mdi:close" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <Input label="Notas (opcional)" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Observaciones del pedido..." />
            </div>

            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={form.items.length === 0} className="w-full" icon="mdi:check">
              Crear Envío ({totalUnits} unidades)
            </Button>
          </>
        )}
      </div>
    </PageContainer>
  );
};
