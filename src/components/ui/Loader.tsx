import { Icon } from '@iconify/react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader = ({ size = 'md', className = '' }: LoaderProps) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <Icon icon="svg-spinners:ring-resize" className={`${sizeClasses[size]} ${className}`} />;
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader size="lg" />
  </div>
);
