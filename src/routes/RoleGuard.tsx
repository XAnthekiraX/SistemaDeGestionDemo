import { Navigate } from 'react-router-dom';
import type { UserRole } from '@/types/auth.types';
import { useAuthStore } from '../store/auth.store';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const userRole = useAuthStore((s) => s.user?.role);
  if (!userRole || !allowedRoles.includes(userRole)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};
