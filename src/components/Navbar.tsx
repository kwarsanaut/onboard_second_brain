import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  back?: { href: string; label: string };
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function Navbar({ back, title, actions, className }: Props) {
  return (
    <header className={cn('bg-white border-b border-slate-200 sticky top-0 z-20', className)}>
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <>
              <Link href={back.href} className="text-slate-400 hover:text-slate-700 text-sm transition-colors flex-shrink-0">
                ← {back.label}
              </Link>
              <span className="text-slate-200 flex-shrink-0">|</span>
            </>
          )}
          <span className="font-semibold text-slate-800 truncate text-sm">{title}</span>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
