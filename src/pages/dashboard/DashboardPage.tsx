import { useQuery } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { metricasApi } from '@/api/endpoints';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageLoader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import type { Metricas } from '@/types/api.types';

const MetricCard = ({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon icon={icon} className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['metricas-dashboard'],
    queryFn: async () => {
      const res = await metricasApi.get();
      return res.data.data as Metricas;
    },
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <PageContainer title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="mdi:package-variant" label="Productos" value={data?.total_products ?? 0} color="bg-primary" />
        <MetricCard icon="mdi:warehouse" label="Stock Total" value={data?.total_stock ?? 0} color="bg-success" />
        <MetricCard icon="mdi:truck-delivery" label="Pedidos Pendientes" value={data?.pending_shipments ?? 0} color="bg-warning" />
        <MetricCard icon="mdi:account-group" label="Clientes" value={data?.total_customers ?? 0} color="bg-info" />
      </div>
    </PageContainer>
  );
};
