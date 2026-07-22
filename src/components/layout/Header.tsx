import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuthStore, selectUser } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

export const Header = () => {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((s) => s.logout);
  const toggleMobileDrawer = useUIStore((s) => s.toggleMobileDrawer);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button onClick={toggleMobileDrawer} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden" aria-label="Abrir menú">
          <Icon icon="mdi:menu" className="w-6 h-6 text-slate-700" />
        </button>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-slate-600 hidden lg:inline">{user.email}</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs capitalize">{user.role}</span>
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-slate-600 hover:text-error transition-colors p-2" aria-label="Cerrar sesión">
          <Icon icon="mdi:logout" className="w-5 h-5 lg:w-4 h-4" />
          <span className="hidden lg:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};
