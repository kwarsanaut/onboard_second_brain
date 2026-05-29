'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserOnboarding } from '@/types';
import { getProgress, formatDate } from '@/lib/utils';

export default function EmployeesPage() {
  const [users, setUsers] = useState<UserOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(d); setLoading(false); });
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.positionName?.toLowerCase().includes(search.toLowerCase()) ||
    u.departmentName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDone = filtered.filter(u => getProgress(u.items) === 100).length;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Karyawan Onboarding</h1>
          <p className="text-sm text-stone-500 mt-0.5">{users.length} karyawan terdaftar · {totalDone} selesai</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, posisi, atau departemen..."
          className="w-full max-w-sm h-9 border border-stone-200 rounded-lg px-3.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white"
        />
      </div>

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-16 flex items-center justify-center">
          <svg className="animate-spin w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-16 text-center">
          <p className="text-stone-400 text-sm">{search ? 'Tidak ada hasil' : 'Belum ada karyawan terdaftar'}</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                {['Karyawan', 'Posisi', 'Mulai', 'Progress', 'Verifikasi', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-stone-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const progress = getProgress(u.items);
                const verifiedCount = u.items.filter(i => i.verified).length;
                const completedCount = u.items.filter(i => i.completed).length;
                return (
                  <tr key={u.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-800">{u.name}</p>
                          {u.replacingPerson && (
                            <p className="text-[11px] text-stone-400">menggantikan {u.replacingPerson}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-stone-700 font-medium">{u.positionName}</p>
                      <p className="text-[11px] text-stone-400">{u.departmentName}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-400 whitespace-nowrap">{formatDate(u.startDate)}</td>
                    <td className="px-5 py-3.5 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-8 text-right ${progress === 100 ? 'text-emerald-500' : 'text-stone-500'}`}>
                          {progress}%
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">{completedCount}/{u.items.length} item</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.items.length === 0 ? (
                        <span className="text-xs text-stone-300">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <span className="text-xs text-stone-500">{verifiedCount}/{u.items.length}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/hr/employees/${u.id}`}
                        className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors whitespace-nowrap">
                        Pantau →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
