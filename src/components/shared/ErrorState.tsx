import { Icon } from '@iconify/react';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ title = 'Error', message = 'Ocurrió un error inesperado', onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Icon icon="mdi:alert-circle" className="w-12 h-12 text-red-400 mb-4" />
    <h3 className="text-lg font-medium text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 mb-4">{message}</p>
    {onRetry && <Button variant="primary" onClick={onRetry} icon="mdi:refresh">Reintentar</Button>}
  </div>
);
