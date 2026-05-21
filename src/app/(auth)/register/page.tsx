'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Role = 'hr' | 'employee';

const roles: { id: Role; icon: string; title: string; desc: string }[] = [
  { id: 'hr', icon: '🏢', title: 'HR / Manager', desc: 'Generate & kelola checklist' },
  { id: 'employee', icon: '👤', title: 'Karyawan Baru', desc: 'Akses checklist onboarding' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('hr');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Password tidak cocok'); return; }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true); setError('');
    const { error } = await createClient().auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name, role }, emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push(role === 'hr' ? '/hr' : '/employee');
    router.refresh();
  }

  const inp = "w-full h-10 bg-white/[0.05] border border-white/[0.1] rounded-lg px-3.5 text-sm text-white placeholder-stone-600 outline-none focus:border-orange-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-orange-500/10 transition-all duration-150";
  const lbl = "block text-xs font-semibold text-stone-300 mb-2 tracking-wide";

  return (
    <div className="w-full max-w-[360px]">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-white mb-1.5">Buat akun baru</h1>
        <p className="text-stone-400 text-sm">Bergabung dengan OnboardKit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className={lbl}>Saya adalah</label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map(r => (
              <button key={r.id} type="button" onClick={() => setRole(r.id)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all duration-150',
                  role === r.id
                    ? 'bg-orange-500/15 border-orange-500/40 text-white'
                    : 'bg-white/[0.03] border-white/[0.08] text-stone-400 hover:border-white/[0.15] hover:bg-white/[0.05]'
                )}>
                <span className="text-base block mb-1">{r.icon}</span>
                <p className="text-xs font-bold leading-tight">{r.title}</p>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={lbl}>Nama Lengkap</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nama kamu" required className={inp} />
        </div>
        <div>
          <label className={lbl}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="nama@perusahaan.com" required className={inp} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min. 6 karakter" required className={inp} />
          </div>
          <div>
            <label className={lbl}>Konfirmasi</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Ulangi" required className={inp} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="text-red-400 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full h-10 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-bold rounded-lg transition-all duration-150 disabled:opacity-50 mt-1">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>Mendaftar...
            </span>
          ) : 'Buat Akun'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
        <p className="text-stone-500 text-xs">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-150">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
