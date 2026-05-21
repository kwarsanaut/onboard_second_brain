'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { UserOnboarding, UserChecklistItem } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import Navbar from '@/components/Navbar';
import { getProgress, formatDate } from '@/lib/utils';

type Filter = 'all' | 'todo' | 'done';

export default function UserChecklistPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [notesOpen, setNotesOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(u => { setUser(u); setLoading(false); });
  }, [userId]);

  async function toggle(item: UserChecklistItem) {
    if (!user) return;
    setSaving(item.id);
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, completed: !item.completed }),
    });
    if (res.ok) setUser(await res.json());
    setSaving(null);
  }

  async function saveNote(itemId: string) {
    if (!user) return;
    const item = user.items.find(i => i.id === itemId);
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, completed: item?.completed ?? false, notes: noteText }),
    });
    if (res.ok) { setUser(await res.json()); setNotesOpen(null); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-7 h-7 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-sm text-slate-400">Memuat checklist...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <p className="text-slate-500">Checklist tidak ditemukan.</p>
      <Link href="/onboard" className="text-sm text-indigo-600 hover:underline">Kembali</Link>
    </div>
  );

  const progress = getProgress(user.items);
  const categories = [...new Set(user.items.map(i => i.category))];
  const filterFn = (i: UserChecklistItem) => filter === 'done' ? i.completed : filter === 'todo' ? !i.completed : true;

  const counts = {
    all: user.items.length,
    todo: user.items.filter(i => !i.completed).length,
    done: user.items.filter(i => i.completed).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/onboard" className="text-slate-400 hover:text-slate-700 text-sm transition-colors flex-shrink-0">←</Link>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {user.positionName && `${user.positionName} · `}{user.departmentName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {progress === 100 && <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">🎉 Selesai!</span>}
              <span className="text-sm font-black text-indigo-600">{progress}%</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="pb-3">
            <ProgressBar value={progress} showLabel={false} />
            <p className="text-xs text-slate-400 mt-1.5">
              {counts.done} dari {counts.all} tugas selesai · Mulai {formatDate(user.startDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5">
        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
          {(['all', 'todo', 'done'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'todo' ? 'Belum' : 'Selesai'}
              <span className={`ml-1.5 ${filter === f ? 'text-indigo-500' : 'text-slate-400'}`}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Checklist */}
        {categories.map(cat => {
          const items = user.items.filter(i => i.category === cat).filter(filterFn);
          if (items.length === 0) return null;
          const catDone = user.items.filter(i => i.category === cat && i.completed).length;
          const catTotal = user.items.filter(i => i.category === cat).length;
          return (
            <div key={cat} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat}</p>
                <span className={`text-xs font-semibold ${catDone === catTotal ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {catDone}/{catTotal}
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className={`border-b border-slate-100 last:border-0 transition-colors ${item.completed ? 'bg-slate-50/80' : ''}`}>
                    <div className="px-4 py-4 flex gap-3 items-start">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggle(item)}
                        disabled={saving === item.id}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          item.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 hover:border-indigo-400'
                        } ${saving === item.id ? 'opacity-50 scale-95' : ''}`}
                      >
                        {item.completed && <span className="text-white text-[10px] font-bold">✓</span>}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold leading-tight ${item.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {item.title}
                          </p>
                          {item.isRequired && !item.completed && (
                            <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-1.5 py-0.5 rounded-md">Wajib</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>

                        {item.notes && (
                          <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                            <span className="text-xs">📝</span>
                            <p className="text-xs text-amber-700 leading-relaxed">{item.notes}</p>
                          </div>
                        )}

                        {item.completedAt && (
                          <p className="text-xs text-emerald-500 mt-1 font-medium">Selesai {formatDate(item.completedAt)}</p>
                        )}

                        {notesOpen === item.id && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              placeholder="Tambah catatan..."
                              rows={2}
                              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 resize-none outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveNote(item.id)} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Simpan</button>
                              <button onClick={() => setNotesOpen(null)} className="text-xs px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">Batal</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Note toggle */}
                      <button
                        onClick={() => { setNotesOpen(notesOpen === item.id ? null : item.id); setNoteText(item.notes ?? ''); }}
                        className={`text-sm flex-shrink-0 transition-opacity mt-0.5 ${notesOpen === item.id ? 'opacity-100' : 'opacity-30 hover:opacity-70'}`}
                        title="Catatan"
                      >
                        📝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {user.items.filter(filterFn).length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">{filter === 'done' ? '📋' : '🎉'}</div>
            <p className="text-slate-400 text-sm">
              {filter === 'done' ? 'Belum ada tugas yang selesai.' : 'Semua tugas sudah selesai!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
