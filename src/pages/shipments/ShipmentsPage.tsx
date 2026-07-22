import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { shipmentsApi } from '@/api/endpoints';
import { useAuthStore, selectUserRole } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { Shipment, ShipmentFilter } from '@/types/shipment.types';
import { generateShipmentPDF } from '@/utils/pdfGenerator';

export const ShipmentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userRole = useAuthStore(selectUserRole);
  const addToast = useUIStore((s) => s.addToast);
  const isAdmin = userRole === 'admin';

  const [filter, setFilter] = useState<ShipmentFilter>('');
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shipments', filter, search],
    queryFn: async () => { const res = await shipmentsApi.getAll(filter || undefined, search || undefined); return res.data.data; },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => shipmentsApi.cancel(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); addToast('Pedido cancelado', 'success'); },
    onError: () => addToast('Error al cancelar', 'error'),
  });

  const getStatusBadge = (status: Shipment['status']) => {
    switch (status) {
      case 'por confirmar': return 'warning';
      case 'confirmado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <PageContainer title="Envíos" actions={<Button icon="mdi:plus" onClick={() => navigate('/shipments/new')}>Nuevo Envío</Button>}>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value as ShipmentFilter)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Todos</option>
          <option value="por confirmar">Por Confirmar</option>
          <option value="confirmado">Confirmados</option>
          <option value="cancelado">Cancelados</option>
        </select>
        <Input placeholder="Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {(!data || data.length === 0) ? (
        <EmptyState title="No hay envíos" description="Crea tu primer envío" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Cliente</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Productos</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Estado</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Fecha</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s: Shipment) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{s.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{s.destination}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.items.length} producto(s)</td>
                    <td className="px-4 py-3"><Badge variant={getStatusBadge(s.status)}>{s.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(s.created_at).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button onClick={() => generateShipmentPDF(s)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary" title="PDF">
                        <Icon icon="mdi:file-pdf-box" className="w-4 h-4" />
                      </button>
                      {s.status === 'por confirmar' && (
                        <button onClick={() => navigate(`/shipments/validate/${s.id}`)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-success" title="Validar">
                          <Icon icon="mdi:check-circle" className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => cancelMutation.mutate(s.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-error" title="Eliminar">
                          <Icon icon="mdi:delete" className="w-4 h-4" />
                        </button>
                      )}
                    </td>
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
