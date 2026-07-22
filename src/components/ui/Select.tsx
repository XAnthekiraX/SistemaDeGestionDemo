interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = ({ label, error, options, className = '', ...props }: SelectProps) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-dark mb-1.5">{label}</label>}
      <select
        className={`w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5rem] pr-8 ${error ? 'border-error bg-error/5' : 'border-slate-200'} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
};
