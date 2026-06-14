'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Assessment, AssessmentQuestion } from '@/types';

type QuestionForm = { questionText: string; options: string[]; correctAnswer: string; points: number };

const emptyForm: QuestionForm = { questionText: '', options: ['', '', '', ''], correctAnswer: '', points: 1 };

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/assessments/${id}`).then(r => r.json()).then(d => {
      setAssessment({ id: d.id, title: d.title, description: d.description, duration: d.duration, threshold: d.threshold, createdAt: d.createdAt });
      setQuestions(d.questions ?? []);
      setLoading(false);
    });
  }, [id]);

  function startEdit(q: AssessmentQuestion) {
    setEditingId(q.id);
    setForm({ questionText: q.questionText, options: [...q.options], correctAnswer: q.correctAnswer, points: q.points });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  function updateOption(i: number, value: string) {
    setForm(f => {
      const options = [...f.options];
      const old = options[i];
      options[i] = value;
      const correctAnswer = f.correctAnswer === old ? value : f.correctAnswer;
      return { ...f, options, correctAnswer };
    });
  }

  function addOption() {
    setForm(f => ({ ...f, options: [...f.options, ''] }));
  }

  function removeOption(i: number) {
    setForm(f => {
      const removed = f.options[i];
      const options = f.options.filter((_, idx) => idx !== i);
      const correctAnswer = f.correctAnswer === removed ? '' : f.correctAnswer;
      return { ...f, options, correctAnswer };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const options = form.options.map(o => o.trim()).filter(Boolean);
    if (!form.questionText.trim()) return setError('Pertanyaan wajib diisi');
    if (options.length < 2) return setError('Minimal 2 opsi jawaban');
    if (!form.correctAnswer || !options.includes(form.correctAnswer)) return setError('Pilih jawaban yang benar');

    setSaving(true); setError('');
    const payload = { questionText: form.questionText.trim(), options, correctAnswer: form.correctAnswer, points: form.points };

    const res = editingId
      ? await fetch(`/api/assessments/${id}/questions/${editingId}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
      : await fetch(`/api/assessments/${id}/questions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });

    setSaving(false);
    if (res.ok) {
      const q = await res.json();
      if (editingId) {
        setQuestions(prev => prev.map(item => item.id === q.id ? q : item));
      } else {
        setQuestions(prev => [...prev, q]);
      }
      cancelEdit();
    } else {
      setError((await res.json()).error ?? 'Gagal menyimpan');
    }
  }

  async function handleDelete(qId: number) {
    if (!confirm('Hapus soal ini?')) return;
    await fetch(`/api/assessments/${id}/questions/${qId}`, { method: 'DELETE' });
    setQuestions(prev => prev.filter(q => q.id !== qId));
    if (editingId === qId) cancelEdit();
  }

  const inp = "w-full h-10 border border-stone-200 rounded-lg px-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-stone-900 placeholder-stone-400";

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <svg className="animate-spin w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (!assessment) return (
    <div className="p-8">
      <p className="text-stone-400 text-sm">Assessment tidak ditemukan.</p>
      <Link href="/hr/assessments" className="text-sm text-orange-500 hover:underline">← Kembali</Link>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <Link href="/hr/assessments" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">← Semua Assessment</Link>
        <h1 className="text-2xl font-black text-stone-900 mt-1">{assessment.title}</h1>
        {assessment.description && <p className="text-sm text-stone-500 mt-0.5">{assessment.description}</p>}
        <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
          <span>⏱ {assessment.duration} menit</span>
          <span>🎯 Lulus ≥ {assessment.threshold}%</span>
          <span>{questions.length} soal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form soal */}
        <div className="md:col-span-2">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-700">{editingId ? 'Edit Soal' : 'Tambah Soal'}</h2>
              {editingId && (
                <button onClick={cancelEdit} className="text-xs text-stone-400 hover:text-stone-600">Batal</button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Pertanyaan *</label>
                <textarea value={form.questionText} onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                  placeholder="Apa langkah pertama saat onboarding karyawan baru?" rows={2} required
                  className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-stone-900 placeholder-stone-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Opsi Jawaban * (pilih radio = jawaban benar)</label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="radio" name="correctAnswer" checked={form.correctAnswer === opt && opt !== ''}
                        onChange={() => setForm(f => ({ ...f, correctAnswer: opt }))}
                        className="flex-shrink-0 accent-orange-500" />
                      <input value={opt} onChange={e => updateOption(i, e.target.value)}
                        placeholder={`Opsi ${i + 1}`} className={inp} />
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="flex-shrink-0 p-1 text-stone-300 hover:text-red-500 transition-colors">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addOption} className="mt-2 text-xs text-orange-500 hover:underline font-semibold">+ Tambah opsi</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Poin</label>
                <input type="number" min={1} value={form.points}
                  onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
                  className={inp} />
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={saving || !form.questionText.trim()}
                className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50">
                {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : '+ Tambah Soal'}
              </button>
            </form>
          </div>
        </div>

        {/* List soal */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Bank Soal</h2>
            <span className="text-xs text-stone-400">{questions.length} soal</span>
          </div>
          {questions.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-10 text-center">
              <p className="text-stone-400 text-sm">Belum ada soal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800">{idx + 1}. {q.questionText}</p>
                      <ul className="mt-2 space-y-1">
                        {q.options.map(opt => (
                          <li key={opt} className={`text-xs px-2.5 py-1 rounded-lg ${opt === q.correctAnswer ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-stone-500'}`}>
                            {opt === q.correctAnswer && '✓ '}{opt}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-stone-400 mt-2">{q.points} poin</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <button onClick={() => startEdit(q)} className="p-1.5 rounded text-stone-300 hover:text-orange-500">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded text-stone-300 hover:text-red-500">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
