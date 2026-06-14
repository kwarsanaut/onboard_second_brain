'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { UserOnboarding, UserChecklistItem } from '@/types';
import { getProgress, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import ChatWidget from '@/components/ChatWidget';

type Filter = 'all' | 'todo' | 'done';

export default function EmployeeChecklistPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [notesOpen, setNotesOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.ok ? r.json() : null).then(u => { setUser(u); setLoading(false); });
  }, [userId]);

  async function toggle(item: UserChecklistItem) {
    if (!user) return;
    setSaving(item.id);
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, completed: !item.completed }),
    });
    if (res.ok) setUser(await res.json());
    setSaving(null);
  }

  async function saveNote(itemId: string) {
    if (!user) return;
    const item = user.items.find(i => i.id === itemId);
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, completed: item?.completed ?? false, notes: noteText }),
    });
    if (res.ok) { setUser(await res.json()); setNotesOpen(null); }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)]">
      <svg className="animate-spin w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] gap-3">
      <p className="text-stone-500 text-sm">Checklist tidak ditemukan.</p>
    </div>
  );

  const progress = getProgress(user.items);
  const categories = [...new Set(user.items.map(i => i.category))];
  const counts = { all: user.items.length, todo: user.items.filter(i => !i.completed).length, done: user.items.filter(i => i.completed).length };
  const filterFn = (i: UserChecklistItem) => filter === 'done' ? i.completed : filter === 'todo' ? !i.completed : true;

  const docItems = user.items.filter(i => i.source !== 'additional');
  const addItems = user.items.filter(i => i.source === 'additional');

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      {/* Progress header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-black text-stone-900">{user.name}</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {user.positionName} · {user.departmentName} · Mulai {formatDate(user.startDate)}
            </p>
          </div>
          <div className="text-right">
            <p className={cn('text-2xl font-black', progress >= 100 ? 'text-emerald-500' : 'text-orange-500')}>{progress}%</p>
            <p className="text-xs text-stone-400">{counts.done}/{counts.all} selesai</p>
          </div>
        </div>

        {/* Assessment button */}
        <Link href={`/employee/${userId}/assessment`}
          className="mb-3 flex items-center gap-3 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-xl px-4 py-3 hover:from-orange-100 hover:to-pink-100 transition-all group">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 text-lg">🎯</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-stone-800">Mulai Assessment</p>
            <p className="text-xs text-stone-400">Kuis tebak anggota tim + soal handover</p>
          </div>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-stone-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </Link>

        {/* Knowledge test button */}
        <Link href={`/employee/${userId}/tests`}
          className="mb-4 flex items-center gap-3 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl px-4 py-3 hover:from-sky-100 hover:to-indigo-100 transition-all group">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0 text-lg">📝</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-stone-800">Tes Pengetahuan</p>
            <p className="text-xs text-stone-400">Kerjakan tes yang disiapkan HR untuk menilai pemahamanmu</p>
          </div>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-stone-300 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </Link>

        {/* Progress bar */}
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700 ease-out', progress >= 100 ? 'bg-emerald-500' : 'bg-orange-500')}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Context banner */}
        {user.onboardingType === 'replacement' && user.replacingPerson && (
          <div className="mt-3 flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-2.5">
            <span className="text-base">🔄</span>
            <div>
              <p className="text-xs font-bold text-orange-700">Menggantikan {user.replacingPerson}</p>
              <p className="text-[11px] text-orange-500">Checklist dibuat dari dokumen kerja {user.replacingPerson}</p>
            </div>
          </div>
        )}
        {user.onboardingType === 'new-hire' && (
          <div className="mt-3 flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
            <span className="text-base">🌱</span>
            <p className="text-xs font-bold text-emerald-700">Fresh Hire — {user.positionName}</p>
          </div>
        )}
        {progress === 100 && (
          <div className="mt-3 flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
            <span className="text-base">🎉</span>
            <p className="text-xs font-bold text-emerald-700">Selamat! Onboarding kamu selesai!</p>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-5 bg-stone-100 p-1 rounded-xl w-fit">
        {(['all', 'todo', 'done'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150',
              filter === f ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700')}>
            {f === 'all' ? 'Semua' : f === 'todo' ? 'Belum' : 'Selesai'}
            <span className={cn('ml-1.5 font-black', filter === f ? 'text-orange-500' : 'text-stone-400')}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Checklist by section */}
      {[
        { label: 'Tugas Utama', items: docItems, icon: '📄' },
        { label: 'Tambahan', items: addItems, icon: '✦' },
      ].map(section => {
        const sectionCats = [...new Set(section.items.map(i => i.category))];
        const visibleCats = sectionCats.filter(cat => section.items.filter(i => i.category === cat).some(filterFn));
        if (visibleCats.length === 0) return null;
        return (
          <div key={section.label} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <span className="text-sm">{section.icon}</span>
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">{section.label}</h2>
            </div>
            {visibleCats.map(cat => {
              const catItems = section.items.filter(i => i.category === cat).filter(filterFn);
              if (catItems.length === 0) return null;
              const catDone = section.items.filter(i => i.category === cat && i.completed).length;
              const catTotal = section.items.filter(i => i.category === cat).length;
              return (
                <div key={cat} className="mb-3">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{cat}</p>
                    <p className={cn('text-[11px] font-bold', catDone === catTotal ? 'text-emerald-500' : 'text-stone-300')}>
                      {catDone}/{catTotal}
                    </p>
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                    {catItems.map((item, idx) => (
                      <div key={item.id}
                        className={cn('border-b border-stone-100 last:border-0 transition-colors duration-100', item.completed && 'bg-stone-50/60')}>
                        <div className="px-4 py-3.5 flex gap-3 items-start">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggle(item)}
                            disabled={saving === item.id}
                            className={cn(
                              'mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200',
                              item.completed ? 'bg-orange-500 border-orange-500 scale-110' : 'border-stone-300 hover:border-orange-400',
                              saving === item.id && 'opacity-50'
                            )}>
                            {item.completed && (
                              <svg width="9" height="9" fill="none" viewBox="0 0 12 12" stroke="white" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5"/>
                              </svg>
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn('text-sm font-semibold leading-tight', item.completed ? 'text-stone-400 line-through' : 'text-stone-800')}>
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {item.isRequired && !item.completed && (
                                  <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 font-bold px-1.5 py-0.5 rounded-md">Wajib</span>
                                )}
                                <button
                                  onClick={() => { setNotesOpen(notesOpen === item.id ? null : item.id); setNoteText(item.notes ?? ''); }}
                                  className={cn('p-1 rounded-md transition-all duration-150', notesOpen === item.id ? 'text-orange-500 bg-orange-50' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100')}>
                                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-stone-400 mt-1 leading-relaxed">{item.description}</p>

                            {item.notes && (
                              <div className="mt-2 flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-2">
                                <span className="text-orange-400 mt-0.5">📝</span>
                                <p className="text-xs text-orange-700 leading-relaxed">{item.notes}</p>
                              </div>
                            )}

                            {item.completedAt && (
                              <p className="text-[11px] text-emerald-500 font-medium mt-1.5">
                                ✓ Selesai {formatDate(item.completedAt)}
                              </p>
                            )}

                            {notesOpen === item.id && (
                              <div className="mt-3 space-y-2">
                                <textarea
                                  value={noteText}
                                  onChange={e => setNoteText(e.target.value)}
                                  placeholder="Tambah catatan untuk tugas ini..."
                                  rows={2}
                                  className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2 resize-none outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition-all"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => saveNote(item.id)}
                                    className="text-xs px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors duration-150">
                                    Simpan
                                  </button>
                                  <button onClick={() => setNotesOpen(null)}
                                    className="text-xs px-3 py-1.5 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors duration-150">
                                    Batal
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {user.items.filter(filterFn).length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">{filter === 'done' ? '📋' : '🎉'}</div>
          <p className="text-stone-400 text-sm">
            {filter === 'done' ? 'Belum ada yang selesai.' : 'Semua sudah selesai!'}
          </p>
        </div>
      )}

      <ChatWidget user={user} />
    </div>
  );
}
