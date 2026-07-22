import { useAuthStore, selectIsAuthenticated, selectUser } from '@/store/auth.store';

export const useAuth = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((s) => s.logout);
  return { isAuthenticated, user, logout };
};
