import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, placeholder, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-dark mb-1.5">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${error ? 'border-error bg-error/5' : 'border-slate-200'} ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
