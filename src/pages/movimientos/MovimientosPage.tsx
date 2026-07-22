import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { movimientosApi } from '@/api/endpoints';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import type { Movimiento, MovimientosFilters } from '@/types/movimientos.types';

export const MovimientosPage = () => {
  const [filters, setFilters] = useState<MovimientosFilters>({ type: 'all' });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['movimientos', filters],
    queryFn: async () => { const res = await movimientosApi.getAll(filters); return res.data.data; },
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <PageContainer title="Movimientos">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={filters.type || 'all'} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value as MovimientosFilters['type'] }))}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="all">Todos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
        </select>
        <input type="date" value={filters.date || ''} onChange={e => setFilters(prev => ({ ...prev, date: e.target.value || undefined, from: undefined, to: undefined }))}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      {(!data || data.length === 0) ? (
        <EmptyState title="No hay movimientos" description="Los movimientos aparecerán aquí" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tipo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Origen/Destino</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Notas</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Fecha</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m: Movimiento) => {
                  const items = m.type === 'stock_entry' ? m.stock_entry_items : m.shipment_items;
                  return (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                      <td className="px-4 py-3">
                        <Badge variant={m.type === 'stock_entry' ? 'success' : 'info'}>
                          {m.type === 'stock_entry' ? 'Entrada' : 'Salida'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">{m.type === 'stock_entry' ? m.origin : m.destination}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{m.notes || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{new Date(m.created_at).toLocaleDateString('es-CO')}</td>
                      <td className="px-4 py-3">
                        <Icon icon={expandedId === m.id ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-slate-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.map((m: Movimiento) => {
            if (expandedId !== m.id) return null;
            const items = m.type === 'stock_entry' ? m.stock_entry_items : m.shipment_items;
            return (
              <div key={`detail-${m.id}`} className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500 mb-2">Detalle de productos:</p>
                <div className="space-y-1">
                  {items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.products.name}</span>
                      <span className="font-medium text-slate-800">{item.quantity} uds</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
