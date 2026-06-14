'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Department, Position } from '@/types';
import { cn } from '@/lib/utils';

export default function EmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [form, setForm] = useState({ name: '', positionId: '', startDate: '' });
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/users/me').then(async r => {
      if (r.ok) {
        const existing = await r.json();
        router.replace(`/employee/${existing.id}`);
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(setDepartments);
    setForm(f => ({ ...f, startDate: new Date().toISOString().split('T')[0] }));
  }, []);

  useEffect(() => {
    if (!selectedDept) { setPositions([]); setForm(f => ({ ...f, positionId: '' })); return; }
    fetch(`/api/positions?departmentId=${selectedDept}`).then(r => r.json()).then(setPositions);
  }, [selectedDept]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.positionId) { setError('Nama dan posisi wajib diisi'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) router.push(`/employee/${(await res.json()).id}`);
    else setError((await res.json()).error ?? 'Terjadi kesalahan');
  }

  const inp = "w-full h-10 border border-stone-200 rounded-lg px-3.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-150 bg-white";
  const lbl = "block text-xs font-semibold text-stone-600 mb-2";

  if (checking) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)]">
      <svg className="animate-spin w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-2xl mx-auto mb-4">👋</div>
          <h1 className="text-2xl font-black text-stone-900 mb-1.5">Halo! Selamat datang</h1>
          <p className="text-sm text-stone-500">Isi data kamu untuk memulai onboarding</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className={lbl}>Nama Lengkap *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nama lengkap kamu" required className={inp} />
            </div>

            <div>
              <label className={lbl}>Departemen *</label>
              {departments.length === 0 ? (
                <div className="border border-stone-200 rounded-lg py-3 text-center text-xs text-stone-400">Hubungi Manager Tim</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {departments.map(d => (
                    <button key={d.id} type="button" onClick={() => setSelectedDept(d.id)}
                      className={cn('py-2 px-3 rounded-lg border text-xs font-semibold text-left transition-all duration-150',
                        selectedDept === d.id ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50')}>
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedDept && (
              <div>
                <label className={lbl}>Posisi *</label>
                {positions.length === 0 ? (
                  <div className="border border-stone-200 rounded-lg py-3 text-center text-xs text-stone-400">Tidak ada posisi tersedia</div>
                ) : (
                  <div className="space-y-1.5">
                    {positions.map(p => (
                      <button key={p.id} type="button" onClick={() => setForm(f => ({ ...f, positionId: p.id }))}
                        className={cn('w-full py-2.5 px-3.5 rounded-lg border text-sm font-semibold text-left transition-all duration-150 flex items-center justify-between',
                          form.positionId === p.id ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50')}>
                        {p.name}
                        {form.positionId === p.id && (
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-orange-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className={lbl}>Tanggal Mulai</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={inp} />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="text-red-500 flex-shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !form.name.trim() || !form.positionId}
              className="w-full h-10 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-bold rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Mempersiapkan...
                </span>
              ) : 'Lihat Checklist Saya →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
