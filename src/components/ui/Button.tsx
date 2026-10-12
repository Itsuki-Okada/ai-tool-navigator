import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-[background,border-color,color,transform,box-shadow] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-ink-950 shadow-[0_0_0_1px_rgb(95_227_220/0.4),0_8px_30px_-8px_rgb(95_227_220/0.55)] hover:bg-accent-soft',
  secondary: 'glass text-fg hover:border-accent/40 hover:text-white',
  ghost: 'text-fg-soft hover:bg-white/5 hover:text-fg',
  danger: 'border border-danger/30 text-danger hover:bg-danger/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-13 px-6 text-base',
};

interface Common {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cx(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function LinkButton({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cx(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </a>
  );
}
