'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Assessment, OngoingTest } from '@/types';
import { ONGOING_TEST_STATUS } from '@/types';

export default function EmployeeTestsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<OngoingTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/assessments').then(r => r.json()),
      fetch(`/api/users/${userId}/test-attempts`).then(r => r.json()),
    ]).then(([a, t]) => { setAssessments(a); setAttempts(t); setLoading(false); });
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)]">
      <svg className="animate-spin w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <div className="mb-5">
        <Link href={`/employee/${userId}`} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">← Kembali</Link>
        <h1 className="text-lg font-black text-stone-900 mt-1">Tes Pengetahuan</h1>
        <p className="text-xs text-stone-400 mt-0.5">Kerjakan tes yang sudah disiapkan oleh HR untuk menguji pemahaman onboarding kamu.</p>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-10 text-center">
          <p className="text-stone-400 text-sm">Belum ada tes yang tersedia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map(a => {
            const myAttempts = attempts.filter(t => t.assessmentId === a.id);
            const latest = myAttempts[0];
            const passed = myAttempts.some(t => t.status === ONGOING_TEST_STATUS.PASSED);

            let badge: { label: string; cls: string } | null = null;
            if (passed) badge = { label: '✓ Lulus', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
            else if (latest?.status === ONGOING_TEST_STATUS.IN_PROGRESS) badge = { label: 'Sedang berjalan', cls: 'bg-amber-50 text-amber-600 border-amber-100' };
            else if (latest?.status === ONGOING_TEST_STATUS.FAILED) badge = { label: 'Belum lulus', cls: 'bg-red-50 text-red-500 border-red-100' };

            return (
              <Link key={a.id} href={`/employee/${userId}/tests/${a.id}`}
                className="block bg-white border border-stone-200 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-stone-800">{a.title}</p>
                      {badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badge.cls}`}>{badge.label}</span>
                      )}
                    </div>
                    {a.description && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                      <span>⏱ {a.duration} menit</span>
                      <span>🎯 Lulus ≥ {a.threshold}%</span>
                      {myAttempts.length > 0 && <span>{myAttempts.length}x dicoba</span>}
                    </div>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    className="text-stone-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
