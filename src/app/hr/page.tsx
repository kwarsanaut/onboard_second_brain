'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Department, ChecklistTemplate, UserOnboarding } from '@/types';
import { getProgress, formatDate } from '@/lib/utils';

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all duration-200">
      <p className="text-3xl font-black text-stone-900">{value}</p>
      <p className="text-sm font-semibold text-stone-700 mt-1">{label}</p>
      <p className={`text-xs mt-0.5 ${color}`}>{sub}</p>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 16, c = 2 * Math.PI * r;
  return (
    <svg width="40" height="40" className="-rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e7e5e4" strokeWidth="3"/>
      <circle cx="20" cy="20" r={r} fill="none" stroke="#f97316" strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        strokeLinecap="round" className="transition-all duration-500"/>
    </svg>
  );
}

export default function HRDashboard() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [users, setUsers] = useState<UserOnboarding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/departments').then(r => r.json()),
      fetch('/api/checklists').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/users').then(r => r.json()),
    ]).then(([d, c, u]) => {
      setDepartments(d); setChecklists(Array.isArray(c) ? c : []); setUsers(u);
      setLoading(false);
    });
  }, []);

  const getChecklist = (deptId: string) => checklists.find(c => c.departmentId === deptId);
  const getDeptUsers = (deptId: string) => users.filter(u => u.departmentId === deptId);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-3 text-stone-400">
        <svg className="animate-spin w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <span className="text-sm">Memuat data...</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500 mt-0.5">Kelola onboarding wiki per departemen & posisi</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hr/departments" className="h-9 px-4 flex items-center gap-2 border border-stone-200 rounded-lg text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all duration-150">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14"/></svg>
            Departemen
          </Link>
          <Link href="/hr/upload" className="h-9 px-4 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all duration-150 shadow-sm shadow-orange-200">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
            Generate Wiki
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Departemen" value={departments.length} sub="terdaftar" color="text-stone-400" />
        <StatCard label="Wiki Aktif" value={checklists.length} sub="checklist posisi" color="text-orange-500" />
        <StatCard label="Onboarding" value={users.length} sub="karyawan aktif" color="text-emerald-500" />
      </div>

      {/* Departments */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Departemen & Status Wiki</h2>
        <Link href="/hr/departments" className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-150">Kelola →</Link>
      </div>

      {departments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🏢</div>
          <p className="text-stone-400 text-sm mb-5">Belum ada departemen. Mulai dengan membuat satu.</p>
          <Link href="/hr/departments" className="inline-flex items-center gap-2 h-9 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all duration-150">
            + Buat Departemen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {departments.map(dept => {
            const checklist = getChecklist(dept.id);
            const deptUsers = getDeptUsers(dept.id);
            const avg = deptUsers.length > 0 ? Math.round(deptUsers.reduce((a, u) => a + getProgress(u.items), 0) / deptUsers.length) : null;
            return (
              <div key={dept.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-sm font-black text-orange-600">
                      {dept.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 text-sm">{dept.name}</h3>
                      {dept.description && <p className="text-xs text-stone-400 mt-0.5">{dept.description}</p>}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${checklist ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {checklist ? `v${checklist.wikiRevisions ?? 1}` : 'Kosong'}
                  </span>
                </div>

                {checklist && (
                  <p className="text-xs text-stone-400 mb-3">{checklist.items.length} item · {formatDate(checklist.updatedAt)}</p>
                )}

                {avg !== null && deptUsers.length > 0 && (
                  <div className="mb-3 bg-stone-50 rounded-xl p-3 flex items-center gap-3">
                    <ProgressRing value={avg} />
                    <div>
                      <p className="text-xs font-bold text-stone-700">{avg}% rata-rata</p>
                      <p className="text-[10px] text-stone-400">{deptUsers.length} karyawan</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {checklist && (
                    <Link href={`/hr/checklist/${dept.id}`} className="flex-1 h-8 flex items-center justify-center text-xs bg-stone-50 hover:bg-stone-100 text-stone-600 font-semibold rounded-lg border border-stone-200 transition-all duration-150">
                      Edit Wiki
                    </Link>
                  )}
                  <Link href={`/hr/upload?dept=${dept.id}`} className="flex-1 h-8 flex items-center justify-center text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-150">
                    {checklist ? 'Update' : 'Generate'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Users table */}
      {users.length > 0 && (
        <>
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Karyawan Aktif Onboarding</h2>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  {['Nama', 'Departemen', 'Mulai', 'Progress', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-stone-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const p = getProgress(u.items);
                  return (
                    <tr key={u.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors duration-100">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-stone-800">{u.name}</p>
                            {u.positionName && <p className="text-[11px] text-stone-400">{u.positionName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-500">{u.departmentName}</td>
                      <td className="px-5 py-3.5 text-xs text-stone-400">{formatDate(u.startDate)}</td>
                      <td className="px-5 py-3.5 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${p}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-8 text-right ${p >= 100 ? 'text-emerald-500' : 'text-stone-500'}`}>{p}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/employee/${u.id}`} className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors duration-150">Lihat →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
