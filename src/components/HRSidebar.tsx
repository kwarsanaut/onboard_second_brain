'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import LogoutButton from './LogoutButton';

const nav = [
  { href: '/hr', label: 'Dashboard', icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { href: '/hr/departments', label: 'Departemen', icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14"/><path d="M9 21V11h6v10"/><path d="M3 21h18"/>
    </svg>
  )},
  { href: '/hr/upload', label: 'Generate Wiki', icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )},
];

export default function HRSidebar() {
  const path = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0c0a09] border-r border-white/[0.06] min-h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">O</div>
          <div>
            <p className="text-white font-black text-sm leading-none">OnboardKit</p>
            <span className="text-[10px] text-orange-400/80 font-semibold mt-0.5 inline-block">HR Portal</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest px-2.5 mb-2">Menu</p>
        {nav.map(item => {
          const isActive = item.href === '/hr' ? path === '/hr' : path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]'
              )}
            >
              <span className={cn('flex-shrink-0', isActive ? 'text-orange-400' : 'text-stone-500')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="px-2.5 py-2">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
