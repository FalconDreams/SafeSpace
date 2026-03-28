import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex min-h-[44px] items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 rounded-[var(--radius-btn)] shadow-sm',
    secondary: 'border border-border bg-surface text-text hover:bg-surface-muted rounded-[var(--radius-btn)]',
    danger: 'bg-danger text-white hover:bg-red-600 rounded-[var(--radius-btn)] shadow-sm',
    ghost: 'text-text-muted hover:bg-surface-muted hover:text-text rounded-[var(--radius-btn)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
