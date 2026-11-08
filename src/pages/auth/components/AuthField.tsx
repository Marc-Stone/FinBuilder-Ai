import { useState, type KeyboardEvent } from "react";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  inputMode?: "text" | "email" | "tel" | "numeric";
  warnCapsLock?: boolean;
};

export default function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  autoComplete,
  error,
  hint,
  required,
  inputMode,
  warnCapsLock,
}: AuthFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;
  const showCapsLock = Boolean(isPassword && warnCapsLock && capsLock && !error);

  const handleCapsCheck = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isPassword || !warnCapsLock) return;
    if (typeof event.getModifierState === "function") {
      setCapsLock(event.getModifierState("CapsLock"));
    }
  };

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
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleCapsCheck}
          onKeyUp={handleCapsCheck}
          onBlur={() => setCapsLock(false)}
          className={`box-border w-full min-w-0 rounded-md border bg-background-50 py-2.5 text-sm text-foreground-950 transition-colors duration-200 placeholder:text-foreground-400 focus:outline-none focus:ring-2 ${
            icon ? "pl-10" : "pl-3.5"
          } ${isPassword ? "pr-11" : "pr-3.5"} ${
            error
              ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
              : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-foreground-400 transition-colors hover:bg-background-100 hover:text-foreground-700"
          >
            <i className={revealed ? "ri-eye-off-line text-base" : "ri-eye-line text-base"} />
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
          <i className="ri-error-warning-line mt-0.5 text-sm" />
          <span>{error}</span>
        </p>
      ) : showCapsLock ? (
        <p className="mt-1.5 flex items-start gap-1.5 rounded-md border border-accent-200 bg-accent-50 px-2.5 py-1.5 text-xs text-accent-900">
          <i className="ri-alert-line mt-0.5 text-sm" />
          <span>La touche Verr. Maj semble activée.</span>
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-foreground-500">{hint}</p>
      )}
    </div>
  );
}