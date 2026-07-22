import { Icon } from '@iconify/react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon = 'mdi:folder-open', title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Icon icon={icon} className="w-12 h-12 text-slate-300 mb-4" />
    <h3 className="text-lg font-medium text-slate-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500">{description}</p>}
  </div>
);
