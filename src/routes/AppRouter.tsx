import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, selectUserRole, selectIsAuthenticated } from '@/store/auth.store';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { InventarioPage } from '@/pages/inventario/InventarioPage';
import { InventarioAddStockPage } from '@/pages/inventario/InventarioAddStockPage';
import { MovimientosPage } from '@/pages/movimientos/MovimientosPage';
import { ShipmentsPage } from '@/pages/shipments/ShipmentsPage';
import { ShipmentCreatePage } from '@/pages/shipments/ShipmentCreatePage';
import { ShipmentValidatePage } from '@/pages/shipments/ShipmentValidatePage';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useUIStore } from '@/store/ui.store';
import type { UserRole } from '@/types/auth.types';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const mobileDrawerOpen = useUIStore((s) => s.mobileDrawerOpen);
  const closeMobileDrawer = useUIStore((s) => s.closeMobileDrawer);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${mobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeMobileDrawer} />
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Header />
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
};

const RedirectIfAuthenticated = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  if (isLoading) return null;
  if (isAuthenticated) {
    const role = useAuthStore(selectUserRole);
    const redirectPath: Record<UserRole, string> = { admin: '/dashboard', despacho: '/dashboard', produccion: '/inventario' };
    return <Navigate to={role ? redirectPath[role] : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

const RedirectByRole = () => {
  const isLoading = useAuthStore((s) => s.isLoading);
  const role = useAuthStore(selectUserRole);
  if (isLoading) return null;
  const redirectPath: Record<UserRole, string> = { admin: '/dashboard', despacho: '/shipments', produccion: '/inventario' };
  return <Navigate to={role ? redirectPath[role] : '/login'} replace />;
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
      <Route path="/" element={<RedirectByRole />} />
      <Route path="/dashboard" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'despacho', 'produccion']}><AppLayout><DashboardPage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'despacho']}><AppLayout><CustomersPage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'despacho', 'produccion']}><AppLayout><ProductsPage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/inventario" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'produccion']}><AppLayout><InventarioPage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/inventario/create" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'produccion']}><AppLayout><InventarioAddStockPage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/movimientos" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'produccion', 'despacho']}><AppLayout><MovimientosPage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/shipments" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'despacho']}><AppLayout><ShipmentsPage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/shipments/new" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'despacho']}><AppLayout><ShipmentCreatePage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/shipments/validate/:id" element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'despacho']}><AppLayout><ShipmentValidatePage /></AppLayout></RoleGuard></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
