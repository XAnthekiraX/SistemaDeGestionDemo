import { useAuthStore, selectUserRole } from '@/store/auth.store';
import type { UserRole } from '@/types/auth.types';

export const useUserRole = () => useAuthStore(selectUserRole);

export const hasRole = (userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};
