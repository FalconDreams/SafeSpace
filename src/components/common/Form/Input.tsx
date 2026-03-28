import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', id, ...props }: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`block w-full rounded-lg border bg-surface px-4 py-3 text-text shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-2 sm:text-sm ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-border focus:border-teal-500 focus:ring-teal-500/20'
        } ${className}`}
        {...props}
      />
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-danger' : 'text-text-muted'}`}>{error || helperText}</p>
      )}
    </div>
  );
}
