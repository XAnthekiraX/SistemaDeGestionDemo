import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { productsApi, inventarioApi } from '@/api/endpoints';
import { useAuthStore, selectUserRole } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useFormPersist } from '@/hooks/useFormPersist';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Product } from '@/types/product.types';

interface StockEntry {
  product_id: string;
  name: string;
  barcode: string;
  quantity: number;
  packages: number;
  units: number;
}

interface FormDraft {
  items: StockEntry[];
  notes: string;
  scannerMode: boolean;
}

export const InventarioAddStockPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userRole = useAuthStore(selectUserRole);
  const addToast = useUIStore((s) => s.addToast);
  const isAdmin = userRole === 'admin';
  const scannerRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [form, setForm, clearForm] = useFormPersist<FormDraft>('inventario_formDraft', {
    items: [], notes: '', scannerMode: true,
  });
  const [scannerValue, setScannerValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const res = await productsApi.getAll(); return res.data.data as Product[]; },
  });

  const addStockMutation = useMutation({
    mutationFn: () => inventarioApi.addStock({
      items: form.items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      origin: 'production',
      notes: form.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      addToast('Stock registrado correctamente', 'success');
      clearForm();
      navigate('/inventario');
    },
    onError: (err: any) => addToast(err?.response?.data?.mensaje || 'Error al agregar stock', 'error'),
  });

  const filteredProducts = useMemo(() => {
    if (!products || !searchTerm) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [products, searchTerm]);

  useEffect(() => {
    if (form.scannerMode && scannerRef.current) scannerRef.current.focus();
  }, [form.scannerMode]);

  const addItemByBarcode = (barcode: string) => {
    const product = products?.find(p => p.barcode === barcode);
    if (!product) { addToast('Producto no encontrado', 'error'); return; }
    const existing = form.items.find(i => i.product_id === product.id);
    if (existing) {
      setForm(prev => ({
        ...prev,
        items: prev.items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 15, packages: i.packages + 1 } : i),
      }));
    } else {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, { product_id: product.id, name: product.name, barcode: product.barcode, quantity: 15, packages: 1, units: 0 }],
      }));
    }
    addToast(`${product.name} +1 paquete`, 'success');
    setScannerValue('');
  };

  const addItemFromSearch = (product: Product) => {
    const existing = form.items.find(i => i.product_id === product.id);
    if (!existing) {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, { product_id: product.id, name: product.name, barcode: product.barcode, quantity: 0, packages: 0, units: 0 }],
      }));
    }
    setSearchTerm('');
    setShowSuggestions(false);
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

  if (loadingProducts) return <PageLoader />;

  return (
    <PageContainer title="Agregar Stock">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-4">
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
              onKeyDown={e => { if (e.key === 'Enter' && scannerValue.trim()) { addItemByBarcode(scannerValue.trim()); } }}
              placeholder="Escanear o escribir código..." className="w-full px-4 py-3 border border-slate-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 relative">
            <div className="relative">
              <Input ref={searchRef} placeholder="Buscar producto..." value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)} />
              {showSuggestions && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                  {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => addItemFromSearch(p)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">{p.name} <span className="text-slate-400 ml-2">{p.barcode}</span></button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {form.items.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{form.items.length} producto(s)</span>
              <span className="text-sm font-bold text-primary">{totalUnits} unidades totales</span>
            </div>
            <div className="divide-y divide-slate-100">
              {form.items.map(item => (
                <div key={item.product_id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.barcode}</p>
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
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Input label="Notas (opcional)" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Observaciones..." />
        </div>

        <Button onClick={() => addStockMutation.mutate()} loading={addStockMutation.isPending} disabled={form.items.length === 0} className="w-full" icon="mdi:check">
          Registrar Stock ({totalUnits} unidades)
        </Button>
      </div>
    </PageContainer>
  );
};
