import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { productsApi } from '@/api/endpoints';
import { useAuthStore, selectUserRole } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Product } from '@/types/product.types';

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const userRole = useAuthStore(selectUserRole);
  const addToast = useUIStore((s) => s.addToast);
  const isAdmin = userRole === 'admin';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const res = await productsApi.getAll(); return res.data.data; },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => productsApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); addToast('Producto creado', 'success'); closeModal(); },
    onError: (err: any) => addToast(err?.response?.data?.mensaje || 'Error al crear', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => productsApi.update(id, { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); addToast('Producto actualizado', 'success'); closeModal(); },
    onError: (err: any) => addToast(err?.response?.data?.mensaje || 'Error al actualizar', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); addToast('Producto eliminado', 'success'); },
    onError: () => addToast('Error al eliminar', 'error'),
  });

  const closeModal = () => { setModalOpen(false); setEditingProduct(null); setName(''); };
  const openCreate = () => { setEditingProduct(null); setName(''); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setName(p.name); setModalOpen(true); };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editingProduct) updateMutation.mutate({ id: editingProduct.id, name });
    else createMutation.mutate({ name });
  };

  const filtered = (data || []).filter(p => {
    if (!search) return true;
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.barcode.toLowerCase().includes(term);
  });

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <PageContainer title="Productos" actions={isAdmin ? <Button icon="mdi:plus" onClick={openCreate}>Nuevo</Button> : undefined}>
      <div className="mb-4">
        <Input placeholder="Buscar por nombre o código..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} icon="mdi:magnify" />
      </div>
      {paginated.length === 0 ? (
        <EmptyState title="No hay productos" description="Agrega tu primer producto" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Código</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Creado</th>
                  {isAdmin && <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{p.barcode}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(p.created_at).toLocaleDateString('es-CO')}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary"><Icon icon="mdi:pencil" className="w-4 h-4" /></button>
                        <button onClick={() => deleteMutation.mutate(p.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-error ml-1"><Icon icon="mdi:delete" className="w-4 h-4" /></button>
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
      <Modal open={modalOpen} onClose={closeModal} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        footer={<>
          <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>{editingProduct ? 'Guardar' : 'Crear'}</Button>
        </>}>
        <Input label="Nombre del Producto" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Paleta de Mango" />
      </Modal>
    </PageContainer>
  );
};
