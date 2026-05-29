'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import type { UserOnboarding, UserChecklistItem } from '@/types';
import { getProgress, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  'it-setup': 'Setup IT',
  'hr-admin': 'Administrasi',
  'team-intro': 'Perkenalan Tim',
  'document': 'Dari Dokumen',
  'general': 'Umum',
};

export default function ManagerEmployeeDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [user, setUser] = useState<UserOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'done' | 'pending' | 'verified'>('all');

  useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.json()).then(d => { setUser(d); setLoading(false); });
  }, [userId]);

  async function toggleVerify(item: UserChecklistItem) {
    if (!user) return;
    setVerifying(item.id);
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, verified: !item.verified }),
    });
    if (res.ok) setUser(await res.json());
    setVerifying(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <svg className="animate-spin w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (!user) return (
    <div className="p-8">
      <p className="text-stone-500">Karyawan tidak ditemukan.</p>
      <Link href="/hr/employees" className="text-orange-500 text-sm font-semibold">← Kembali</Link>
    </div>
  );

  const progress = getProgress(user.items);
  const verifiedCount = user.items.filter(i => i.verified).length;
  const completedCount = user.items.filter(i => i.completed).length;

  const filteredItems = user.items.filter(item => {
    if (filter === 'done') return item.completed;
    if (filter === 'pending') return !item.completed;
    if (filter === 'verified') return item.verified;
    return true;
  });

  const categories = [...new Set(user.items.map(i => i.category))];

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link href="/hr/employees" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 mb-6 transition-colors font-medium">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Semua Karyawan
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-lg font-black text-orange-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900">{user.name}</h1>
            <p className="text-sm text-stone-500 mt-0.5">{user.positionName} · {user.departmentName}</p>
            {user.replacingPerson && (
              <p className="text-xs text-stone-400 mt-0.5">Menggantikan <span className="font-semibold text-stone-500">{user.replacingPerson}</span></p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-400 mb-1">Mulai {formatDate(user.startDate)}</p>
          <p className="text-2xl font-black text-orange-500">{progress}%</p>
          <p className="text-xs text-stone-400">{completedCount}/{user.items.length} selesai</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-2xl font-black text-stone-900">{completedCount}</p>
          <p className="text-xs text-stone-500 mt-0.5">Item selesai</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-2xl font-black text-emerald-600">{verifiedCount}</p>
          <p className="text-xs text-stone-500 mt-0.5">Diverifikasi manager</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-2xl font-black text-stone-400">{user.items.length - completedCount}</p>
          <p className="text-xs text-stone-500 mt-0.5">Belum selesai</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {verifiedCount > 0 && (
          <div className="h-1 bg-stone-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${(verifiedCount / user.items.length) * 100}%` }} />
          </div>
        )}
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-[11px] text-stone-400"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Progress karyawan</span>
          <span className="flex items-center gap-1.5 text-[11px] text-stone-400"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Verifikasi manager</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5">
        {(['all', 'done', 'pending', 'verified'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('h-7 px-3 rounded-lg text-xs font-semibold transition-all', filter === f ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}>
            {f === 'all' ? 'Semua' : f === 'done' ? 'Selesai' : f === 'pending' ? 'Pending' : 'Terverifikasi'}
          </button>
        ))}
        <span className="text-xs text-stone-400 ml-2">{filteredItems.length} item</span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filteredItems.map(item => (
          <div key={item.id}
            className={cn('bg-white border rounded-xl px-4 py-3.5 flex items-start gap-3 group transition-all',
              item.verified ? 'border-emerald-200 bg-emerald-50/30' : item.completed ? 'border-stone-200' : 'border-stone-200 opacity-70'
            )}>
            {/* Employee completion indicator */}
            <div className={cn('w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
              item.completed ? 'bg-orange-500 border-orange-500' : 'border-stone-300')}>
              {item.completed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2L8 3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn('text-sm font-semibold leading-tight', item.completed ? 'text-stone-800' : 'text-stone-500')}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{item.description}</p>
                  )}
                  {item.notes && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                      <p className="text-xs text-amber-700 leading-relaxed">📝 {item.notes}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded font-medium">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                    {item.completed && item.completedAt && (
                      <span className="text-[10px] text-stone-400">selesai {formatDate(item.completedAt)}</span>
                    )}
                    {item.verified && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Terverifikasi
                      </span>
                    )}
                  </div>
                </div>

                {/* Verify button — only for completed items */}
                {item.completed && (
                  <button
                    onClick={() => toggleVerify(item)}
                    disabled={verifying === item.id}
                    className={cn(
                      'flex-shrink-0 h-7 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                      item.verified
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-stone-100 text-stone-500 hover:bg-orange-50 hover:text-orange-600 opacity-0 group-hover:opacity-100'
                    )}>
                    {verifying === item.id ? '...' : item.verified ? '✓ Verified' : 'Verifikasi'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-stone-400 text-sm">Tidak ada item untuk filter ini</div>
      )}
    </div>
  );
}
