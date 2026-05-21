'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ChecklistTemplate, ChecklistItem } from '@/types';
import Badge from '@/components/Badge';

export default function EditChecklistPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const router = useRouter();

  const [checklist, setChecklist] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ChecklistItem>>({});

  useEffect(() => {
    fetch(`/api/checklists/${departmentId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setChecklist(data); setLoading(false); });
  }, [departmentId]);

  function startEdit(item: ChecklistItem) {
    setEditingId(item.id);
    setEditForm({ title: item.title, description: item.description, category: item.category, isRequired: item.isRequired });
  }

  async function saveEdit(itemId: string) {
    if (!checklist) return;
    const updated = {
      ...checklist,
      items: checklist.items.map(i => i.id === itemId ? { ...i, ...editForm } : i),
    };
    setChecklist(updated);
    setEditingId(null);
    setSaving(true);
    await fetch(`/api/checklists/${departmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSaving(false);
  }

  async function deleteItem(itemId: string) {
    if (!checklist) return;
    const updated = {
      ...checklist,
      items: checklist.items.filter(i => i.id !== itemId).map((i, idx) => ({ ...i, order: idx + 1 })),
    };
    setChecklist(updated);
    setSaving(true);
    await fetch(`/api/checklists/${departmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSaving(false);
  }

  async function addItem() {
    if (!checklist) return;
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      title: 'Item baru',
      description: 'Deskripsi item',
      category: 'Umum',
      isRequired: false,
      order: checklist.items.length + 1,
    };
    const updated = { ...checklist, items: [...checklist.items, newItem] };
    setChecklist(updated);
    await fetch(`/api/checklists/${departmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    startEdit(newItem);
  }

  const categories = checklist ? [...new Set(checklist.items.map(i => i.category))] : [];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-400 animate-pulse">Memuat...</p></div>;
  if (!checklist) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-slate-500">Checklist belum ada untuk departemen ini.</p>
      <Link href="/admin/upload" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Generate Sekarang</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600 text-sm">← Dashboard</Link>
            <span className="text-slate-200">|</span>
            <h1 className="font-bold text-slate-800">{checklist.departmentName}</h1>
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-slate-400 animate-pulse">Menyimpan...</span>}
            <button
              onClick={addItem}
              className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + Item
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {checklist.items.length} item · {categories.length} kategori
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Dari: {checklist.generatedFrom}</p>
              </div>
              <Badge variant="indigo">{checklist.model ?? 'LLM'}</Badge>
            </div>
          </div>

          {categories.map(cat => (
            <div key={cat}>
              <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cat}</span>
              </div>
              {checklist.items.filter(i => i.category === cat).map(item => (
                <div key={item.id} className="border-b border-slate-100 last:border-0">
                  {editingId === item.id ? (
                    <div className="p-4 bg-indigo-50 space-y-3">
                      <input
                        value={editForm.title ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm font-medium"
                        placeholder="Judul item"
                      />
                      <textarea
                        value={editForm.description ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm resize-none"
                        rows={2}
                        placeholder="Deskripsi detail"
                      />
                      <div className="flex gap-3 items-center">
                        <input
                          value={editForm.category ?? ''}
                          onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                          className="border border-indigo-200 rounded-lg px-3 py-1.5 text-xs flex-1"
                          placeholder="Kategori"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={editForm.isRequired ?? false}
                            onChange={e => setEditForm(f => ({ ...f, isRequired: e.target.checked }))}
                          />
                          Wajib
                        </label>
                        <button onClick={() => saveEdit(item.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Simpan</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-slate-500 rounded-lg text-xs hover:bg-slate-200">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-3 flex gap-3 items-start group">
                      <span className="text-slate-300 text-xs w-5 flex-shrink-0 mt-0.5">{item.order}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800">{item.title}</p>
                          {item.isRequired && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Wajib</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => startEdit(item)} className="text-xs text-indigo-500 hover:text-indigo-700">Edit</button>
                        <button onClick={() => deleteItem(item.id)} className="text-xs text-red-400 hover:text-red-600">Hapus</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href="/admin" className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-center text-slate-700 hover:bg-slate-100">
            Kembali ke Dashboard
          </Link>
          <Link href={`/admin/upload?dept=${departmentId}`} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-xl text-sm font-medium">
            Regenerate dengan AI
          </Link>
        </div>
      </div>
    </div>
  );
}
