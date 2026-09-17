import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'large';
  tooltip?: string | undefined;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  tooltip,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[styles.button, styles[variant], size === 'large' ? styles.large : '', className].filter(Boolean).join(' ')}
      disabled={disabled}
      title={disabled ? tooltip : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
