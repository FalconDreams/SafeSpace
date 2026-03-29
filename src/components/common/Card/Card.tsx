import type { ReactNode, MouseEventHandler } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
  hover?: boolean;
  variant?: 'default' | 'info' | 'warning' | 'danger' | 'success';
}

export function Card({
  children,
  className = '',
  onClick,
  hover = false,
  variant = 'default',
}: CardProps) {
  const base = 'rounded-[var(--radius-card)] border p-6';
  const variants = {
    default: 'bg-surface border-border',
    info: 'bg-info-bg border-sage-200',
    warning: 'bg-warning-bg border-bamboo-200',
    danger: 'bg-danger-bg border-red-200',
    success: 'bg-success-bg border-sage-200',
  };
  const interactive = onClick || hover ? 'cursor-pointer transition-all hover:shadow-sm hover:border-bamboo-300' : '';

  return (
    <div className={`${base} ${variants[variant]} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
