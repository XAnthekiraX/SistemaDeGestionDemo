import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { customersApi } from '@/api/endpoints';
import { useAuthStore, selectUserRole } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Customer } from '@/types/customer.types';

export const CustomersPage = () => {
  const queryClient = useQueryClient();
  const userRole = useAuthStore(selectUserRole);
  const addToast = useUIStore((s) => s.addToast);
  const isAdmin = userRole === 'admin';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', city: '', document_number: '' });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await customersApi.getAll();
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; city: string; document_number: string }) => customersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); addToast('Cliente creado', 'success'); closeModal(); },
    onError: (err: any) => addToast(err?.response?.data?.mensaje || 'Error al crear', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; city: string; document_number: string }) => customersApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); addToast('Cliente actualizado', 'success'); closeModal(); },
    onError: (err: any) => addToast(err?.response?.data?.mensaje || 'Error al actualizar', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); addToast('Cliente eliminado', 'success'); },
    onError: () => addToast('Error al eliminar', 'error'),
  });

  const closeModal = () => { setModalOpen(false); setEditingCustomer(null); setForm({ name: '', city: '', document_number: '' }); };
  const openCreate = () => { setEditingCustomer(null); setForm({ name: '', city: '', document_number: '' }); setModalOpen(true); };
  const openEdit = (c: Customer) => { setEditingCustomer(c); setForm({ name: c.name, city: c.city, document_number: c.document_number }); setModalOpen(true); };

  const handleSubmit = () => {
    if (editingCustomer) updateMutation.mutate({ id: editingCustomer.id, ...form });
    else createMutation.mutate(form);
  };

  const filtered = (data || []).filter(c => {
    if (!search) return true;
    const term = search.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.document_number.includes(term);
  });

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <PageContainer title="Clientes" actions={isAdmin ? <Button icon="mdi:plus" onClick={openCreate}>Nuevo</Button> : undefined}>
      <div className="mb-4">
        <Input placeholder="Buscar por nombre o documento..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} icon="mdi:magnify" />
      </div>
      {paginated.length === 0 ? (
        <EmptyState title="No hay clientes" description="Agrega tu primer cliente" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Ciudad</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Documento</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Creado</th>
                  {isAdmin && <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.city}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.document_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(c.created_at).toLocaleDateString('es-CO')}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary"><Icon icon="mdi:pencil" className="w-4 h-4" /></button>
                        <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-error ml-1"><Icon icon="mdi:delete" className="w-4 h-4" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <span className="text-sm text-slate-500">Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
              </div>
            </div>
          )}
        </div>
      )}
      <Modal open={modalOpen} onClose={closeModal} title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        footer={<>
          <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>{editingCustomer ? 'Guardar' : 'Crear'}</Button>
        </>}>
        <div className="space-y-3">
          <Input label="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre del cliente" />
          <Input label="Ciudad" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Ciudad" />
          <Input label="Número de Documento" value={form.document_number} onChange={e => setForm({ ...form, document_number: e.target.value })} placeholder="NIT o CC" />
        </div>
      </Modal>
    </PageContainer>
  );
};
