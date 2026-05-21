'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { ChecklistTemplate, ChecklistItem } from '@/types';
import Badge from '@/components/Badge';
import { formatDate } from '@/lib/utils';

export default function HREditChecklistPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const [checklist, setChecklist] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ChecklistItem>>({});

  useEffect(() => {
    fetch(`/api/checklists/${departmentId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setChecklist(d); setLoading(false); });
  }, [departmentId]);

  async function save(updated: ChecklistTemplate) {
    setSaving(true);
    await fetch(`/api/checklists/${departmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSaving(false);
  }

  function startEdit(item: ChecklistItem) {
    setEditingId(item.id);
    setEditForm({ title: item.title, description: item.description, category: item.category, isRequired: item.isRequired });
  }

  async function saveEdit(itemId: string) {
    if (!checklist) return;
    const updated = { ...checklist, items: checklist.items.map(i => i.id === itemId ? { ...i, ...editForm } : i) };
    setChecklist(updated); setEditingId(null);
    await save(updated);
  }

  async function deleteItem(itemId: string) {
    if (!checklist) return;
    const updated = { ...checklist, items: checklist.items.filter(i => i.id !== itemId).map((i, idx) => ({ ...i, order: idx + 1 })) };
    setChecklist(updated);
    await save(updated);
  }

  async function addItem() {
    if (!checklist) return;
    const newItem: ChecklistItem = { id: `item-${Date.now()}`, title: 'Item baru', description: '', category: 'Umum', isRequired: false, order: checklist.items.length + 1 };
    const updated = { ...checklist, items: [...checklist.items, newItem] };
    setChecklist(updated);
    await save(updated);
    startEdit(newItem);
  }

  const categories = checklist ? [...new Set(checklist.items.map(i => i.category))] : [];

  if (loading) return <div className="flex items-center justify-center py-24"><p className="text-slate-400 animate-pulse">Memuat...</p></div>;
  if (!checklist) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-slate-500">Belum ada wiki untuk departemen ini.</p>
      <Link href="/hr/upload" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Generate Sekarang</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/hr" className="text-xs text-slate-400 hover:text-slate-600">← Dashboard</Link>
          </div>
          <h1 className="text-xl font-black text-slate-800">{checklist.departmentName} — Wiki</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Revisi #{checklist.wikiRevisions ?? 1} · Update {formatDate(checklist.updatedAt)} · Dari: {checklist.generatedFrom}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-slate-400 animate-pulse">Menyimpan...</span>}
          <button onClick={addItem} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">+ Item</button>
          <Link href={`/hr/upload?dept=${departmentId}`} className="px-3 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50">🔄 Update Wiki</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-700">{checklist.items.length} item · {categories.length} kategori</span>
          <Badge variant="indigo">{checklist.model}</Badge>
        </div>

        {categories.map(cat => (
          <div key={cat}>
            <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-100">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{cat}</span>
            </div>
            {checklist.items.filter(i => i.category === cat).map(item => (
              <div key={item.id} className="border-b border-slate-100 last:border-0">
                {editingId === item.id ? (
                  <div className="p-4 bg-indigo-50 space-y-3">
                    <input value={editForm.title ?? ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold" placeholder="Judul item" />
                    <textarea value={editForm.description ?? ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm resize-none" rows={2} placeholder="Deskripsi" />
                    <div className="flex gap-3 items-center">
                      <input value={editForm.category ?? ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                        className="border border-indigo-200 rounded-lg px-3 py-1.5 text-xs flex-1" placeholder="Kategori" />
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={editForm.isRequired ?? false} onChange={e => setEditForm(f => ({ ...f, isRequired: e.target.checked }))} />
                        Wajib
                      </label>
                      <button onClick={() => saveEdit(item.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">Simpan</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-slate-500 rounded-lg text-xs hover:bg-slate-200">Batal</button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-3.5 flex gap-3 items-start group">
                    <span className="text-slate-300 text-xs w-5 flex-shrink-0 mt-0.5">{item.order}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        {item.isRequired && <span className="text-xs bg-rose-100 text-rose-600 font-bold px-1.5 py-0.5 rounded-md">Wajib</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold">Edit</button>
                      <button onClick={() => deleteItem(item.id)} className="text-xs text-rose-400 hover:text-rose-600 font-semibold">Hapus</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
