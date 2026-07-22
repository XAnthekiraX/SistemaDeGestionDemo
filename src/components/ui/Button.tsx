import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon } from '@iconify/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, disabled, children, icon, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
      secondary: 'bg-secondary text-white hover:bg-slate-600 focus:ring-slate-500',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
      destructive: 'bg-error text-white hover:bg-red-600 focus:ring-red-500',
    };
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-sm min-h-[44px]',
      lg: 'px-6 py-3 text-base min-h-[52px]',
    };

    return (
      <button ref={ref} className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} disabled={disabled || loading} {...props}>
        {loading && <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 mr-2" />}
        {icon && !loading && <Icon icon={icon} className="w-4 h-4 mr-2" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
