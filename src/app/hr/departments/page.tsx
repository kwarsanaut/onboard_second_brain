'use client';
import { useEffect, useState } from 'react';
import type { Department } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => fetch('/api/departments').then(r => r.json()).then(d => { setDepartments(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSaving(true);
    const res = await fetch('/api/departments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { setForm({ name: '', description: '' }); load(); }
    else setError((await res.json()).error ?? 'Gagal menyimpan');
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus departemen "${name}"?`)) return;
    await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    load();
  }

  const inp = "w-full h-10 border border-stone-200 rounded-lg px-3.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-150 bg-white";

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-stone-900">Manajemen Departemen</h1>
        <p className="text-sm text-stone-500 mt-0.5">Buat dan kelola departemen organisasi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form */}
        <div className="md:col-span-2">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
              <h2 className="text-sm font-bold text-stone-700">Tambah Departemen</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Nama *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Engineering, Finance, Marketing..." required className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Fungsi departemen ini..." rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-150 resize-none bg-white" />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={saving}
                className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all duration-150 disabled:opacity-50">
                {saving ? 'Menyimpan...' : '+ Tambah Departemen'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Daftar</h2>
            <span className="text-xs text-stone-400 font-semibold">{departments.length} departemen</span>
          </div>
          {loading ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 flex items-center justify-center">
              <svg className="animate-spin w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : departments.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-10 text-center">
              <p className="text-stone-400 text-sm">Belum ada departemen</p>
            </div>
          ) : (
            <div className="space-y-2">
              {departments.map(dept => (
                <div key={dept.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 flex items-start justify-between hover:border-stone-300 hover:shadow-sm transition-all duration-150 group">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-sm font-black text-orange-600 flex-shrink-0">
                      {dept.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-800 text-sm">{dept.name}</p>
                      {dept.description && <p className="text-xs text-stone-400 mt-0.5 truncate">{dept.description}</p>}
                      <p className="text-[11px] text-stone-300 mt-1">{formatDate(dept.createdAt)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(dept.id, dept.name)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150 flex-shrink-0 ml-2">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
