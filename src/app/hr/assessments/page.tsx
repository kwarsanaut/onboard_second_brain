'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Assessment } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration: 15, threshold: 70 });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/assessments').then(r => r.json()).then(d => { setAssessments(d); setLoading(false); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true); setError('');
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const a = await res.json();
      setAssessments(prev => [a, ...prev]);
      setForm({ title: '', description: '', duration: 15, threshold: 70 });
    } else {
      setError((await res.json()).error ?? 'Gagal menyimpan');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus assessment ini beserta semua soalnya?')) return;
    await fetch(`/api/assessments/${id}`, { method: 'DELETE' });
    setAssessments(prev => prev.filter(a => a.id !== id));
  }

  const inp = "w-full h-10 border border-stone-200 rounded-lg px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-stone-900 placeholder-stone-400";

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-stone-900">Assessment</h1>
        <p className="text-sm text-stone-500 mt-0.5">Kelola bank soal tes pengetahuan untuk karyawan baru</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form tambah */}
        <div className="md:col-span-2">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
              <h2 className="text-sm font-bold text-stone-700">Buat Assessment</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Judul *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Tes Onboarding QA Tester" required className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Penjelasan singkat tes ini" rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-stone-900 placeholder-stone-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-2">Durasi (menit) *</label>
                  <input type="number" min={1} value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                    required className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-2">Threshold Lulus (%) *</label>
                  <input type="number" min={0} max={100} value={form.threshold}
                    onChange={e => setForm(f => ({ ...f, threshold: Number(e.target.value) }))}
                    required className={inp} />
                </div>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={saving || !form.title.trim()}
                className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50">
                {saving ? 'Menyimpan...' : '+ Buat Assessment'}
              </button>
            </form>
          </div>
        </div>

        {/* List assessment */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Daftar Assessment</h2>
            <span className="text-xs text-stone-400">{assessments.length} assessment</span>
          </div>
          {loading ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 flex items-center justify-center">
              <svg className="animate-spin w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : assessments.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-10 text-center">
              <p className="text-stone-400 text-sm">Belum ada assessment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map(a => (
                <div key={a.id} className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/hr/assessments/${a.id}`} className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800">{a.title}</p>
                      {a.description && <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{a.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                        <span>⏱ {a.duration} menit</span>
                        <span>🎯 Lulus ≥ {a.threshold}%</span>
                        <span>{formatDate(a.createdAt)}</span>
                      </div>
                    </Link>
                    <button onClick={() => handleDelete(a.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-stone-300 hover:text-red-500 transition-all flex-shrink-0">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
