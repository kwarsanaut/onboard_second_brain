'use client';
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { QuizQuestion } from '@/types';
import { cn } from '@/lib/utils';

type State = 'loading' | 'ready' | 'quiz' | 'result';

export default function AssessmentPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [state, setState] = useState<State>('loading');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ q: QuizQuestion; picked: string; correct: boolean }[]>([]);
  const answerAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`/api/assessment/generate?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        setQuestions(d.questions ?? []);
        setState(d.questions?.length > 0 ? 'ready' : 'result');
      })
      .catch(() => setState('result'));
  }, [userId]);

  // Putar audio saat layar hasil — beda untuk lulus vs gagal
  useEffect(() => {
    if (state !== 'result') return;
    const pct = questions.length > 0 ? (score / questions.length) * 100 : 0;
    const audio = new Audio(pct < 60 ? '/tamatlah-sudah.mp3' : '/hidup-jokowi.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
    return () => { audio.pause(); };
  }, [state, score, questions.length]);

  function confirm() {
    if (!selected) return;
    const q = questions[current];
    const correct = selected === q.correctAnswer;
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { q, picked: selected, correct }]);
    setConfirmed(true);
    answerAudioRef.current?.pause();
    const correctSounds = ['/jokowi-saya-masih-sanggup-2.mp3', '/click-nice.mp3'];
    const wrongSounds = ['/jokowi-saya-akan-lawan.mp3', '/yo-ndak-tau.mp3'];
    const pool = correct ? correctSounds : wrongSounds;
    const src = pool[Math.floor(Math.random() * pool.length)];
    const audio = new Audio(src);
    answerAudioRef.current = audio;
    audio.play().catch(() => {});
  }

  function next() {
    answerAudioRef.current?.pause();
    if (current + 1 >= questions.length) {
      setState('result');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setConfirmed(false);
    }
  }

  if (state === 'loading') return (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)]">
      <div className="text-center">
        <svg className="animate-spin w-8 h-8 text-orange-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-sm text-stone-400">Menyiapkan kuis...</p>
      </div>
    </div>
  );

  if (state === 'ready') return (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)] px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎯</div>
        <h1 className="text-2xl font-black text-stone-900 mb-3">Assessment Onboarding</h1>
        <p className="text-stone-500 text-sm leading-relaxed mb-2">
          {questions.filter(q => q.type === 'team').length > 0 && (
            <>👁 <strong>{questions.filter(q => q.type === 'team').length} soal</strong> tebak anggota tim<br/></>
          )}
          📋 <strong>{questions.filter(q => q.type === 'handover').length} soal</strong> tentang handover & jobdesk
        </p>
        <p className="text-xs text-stone-400 mb-8">{questions.length} pertanyaan total</p>
        <button onClick={() => setState('quiz')}
          className="h-12 px-10 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-base">
          Mulai Kuis →
        </button>
        <div className="mt-4">
          <Link href={`/employee/${userId}`} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
            ← Kembali ke checklist
          </Link>
        </div>
      </div>
    </div>
  );

  if (state === 'quiz') {
    const q = questions[current];
    const isTeam = q.type === 'team';
    const progress = ((current) / questions.length) * 100;

    return (
      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              {isTeam ? '👁 Tebak Anggota Tim' : '📋 Soal Handover'}
            </span>
            <span className="text-xs text-stone-400">{current + 1} / {questions.length}</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Team quiz: eye crop */}
        {isTeam && q.photoUrl && (
          <div className="mb-6 bg-stone-900 rounded-2xl overflow-hidden">
            <div className="relative overflow-hidden" style={{ height: 140 }}>
              <img
                src={q.photoUrl}
                alt="Siapa ini?"
                className="w-full"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  height: '100%',
                  // marginTop: '-30px',
                  width: '100%',
                  // filter: confirmed ? 'blur(0px)' : 'blur(0px)',
                  filter: confirmed ? 'none' : 'none',
                }}
              />
              {/* Overlay hanya tampilkan area mata */}
              {!confirmed && (
                <>
                  {/* <div className="absolute inset-0 bg-stone-900" style={{ bottom: '30%' }} /> */ }
                  <div className="absolute inset-x-0 top-0 bg-stone-900" style={{ height: '30%' }} />
                  <div className="absolute inset-0 bg-stone-900" style={{ top: '55%' }} />
                </>
              )}
              {confirmed && (
                <div className="absolute inset-0 flex items-end justify-center pb-3">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${selected === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {selected === q.correctAnswer ? '✓ Benar!' : `✗ Ini ${q.correctAnswer}`}
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3">
              <p className="text-white text-sm font-bold text-center">Siapa anggota tim ini?</p>
              <p className="text-stone-400 text-[11px] text-center mt-0.5">Hanya area mata yang terlihat</p>
            </div>
          </div>
        )}

        {/* Handover question */}
        {!isTeam && (
          <div className="mb-6 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <p className="text-stone-800 text-base font-bold leading-relaxed">{q.question}</p>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2.5 mb-6">
          {q.options.map(opt => {
            const isSelected = selected === opt;
            const isCorrect = opt === q.correctAnswer;
            let cls = 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50';
            if (confirmed) {
              if (isCorrect) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800';
              else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-700';
              else cls = 'border-stone-100 bg-stone-50 text-stone-400';
            } else if (isSelected) {
              cls = 'border-orange-500 bg-orange-50 text-orange-800';
            }

            return (
              <button key={opt} disabled={confirmed} onClick={() => setSelected(opt)}
                className={cn('w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150', cls)}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-black',
                    confirmed && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                    confirmed && isSelected && !isCorrect ? 'bg-red-400 border-red-400 text-white' :
                    isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-stone-300')}>
                    {confirmed && isCorrect ? '✓' : confirmed && isSelected && !isCorrect ? '✗' : ''}
                  </div>
                  {opt}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {confirmed && q.explanation && (
          <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-700 leading-relaxed">💡 {q.explanation}</p>
          </div>
        )}

        {/* Action buttons */}
        {!confirmed ? (
          <button onClick={confirm} disabled={!selected}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold rounded-xl transition-all text-sm">
            Konfirmasi Jawaban
          </button>
        ) : (
          <button onClick={next}
            className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-all text-sm">
            {current + 1 >= questions.length ? 'Lihat Hasil →' : 'Soal Berikutnya →'}
          </button>
        )}

      </div>
    );
  }

  // Result
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const teamScore = answers.filter(a => a.q.type === 'team' && a.correct).length;
  const teamTotal = answers.filter(a => a.q.type === 'team').length;
  const handoverScore = answers.filter(a => a.q.type === 'handover' && a.correct).length;
  const handoverTotal = answers.filter(a => a.q.type === 'handover').length;

  return (
    <div className="max-w-lg mx-auto px-5 py-10">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚'}</div>
        <h1 className="text-3xl font-black text-stone-900 mb-1">{pct}%</h1>
        <p className="text-stone-500 text-sm">{score} dari {questions.length} benar</p>
        <p className="text-xs text-stone-400 mt-1">
          {pct >= 80 ? 'Luar biasa! Kamu siap onboarding.' : pct >= 60 ? 'Bagus! Ada beberapa yang perlu dipelajari lagi.' : 'Masih perlu banyak belajar — cek kembali checklistmu.'}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-8">

        {teamTotal > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center">
            <p className="text-2xl font-black text-stone-900">{teamScore}/{teamTotal}</p>
            <p className="text-xs text-stone-400 mt-1">👁 Tebak Anggota Tim</p>
          </div>
        )}
        {handoverTotal > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center">
            <p className="text-2xl font-black text-stone-900">{handoverScore}/{handoverTotal}</p>
            <p className="text-xs text-stone-400 mt-1">📋 Soal Handover</p>
          </div>
        )}
      </div>

      {/* Review jawaban */}
      <div className="space-y-3 mb-8">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Review Jawaban</p>
        {answers.map((a, i) => (
          <div key={i} className={`bg-white border rounded-xl px-4 py-3.5 ${a.correct ? 'border-emerald-200' : 'border-red-200'}`}>
            <div className="flex items-start gap-2">
              <span className={`text-sm flex-shrink-0 mt-0.5 ${a.correct ? 'text-emerald-500' : 'text-red-500'}`}>
                {a.correct ? '✓' : '✗'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-700 leading-snug">{a.q.question}</p>
                {!a.correct && (
                  <p className="text-[11px] text-stone-400 mt-1">Jawaban benar: <span className="font-bold text-emerald-600">{a.q.correctAnswer}</span></p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => { setCurrent(0); setScore(0); setAnswers([]); setSelected(null); setConfirmed(false); setState('ready'); }}
          className="flex-1 h-11 border border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-colors">
          Ulangi Kuis
        </button>
        <Link href={`/employee/${userId}`}
          className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center justify-center transition-colors">
          Kembali ke Checklist
        </Link>
      </div>
    </div>
  );
}
