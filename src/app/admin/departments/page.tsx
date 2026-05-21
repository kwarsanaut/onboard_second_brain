'use client';
import { useEffect, useState } from 'react';
import type { Department } from '@/types';
import { formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Btn from '@/components/Btn';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    fetch('/api/departments').then(r => r.json()).then(d => { setDepartments(d); setLoading(false); });

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { setForm({ name: '', description: '' }); load(); }
    else setError((await res.json()).error ?? 'Gagal menyimpan');
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus departemen "${name}"?`)) return;
    await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        back={{ href: '/admin', label: 'Dashboard' }}
        title="Manajemen Departemen"
        actions={<span className="text-xs text-slate-400">{departments.length} departemen</span>}
      />

      <div className="max-w-4xl mx-auto px-5 py-8 grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Form */}
        <div className="md:col-span-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Tambah Baru</p>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Departemen *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Engineering, Finance, Marketing..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Fungsi dan tanggung jawab departemen"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
                />
              </div>
              {error && <p className="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
              <Btn type="submit" disabled={saving} className="w-full justify-center">
                {saving ? 'Menyimpan...' : '+ Tambah Departemen'}
              </Btn>
            </form>
          </Card>
        </div>

        {/* List */}
        <div className="md:col-span-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Daftar Departemen</p>
          {loading ? (
            <Card><p className="text-sm text-slate-400 animate-pulse text-center py-4">Memuat...</p></Card>
          ) : departments.length === 0 ? (
            <Card className="text-center py-10">
              <div className="text-3xl mb-3">🏢</div>
              <p className="text-sm text-slate-400">Belum ada departemen</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {departments.map(dept => (
                <Card key={dept.id} padding="sm" className="flex items-start justify-between gap-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm flex-shrink-0 font-bold">
                      {dept.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{dept.name}</p>
                      {dept.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{dept.description}</p>}
                      <p className="text-xs text-slate-300 mt-0.5">{formatDate(dept.createdAt)}</p>
                    </div>
                  </div>
                  <Btn variant="danger" size="sm" onClick={() => handleDelete(dept.id, dept.name)} className="flex-shrink-0">
                    Hapus
                  </Btn>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
