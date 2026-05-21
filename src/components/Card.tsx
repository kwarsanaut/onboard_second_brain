import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-7' };

export default function Card({ children, className, padding = 'md' }: Props) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200', paddings[padding], className)}>
      {children}
    </div>
  );
}
