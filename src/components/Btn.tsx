import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-200',
  secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700',
  ghost: 'hover:bg-slate-100 text-slate-600',
  danger: 'bg-rose-50 hover:bg-rose-100 text-rose-600',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

interface ButtonProps extends BaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  href?: undefined;
}

interface LinkProps extends BaseProps {
  href: string;
}

type Props = ButtonProps | LinkProps;

export default function Btn({ variant = 'primary', size = 'md', className, children, ...rest }: Props) {
  const cls = cn(
    'inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className
  );

  if ('href' in rest && rest.href) {
    return <Link href={rest.href} className={cls}>{children}</Link>;
  }

  const { href: _href, ...btnProps } = rest as ButtonProps & { href?: undefined };
  return <button className={cls} {...btnProps}>{children}</button>;
}
