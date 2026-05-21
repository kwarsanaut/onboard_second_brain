'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Department, ChecklistTemplate, UserOnboarding } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import { getProgress, formatDate } from '@/lib/utils';

export default function AdminDashboard() {
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
      setDepartments(d);
      setChecklists(Array.isArray(c) ? c : []);
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const getChecklist = (deptId: string) => checklists.find(c => c.departmentId === deptId);
  const getDeptUsers = (deptId: string) => users.filter(u => u.departmentId === deptId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-slate-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">← Beranda</Link>
            <span className="text-slate-200">|</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs">📋</div>
              <h1 className="font-bold text-slate-800">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/departments" className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors">
              + Departemen
            </Link>
            <Link href="/admin/upload" className="text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm">
              ✨ Generate Checklist
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Departemen', value: departments.length, icon: '🏢', color: 'indigo' },
            { label: 'Checklist Aktif', value: checklists.length, icon: '📋', color: 'violet' },
            { label: 'Sedang Onboarding', value: users.length, icon: '👤', color: 'emerald' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="text-3xl font-extrabold text-slate-800 mb-0.5">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Departments */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-700">Departemen</h2>
          <Link href="/admin/departments" className="text-xs text-indigo-600 hover:underline font-medium">Kelola →</Link>
        </div>

        {departments.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
            <div className="text-5xl mb-4">🏢</div>
            <p className="text-slate-500 mb-5 text-sm">Belum ada departemen. Mulai dengan membuat departemen.</p>
            <Link href="/admin/departments" className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              + Buat Departemen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {departments.map(dept => {
              const checklist = getChecklist(dept.id);
              const deptUsers = getDeptUsers(dept.id);
              const avgProgress = deptUsers.length > 0
                ? Math.round(deptUsers.reduce((acc, u) => acc + getProgress(u.items), 0) / deptUsers.length)
                : null;

              return (
                <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{dept.name}</h3>
                      {dept.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{dept.description}</p>}
                    </div>
                    <span className={`ml-2 flex-shrink-0 text-xs px-2 py-1 rounded-lg font-semibold ${checklist ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'}`}>
                      {checklist ? '✓ Siap' : 'Belum'}
                    </span>
                  </div>

                  {checklist ? (
                    <p className="text-xs text-slate-400 mb-3">{checklist.items.length} item · {checklist.model}</p>
                  ) : (
                    <p className="text-xs text-slate-300 mb-3">Belum ada checklist</p>
                  )}

                  {deptUsers.length > 0 && avgProgress !== null && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span>{deptUsers.length} karyawan onboarding</span>
                        <span className="font-semibold">{avgProgress}% rata-rata</span>
                      </div>
                      <ProgressBar value={avgProgress} showLabel={false} size="sm" />
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {checklist && (
                      <Link href={`/admin/checklist/${dept.id}`} className="flex-1 text-center text-xs py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors">
                        Edit
                      </Link>
                    )}
                    <Link href={`/admin/upload?dept=${dept.id}`} className="flex-1 text-center text-xs py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors">
                      {checklist ? 'Regen' : 'Generate'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Users table */}
        {users.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-slate-700 mb-4">Karyawan Aktif Onboarding</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Departemen</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mulai</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-44">Progress</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => {
                    const p = getProgress(u.items);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{u.name}</p>
                          {u.positionName && <p className="text-xs text-slate-400">{u.positionName}</p>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{u.departmentName}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(u.startDate)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <ProgressBar value={p} showLabel={false} size="sm" />
                            </div>
                            <span className={`text-xs font-bold w-8 text-right ${p >= 100 ? 'text-emerald-600' : 'text-slate-500'}`}>{p}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/user/${u.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                            Lihat →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
