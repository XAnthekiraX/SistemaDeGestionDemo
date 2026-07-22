import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const PageContainer = ({ title, children, actions }: PageContainerProps) => {
  return (
    <div className="p-3 lg:p-6 w-screen lg:w-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 lg:mb-6">
        <h1 className={`text-xl lg:text-2xl font-bold text-slate-800 ${title === 'Agregar Stock' || title === 'Nuevo Envío' ? 'w-0 h-0 lg:w-auto lg:h-auto lg:overflow-auto overflow-hidden' : ''}`}>{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
};
