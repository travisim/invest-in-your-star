import React, { ReactNode } from 'react';

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export const Button = ({ variant, size, loading, disabled, icon, children }: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
    >
      {icon}
      {children}
    </button>
  );
};
