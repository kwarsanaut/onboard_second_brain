'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Department } from '@/types';
import Card from '@/components/Card';
import Btn from '@/components/Btn';

export default function OnboardPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: '', position: '', departmentId: '', startDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(setDepartments);
    setForm(f => ({ ...f, startDate: new Date().toISOString().split('T')[0] }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.departmentId) { setError('Nama dan departemen wajib diisi'); return; }
    setLoading(true);
    setError('');
    const dept = departments.find(d => d.id === form.departmentId);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, departmentName: dept?.name ?? '' }),
    });
    setLoading(false);
    if (res.ok) router.push(`/user/${(await res.json()).id}`);
    else setError((await res.json()).error ?? 'Terjadi kesalahan');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-xs text-slate-400 hover:text-slate-600 mb-5 transition-colors">← Beranda</Link>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mx-auto mb-4">👋</div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Selamat Datang!</h1>
          <p className="text-sm text-slate-500">Isi data kamu untuk mendapatkan checklist onboarding.</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nama lengkap kamu"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jabatan / Posisi</label>
              <input
                type="text"
                value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                placeholder="Software Engineer, Finance Analyst..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Departemen *</label>
              {departments.length === 0 ? (
                <div className="border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-400 text-center">
                  Belum ada departemen. Hubungi HR.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {departments.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, departmentId: d.id }))}
                      className={`p-2.5 rounded-xl border-2 text-xs font-semibold transition-all text-left ${
                        form.departmentId === d.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <Btn
              type="submit"
              disabled={loading || !form.name.trim() || !form.departmentId}
              className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-200"
            >
              {loading ? 'Menyiapkan...' : 'Lihat Checklist Saya →'}
            </Btn>
          </form>
        </Card>
      </div>
    </div>
  );
}
