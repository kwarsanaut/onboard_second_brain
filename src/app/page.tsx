import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(user.user_metadata?.role === 'hr' ? '/hr' : '/employee');

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#0c0a09]">
      {/* HR side */}
      <Link href="/login" className="group relative flex flex-col justify-between p-12 lg:p-16 border-r border-white/[0.06] overflow-hidden transition-all duration-300 hover:bg-white/[0.02]">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/12 transition-all duration-500" />
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-xl mb-10 group-hover:bg-orange-500/20 transition-colors duration-200">
            🏢
          </div>
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs font-semibold text-orange-400">HR & Manager</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-3">
            Kelola<br />Onboarding
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
            Generate checklist per posisi dari dokumen handover. Wiki terupdate otomatis tiap ada dokumen baru.
          </p>
        </div>
        <div className="relative flex items-center gap-2 text-orange-400 font-semibold text-sm">
          Masuk sebagai HR
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform duration-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </div>
      </Link>

      {/* Employee side */}
      <Link href="/login" className="group relative flex flex-col justify-between p-12 lg:p-16 overflow-hidden transition-all duration-300 hover:bg-white/[0.02]">
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-400/8 transition-all duration-500" />
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xl mb-10 group-hover:bg-white/[0.08] transition-colors duration-200">
            👤
          </div>
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span className="text-xs font-semibold text-stone-300">Karyawan Baru</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-3">
            Mulai<br />Onboarding
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
            Akses checklist onboarding yang dipersonalisasi untuk posisi dan orang yang kamu gantikan.
          </p>
        </div>
        <div className="relative flex items-center gap-2 text-stone-300 group-hover:text-white font-semibold text-sm transition-colors duration-200">
          Mulai onboarding
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform duration-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </div>
      </Link>

      {/* Center badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-[#0c0a09] border border-white/[0.1] shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center text-white font-black text-xs">O</div>
          <span className="text-xs font-black text-stone-300 tracking-widest uppercase">OnboardKit</span>
        </div>
      </div>
    </main>
  );
}
