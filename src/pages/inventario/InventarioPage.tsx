import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { inventarioApi } from '@/api/endpoints';
import { useUIStore } from '@/store/ui.store';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import type { InventarioItem, SortOption } from '@/types/inventario.types';

export const InventarioPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  const [sort, setSort] = useState<SortOption>('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventario', sort],
    queryFn: async () => { const res = await inventarioApi.getAll(sort || undefined); return res.data.data; },
  });

  const getStockColor = (qty: number) => {
    if (qty < 15) return 'bg-error/10 text-error';
    if (qty < 90) return 'bg-warning/10 text-warning';
    return 'bg-success/10 text-success';
  };

  const getStockBadge = (qty: number) => {
    if (qty < 15) return 'error' as const;
    if (qty < 90) return 'warning' as const;
    return 'success' as const;
  };

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <PageContainer title="Inventario">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Sin orden</option>
          <option value="quantity:asc">Cantidad ↑</option>
          <option value="quantity:desc">Cantidad ↓</option>
          <option value="updated_at:asc">Fecha ↑</option>
          <option value="updated_at:desc">Fecha ↓</option>
        </select>
        <button onClick={() => navigate('/inventario/create')}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Icon icon="mdi:plus" className="w-4 h-4" /> Agregar Stock
        </button>
      </div>
      {(!data || data.length === 0) ? (
        <EmptyState title="Inventario vacío" description="Registra stock para ver los productos aquí" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Producto</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Código</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Cantidad</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Última Actualización</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: InventarioItem) => (
                  <tr key={item.id} className={`border-b border-slate-100 ${getStockColor(item.quantity)}/5`}>
                    <td className="px-4 py-3 text-sm text-slate-800">{item.products.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{item.products.barcode}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStockBadge(item.quantity)}>{item.quantity} uds</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(item.updated_at).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
