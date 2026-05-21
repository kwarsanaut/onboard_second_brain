import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 h-12 flex items-center justify-between">
          <Link href="/employee" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center text-white font-black text-[10px]">O</div>
            <span className="text-sm font-bold text-stone-700">OnboardKit</span>
          </Link>
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
