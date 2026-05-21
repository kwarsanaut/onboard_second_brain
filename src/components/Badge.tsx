import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-stone-100 text-stone-600 border-stone-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  red: 'bg-red-50 text-red-500 border-red-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  yellow: 'bg-amber-50 text-amber-600 border-amber-200',
};

interface Props {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: Props) {
  return (
    <span className={cn('inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md border', variants[variant], className)}>
      {children}
    </span>
  );
}
