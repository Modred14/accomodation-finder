// components/ui/Select.jsx
export default function Select({ label, error, hint, className = "", id, children, ...props }) {
  const inputId = id || props.name;
  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <select
        id={inputId}
        className={`w-full rounded-lg border bg-paper px-3.5 py-2.5 text-[15px] text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
          error ? "border-danger-500" : "border-border"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger-600">{error}</span>}
    </label>
  );
}
