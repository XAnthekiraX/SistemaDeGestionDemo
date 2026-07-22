import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { shipmentsApi, productsApi, customersApi } from '@/api/endpoints';
import { useAuthStore, selectUserRole } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useFormPersist } from '@/hooks/useFormPersist';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/types/product.types';
import type { Customer } from '@/types/customer.types';
import type { Shipment, ShipmentDifference } from '@/types/shipment.types';

interface ScannedItem {
  product_id: string;
  name: string;
  quantity: number;
}

interface ValidateDraft {
  scannerMode: boolean;
  scannedItems: ScannedItem[];
}

export const ShipmentValidatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userRole = useAuthStore(selectUserRole);
  const addToast = useUIStore((s) => s.addToast);
  const isAdmin = userRole === 'admin';
  const scannerRef = useRef<HTMLInputElement>(null);

  const [form, setForm, clearForm] = useFormPersist<ValidateDraft>(`shipment_validateDraft_${id}`, {
    scannerMode: true, scannedItems: [],
  });
  const [scannerValue, setScannerValue] = useState('');
  const [manualSearch, setManualSearch] = useState('');
  const [differences, setDifferences] = useState<ShipmentDifference[] | null>(null);

  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => { const res = await shipmentsApi.getAll(undefined, undefined, id); return res.data.data as Shipment[]; },
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const res = await productsApi.getAll(); return res.data.data as Product[]; },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => { const res = await customersApi.getAll(); return res.data.data as Customer[]; },
  });

  const shipment = shipments?.[0];

  const validateMutation = useMutation({
    mutationFn: () => shipmentsApi.validate(id!, form.scannedItems.map(i => ({ product_id: i.product_id, quantity: i.quantity }))),
    onSuccess: (res: any) => {
      if (res.data.estado === 'exito') {
        queryClient.invalidateQueries({ queryKey: ['shipments'] });
        addToast('Pedido validado correctamente', 'success');
        clearForm();
        navigate('/shipments');
      } else if (res.data.differences) {
        setDifferences(res.data.differences);
        addToast('Se encontraron diferencias', 'error');
      }
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      if (data?.differences) {
        setDifferences(data.differences);
        addToast('Se encontraron diferencias', 'error');
      } else {
        addToast(data?.mensaje || 'Error al validar', 'error');
      }
    },
  });

  useEffect(() => {
    if (form.scannerMode && scannerRef.current) scannerRef.current.focus();
  }, [form.scannerMode]);

  const addScannedItem = (barcode: string) => {
    const product = products?.find(p => p.barcode === barcode);
    if (!product) { addToast('Producto no encontrado', 'error'); setScannerValue(''); return; }
    const existing = form.scannedItems.find(i => i.product_id === product.id);
    if (existing) {
      setForm(prev => ({ ...prev, scannedItems: prev.scannedItems.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 15 } : i) }));
    } else {
      setForm(prev => ({ ...prev, scannedItems: [...prev.scannedItems, { product_id: product.id, name: product.name, quantity: 15 }] }));
    }
    addToast(`${product.name} +1 paquete escaneado`, 'success');
    setScannerValue('');
    setDifferences(null);
  };

  const updateScannedQuantity = (productId: string, delta: number) => {
    setForm(prev => ({
      ...prev,
      scannedItems: prev.scannedItems.map(i => i.product_id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0),
    }));
    setDifferences(null);
  };

  const removeScannedItem = (productId: string) => {
    setForm(prev => ({ ...prev, scannedItems: prev.scannedItems.filter(i => i.product_id !== productId) }));
    setDifferences(null);
  };

  const getDifferenceForProduct = (productId: string) => differences?.find(d => d.product_id === productId);

  if (isLoading) return <PageLoader />;
  if (!shipment) return <div className="p-6 text-center text-slate-500">Pedido no encontrado</div>;

  return (
    <PageContainer title="Validar Envío">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Shipment info */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-700">Información del pedido</h3>
            <Badge variant={shipment.status === 'por confirmar' ? 'warning' : shipment.status === 'confirmado' ? 'success' : 'error'}>{shipment.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500">Cliente:</span> <span className="font-medium text-slate-800">{shipment.destination}</span></div>
            <div><span className="text-slate-500">Productos:</span> <span className="font-medium text-slate-800">{shipment.items.length}</span></div>
          </div>
        </div>

        {/* Expected items */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <span className="text-sm font-medium text-slate-700">Productos esperados</span>
          </div>
          <div className="divide-y divide-slate-100">
            {shipment.items.map(item => {
              const scanned = form.scannedItems.find(s => s.product_id === item.product_id);
              const diff = getDifferenceForProduct(item.product_id);
              const scannedQty = scanned?.quantity || 0;
              const isCorrect = scannedQty === item.quantity;
              const hasScanned = scannedQty > 0;

              return (
                <div key={item.product_id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">Esperado: {item.quantity} uds</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && hasScanned && (
                      <>
                        <button onClick={() => updateScannedQuantity(item.product_id, -15)} className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center"><Icon icon="mdi:minus" className="w-3 h-3" /></button>
                      </>
                    )}
                    <span className={`text-sm font-bold ${hasScanned ? (isCorrect ? 'text-success' : 'text-warning') : 'text-slate-400'}`}>
                      {scannedQty}/{item.quantity}
                    </span>
                    {isAdmin && hasScanned && (
                      <>
                        <button onClick={() => updateScannedQuantity(item.product_id, 15)} className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center"><Icon icon="mdi:plus" className="w-3 h-3" /></button>
                      </>
                    )}
                    {isAdmin && hasScanned && (
                      <button onClick={() => removeScannedItem(item.product_id)} className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-error">
                        <Icon icon="mdi:close" className="w-3 h-3" />
                      </button>
                    )}
                    {diff && (
                      <Badge variant="error">{diff.error === 'cantidad_incorrecta' ? 'Incorrecto' : diff.error === 'producto_faltante' ? 'Faltante' : 'Sobrante'}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scanner */}
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Escanear producto</label>
            <input ref={scannerRef} type="text" value={scannerValue} onChange={e => setScannerValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && scannerValue.trim()) addScannedItem(scannerValue.trim()); }}
              placeholder="Escanear código de barras..." className="w-full px-4 py-3 border border-slate-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar producto</label>
            <input type="text" value={manualSearch} onChange={e => setManualSearch(e.target.value)}
              placeholder="Buscar por nombre o código..." className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3" />
            {manualSearch.trim() && products && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {products.filter(p => {
                  const term = manualSearch.toLowerCase();
                  return p.name.toLowerCase().includes(term) || p.barcode.toLowerCase().includes(term);
                }).map(p => {
                  const alreadyAdded = form.scannedItems.some(i => i.product_id === p.id);
                  return (
                    <button key={p.id} disabled={alreadyAdded}
                      onClick={() => {
                        if (!alreadyAdded) {
                          setForm(prev => ({ ...prev, scannedItems: [...prev.scannedItems, { product_id: p.id, name: p.name, quantity: 15 }] }));
                          setManualSearch('');
                          setDifferences(null);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${alreadyAdded ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'hover:bg-primary/5 hover:text-primary cursor-pointer'}`}>
                      <span>{p.name}</span>
                      <span className="text-xs font-mono text-slate-400">{p.barcode}</span>
                    </button>
                  );
                })}
                {products.filter(p => {
                  const term = manualSearch.toLowerCase();
                  return p.name.toLowerCase().includes(term) || p.barcode.toLowerCase().includes(term);
                }).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-2">No se encontraron productos</p>
                )}
              </div>
            )}
          </div>
        )}

        <Button onClick={() => validateMutation.mutate()} loading={validateMutation.isPending} disabled={form.scannedItems.length === 0} className="w-full" icon="mdi:check-circle">
          Validar Pedido
        </Button>
      </div>
    </PageContainer>
  );
};
