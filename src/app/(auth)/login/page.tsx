'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error } = await createClient().auth.signInWithPassword(form);
    setLoading(false);
    if (error) { setError('Email atau password salah'); return; }
    const role = data.user?.user_metadata?.role ?? 'employee';
    router.push(role === 'hr' ? '/hr' : '/employee');
    router.refresh();
  }

  return (
    <div className="w-full max-w-[360px]">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1.5">Selamat datang kembali</h1>
        <p className="text-stone-400 text-sm">Masuk ke akun OnboardKit kamu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-2 tracking-wide">Email</label>
          <input
            type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="nama@perusahaan.com" required autoComplete="email"
            className="w-full h-10 bg-white/[0.05] border border-white/[0.1] rounded-lg px-3.5 text-sm text-white placeholder-stone-600 outline-none focus:border-orange-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-orange-500/10 transition-all duration-150"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-stone-300 tracking-wide">Password</label>
          </div>
          <input
            type="password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••" required autoComplete="current-password"
            className="w-full h-10 bg-white/[0.05] border border-white/[0.1] rounded-lg px-3.5 text-sm text-white placeholder-stone-600 outline-none focus:border-orange-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-orange-500/10 transition-all duration-150"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="text-red-400 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full h-10 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-bold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Masuk...
            </span>
          ) : 'Masuk'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
        <p className="text-stone-500 text-xs">
          Belum punya akun?{' '}
          <Link href="/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-150">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // Backsound halaman login (Akatsuki / Pain theme)
  useEffect(() => {
    const audio = new Audio('/akatsuki-pain.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      audio.play().catch(() => {});
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    // Coba autoplay; kalau diblokir browser, mulai saat interaksi pertama
    audio.play().then(() => { started = true; }).catch(() => {
      window.addEventListener('pointerdown', start);
      window.addEventListener('keydown', start);
    });
    return () => {
      audio.pause();
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  return <Suspense><LoginForm /></Suspense>;
}
