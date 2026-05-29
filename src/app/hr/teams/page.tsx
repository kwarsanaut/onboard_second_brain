'use client';
import { useEffect, useState, useRef } from 'react';
import type { Department, TeamMember } from '@/types';
import { formatDate } from '@/lib/utils';

export default function TeamsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(setDepartments);
  }, []);

  useEffect(() => {
    if (!selectedDept) { setMembers([]); return; }
    setLoading(true);
    fetch(`/api/team-members?departmentId=${selectedDept}`)
      .then(r => r.json()).then(d => { setMembers(d); setLoading(false); });
  }, [selectedDept]);

  function handlePhoto(file: File) {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !selectedDept) return;
    setSaving(true); setError('');
    const dept = departments.find(d => d.id === selectedDept);
    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('role', form.role.trim());
    body.append('departmentId', selectedDept);
    body.append('departmentName', dept?.name ?? '');
    if (photoFile) body.append('photo', photoFile);

    const res = await fetch('/api/team-members', { method: 'POST', body });
    setSaving(false);
    if (res.ok) {
      const m = await res.json();
      setMembers(prev => [...prev, m]);
      setForm({ name: '', role: '' });
      setPhotoFile(null);
      setPhotoPreview('');
    } else {
      setError((await res.json()).error ?? 'Gagal menyimpan');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus anggota tim ini?')) return;
    await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  const inp = "w-full h-10 border border-stone-200 rounded-lg px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-stone-900 placeholder-stone-400";

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-stone-900">Anggota Tim</h1>
        <p className="text-sm text-stone-500 mt-0.5">Tambah foto tim untuk kuis pengenalan karyawan baru</p>
      </div>

      {/* Dept selector */}
      <div className="mb-6">
        <p className="text-xs font-bold text-stone-500 mb-2">Pilih Departemen</p>
        <div className="flex flex-wrap gap-2">
          {departments.map(d => (
            <button key={d.id} onClick={() => setSelectedDept(d.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${selectedDept === d.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {selectedDept && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Form tambah */}
          <div className="md:col-span-2">
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
                <h2 className="text-sm font-bold text-stone-700">Tambah Anggota</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Photo upload */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-2">Foto *</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl mb-1">📷</div>
                        <p className="text-xs text-stone-400">Klik untuk upload foto</p>
                        <p className="text-[10px] text-stone-300 mt-0.5">JPG, PNG — tampak muka jelas</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-2">Nama *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nama lengkap" required className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-2">Jabatan</label>
                  <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="Backend Engineer, Designer..." className={inp} />
                </div>
                {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={saving || !form.name.trim()}
                  className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50">
                  {saving ? 'Menyimpan...' : '+ Tambah Anggota'}
                </button>
              </form>
            </div>
          </div>

          {/* List anggota */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Anggota Tim</h2>
              <span className="text-xs text-stone-400">{members.length} orang</span>
            </div>
            {loading ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-8 flex items-center justify-center">
                <svg className="animate-spin w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
            ) : members.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-10 text-center">
                <p className="text-stone-400 text-sm">Belum ada anggota</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {members.map(m => (
                  <div key={m.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden group hover:border-stone-300 hover:shadow-sm transition-all">
                    {/* Foto + eye crop preview */}
                    {m.photoUrl ? (
                      <div className="relative">
                        <img src={m.photoUrl} alt={m.name} className="w-full h-28 object-cover" />
                        {/* Eye crop overlay */}
                        <div className="absolute bottom-1 right-1 bg-black/60 rounded-md px-2 py-1">
                          <p className="text-[10px] text-white font-semibold">Area kuis 👁</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-28 bg-stone-100 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-lg font-black text-orange-600">
                          {m.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="px-3 py-2.5 flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-stone-800">{m.name}</p>
                        {m.role && <p className="text-[11px] text-stone-400">{m.role}</p>}
                        {!m.photoUrl && <p className="text-[10px] text-amber-500 mt-0.5">⚠ Belum ada foto</p>}
                      </div>
                      <button onClick={() => handleDelete(m.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-300 hover:text-red-500 transition-all">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      )}
    </div>
  );
}
