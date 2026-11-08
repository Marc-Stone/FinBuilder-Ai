type Option = { value: string; label: string };

type AuthSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  icon?: string;
  error?: string;
  required?: boolean;
};

export default function AuthSelect({
  id,
  label,
  value,
  onChange,
  options,
  icon,
  error,
  required,
}: AuthSelectProps) {
  return (
    <div className="w-full min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
      >
        {label}
        {required && <span className="ml-1 text-primary-600">*</span>}
      </label>
      <div className="relative w-full">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-foreground-400">
            <i className={`${icon} text-base`} />
          </span>
        )}
        <select
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`box-border w-full min-w-0 cursor-pointer appearance-none rounded-md border bg-background-50 py-2.5 text-sm text-foreground-950 transition-colors duration-200 focus:outline-none focus:ring-2 ${
            icon ? "pl-10" : "pl-3.5"
          } pr-9 ${
            error
              ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
              : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <i className="ri-arrow-down-s-line pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
      </div>
      {error && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
          <i className="ri-error-warning-line mt-0.5 text-sm" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}