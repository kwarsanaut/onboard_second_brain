'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Assessment } from '@/types';

type SafeQuestion = { id: number; assessmentId: number; questionText: string; options: string[]; points: number; createdAt: string };
type ReviewItem = { questionId: number; questionText: string; picked: string | null; correctAnswer: string; correct: boolean };
type Result = { score: number; threshold: number; passed: boolean; correctCount: number; totalQuestions: number; review: ReviewItem[] };

type Stage = 'loading' | 'intro' | 'running' | 'submitting' | 'result' | 'error';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TakeTestPage() {
  const { userId, assessmentId } = useParams<{ userId: string; assessmentId: string }>();
  const [stage, setStage] = useState<Stage>('loading');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<SafeQuestion[]>([]);
  const [ongoingTestId, setOngoingTestId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const submittingRef = useRef(false);

  // Muat info assessment untuk halaman intro
  useEffect(() => {
    fetch(`/api/assessments/${assessmentId}`).then(async r => {
      if (!r.ok) { setStage('error'); setErrorMsg('Tes tidak ditemukan.'); return; }
      const d = await r.json();
      setAssessment({ id: d.id, title: d.title, description: d.description, duration: d.duration, threshold: d.threshold, createdAt: d.createdAt });
      setStage('intro');
    });
  }, [assessmentId]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || !ongoingTestId) return;
    submittingRef.current = true;
    setStage('submitting');
    const payload = {
      ongoingTestId,
      answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId: Number(questionId), answer })),
    };
    const res = await fetch(`/api/assessments/${assessmentId}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setErrorMsg((await res.json()).error ?? 'Gagal mengirim jawaban');
      setStage('error');
      submittingRef.current = false;
      return;
    }
    setResult(await res.json());
    setStage('result');
  }, [ongoingTestId, answers, assessmentId]);

  // Hitung mundur waktu tes
  useEffect(() => {
    if (stage !== 'running') return;
    if (secondsLeft <= 0) {
      const t = setTimeout(() => handleSubmit(), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, secondsLeft, handleSubmit]);

  async function handleStart() {
    setStage('loading');
    const res = await fetch(`/api/assessments/${assessmentId}/start`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      setErrorMsg((await res.json()).error ?? 'Gagal memulai tes');
      setStage('error');
      return;
    }
    const d = await res.json();
    setOngoingTestId(d.ongoingTestId);
    setQuestions(d.questions);
    setSecondsLeft((d.assessment.duration as number) * 60);
    setStage('running');
  }

  function pick(questionId: number, option: string) {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  }

  const spinner = (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)]">
      <svg className="animate-spin w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (stage === 'loading') return spinner;

  if (stage === 'error') return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <Link href={`/employee/${userId}/tests`} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">← Kembali</Link>
      <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <p className="text-sm font-bold text-red-600">{errorMsg}</p>
      </div>
    </div>
  );

  if (stage === 'intro' && assessment) return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <Link href={`/employee/${userId}/tests`} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">← Kembali</Link>
      <div className="mt-4 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-lg font-black text-stone-900">{assessment.title}</h1>
        {assessment.description && <p className="text-sm text-stone-500 mt-1.5">{assessment.description}</p>}
        <div className="flex items-center gap-4 mt-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">⏱ <strong>{assessment.duration} menit</strong></span>
          <span className="flex items-center gap-1.5">🎯 Lulus minimal <strong>{assessment.threshold}%</strong></span>
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
          <p className="text-xs text-amber-700">Setelah tes dimulai, waktu akan terus berjalan dan tes akan otomatis terkirim saat waktu habis. Pastikan kamu siap sebelum menekan tombol di bawah.</p>
        </div>
        <button onClick={handleStart}
          className="mt-5 w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all">
          Mulai Tes
        </button>
      </div>
    </div>
  );

  if (stage === 'running' || stage === 'submitting') return (
    <div className="max-w-2xl mx-auto px-5 py-6 pb-28">
      <div className="sticky top-0 z-10 -mx-5 px-5 py-3 bg-stone-50/95 backdrop-blur border-b border-stone-200 flex items-center justify-between mb-5">
        <p className="text-sm font-bold text-stone-800">{assessment?.title}</p>
        <span className={`text-sm font-black tabular-nums ${secondsLeft <= 60 ? 'text-red-500' : 'text-stone-700'}`}>⏱ {formatTime(secondsLeft)}</span>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-stone-800">{idx + 1}. {q.questionText}</p>
            <div className="mt-3 space-y-2">
              {q.options.map(opt => (
                <label key={opt}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm cursor-pointer transition-all ${answers[q.id] === opt ? 'border-orange-400 bg-orange-50 text-orange-700 font-semibold' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                  <input type="radio" name={`q-${q.id}`} className="accent-orange-500"
                    checked={answers[q.id] === opt} onChange={() => pick(q.id, opt)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-5 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <p className="text-xs text-stone-400">{Object.keys(answers).length}/{questions.length} terjawab</p>
          <button onClick={handleSubmit} disabled={stage === 'submitting'}
            className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
            {stage === 'submitting' ? 'Mengirim...' : 'Selesai & Kirim'}
          </button>
        </div>
      </div>
    </div>
  );

  if (stage === 'result' && result) return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <Link href={`/employee/${userId}/tests`} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">← Kembali ke daftar tes</Link>

      <div className={`mt-4 rounded-2xl p-6 text-center border ${result.passed ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
        <div className="text-4xl mb-2">{result.passed ? '🎉' : '😕'}</div>
        <p className={`text-3xl font-black ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>{result.score}%</p>
        <p className={`text-sm font-bold mt-1 ${result.passed ? 'text-emerald-700' : 'text-red-600'}`}>
          {result.passed ? 'Selamat, kamu lulus!' : `Belum lulus (minimal ${result.threshold}%)`}
        </p>
        <p className="text-xs text-stone-400 mt-1">{result.correctCount}/{result.totalQuestions} jawaban benar</p>
      </div>

      <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-6 mb-3">Pembahasan</h2>
      <div className="space-y-3">
        {result.review.map((r, idx) => (
          <div key={r.questionId} className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-sm font-bold text-stone-800">{idx + 1}. {r.questionText}</p>
            <div className="mt-2 space-y-1 text-xs">
              <p className={r.correct ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                {r.correct ? '✓' : '✗'} Jawabanmu: {r.picked ?? '(tidak dijawab)'}
              </p>
              {!r.correct && <p className="text-stone-500">Jawaban benar: <span className="font-semibold text-stone-700">{r.correctAnswer}</span></p>}
            </div>
          </div>
        ))}
      </div>

      {!result.passed && (
        <button onClick={() => { setStage('intro'); setAnswers({}); setResult(null); }}
          className="mt-5 w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all">
          Coba Lagi
        </button>
      )}
    </div>
  );

  return null;
}
