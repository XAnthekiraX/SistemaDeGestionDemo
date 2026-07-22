import { AppRouter } from './routes/AppRouter';
import { useUIStore } from './store/ui.store';
import { AuthProvider } from './providers/AuthProvider';
import { Icon } from '@iconify/react';

const ToastContainer = () => {
  const toasts = useUIStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-2 right-2 left-2 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 sm:flex-row">
      {toasts.map((toast) => (
        <div key={toast.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-slide-in ${toast.type === 'success' ? 'bg-success' : toast.type === 'error' ? 'bg-error' : 'bg-info'}`}>
          <Icon icon={toast.type === 'success' ? 'mdi:check-circle' : toast.type === 'error' ? 'mdi:alert-circle' : 'mdi:information'} className="w-5 h-5 shrink-0" />
          <span className="text-sm leading-tight">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastContainer />
    </AuthProvider>
  );
};

export default App;
