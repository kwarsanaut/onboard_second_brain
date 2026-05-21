'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Department, ChecklistItem, ModelId } from '@/types';
import ModelSelector from '@/components/ModelSelector';

function UploadForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState(searchParams.get('dept') ?? '');
  const [model, setModel] = useState<ModelId>('llama-3.3-70b-versatile');
  const [mode, setMode] = useState<'file' | 'manual'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [manualNotes, setManualNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ChecklistItem[] | null>(null);

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(setDepartments);
  }, []);

  const canSubmit = selectedDept && (mode === 'file' ? !!file : manualNotes.trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const body = new FormData();
    body.append('departmentId', selectedDept);
    body.append('model', model);
    if (mode === 'file' && file) body.append('file', file);
    if (mode === 'manual') body.append('manualNotes', manualNotes);

    const res = await fetch('/api/generate', { method: 'POST', body });
    setLoading(false);

    if (res.ok) {
      setResult((await res.json()).items);
    } else {
      setError((await res.json()).error ?? 'Terjadi kesalahan saat generate');
    }
  }

  const deptName = departments.find(d => d.id === selectedDept)?.name ?? '';

  const steps = [
    { n: 1, label: 'Departemen', done: !!selectedDept },
    { n: 2, label: 'Dokumen', done: mode === 'file' ? !!file : manualNotes.trim().length > 0 },
    { n: 3, label: 'Model AI', done: true },
  ];

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-700 text-sm">← Dashboard</Link>
            <span className="text-slate-200">|</span>
            <h1 className="font-bold text-slate-800">Generate Checklist</h1>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl flex-shrink-0">✓</div>
            <div>
              <p className="font-semibold text-emerald-800">Checklist berhasil dibuat!</p>
              <p className="text-sm text-emerald-600">{result.length} item untuk departemen <strong>{deptName}</strong></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="text-sm font-semibold text-slate-700">Preview Checklist</span>
              <span className="text-xs text-slate-400">{result.length} item</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {result.map((item, i) => (
                <div key={item.id} className="px-5 py-3 flex gap-3">
                  <span className="text-xs text-slate-300 w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      {item.isRequired && <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-md">Wajib</span>}
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setResult(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
              Generate Ulang
            </button>
            <Link href={`/admin/checklist/${selectedDept}`} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-xl text-sm font-semibold">
              Edit Checklist →
            </Link>
            <Link href="/admin" className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-center rounded-xl text-sm font-semibold">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-700 text-sm">← Dashboard</Link>
            <span className="text-slate-200">|</span>
            <h1 className="font-bold text-slate-800">Generate Checklist</h1>
          </div>
          {/* Step indicators */}
          <div className="hidden sm:flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.done ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {s.done ? '✓' : s.n}
                </div>
                <span className={`text-xs hidden md:block ${s.done ? 'text-slate-600' : 'text-slate-400'}`}>{s.label}</span>
                {i < steps.length - 1 && <span className="text-slate-200 mx-1">›</span>}
              </div>
            ))}
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-5">

        {/* Step 1 - Department */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedDept ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {selectedDept ? '✓' : '1'}
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Pilih Departemen</h2>
              {selectedDept && <p className="text-xs text-indigo-600">{deptName}</p>}
            </div>
          </div>
          <div className="p-5">
            {departments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400 mb-3">Belum ada departemen.</p>
                <Link href="/admin/departments" className="text-sm text-indigo-600 hover:underline font-medium">
                  + Buat departemen dulu →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {departments.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDept(d.id)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                      selectedDept === d.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2 - Source */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${(mode === 'file' ? !!file : manualNotes.trim()) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {(mode === 'file' ? !!file : manualNotes.trim()) ? '✓' : '2'}
            </div>
            <h2 className="font-semibold text-slate-800 text-sm">Sumber Informasi</h2>
          </div>
          <div className="p-5">
            <div className="flex gap-2 mb-4">
              {(['file', 'manual'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m === 'file' ? '📄 Upload Dokumen' : '✏️ Input Manual'}
                </button>
              ))}
            </div>

            {mode === 'file' ? (
              <div>
                <p className="text-xs text-slate-400 mb-3">Upload SOP, laporan, atau job desc. Format: PDF, DOCX, TXT</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    file ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  {file ? (
                    <div>
                      <div className="text-3xl mb-2">📄</div>
                      <p className="font-semibold text-slate-700 text-sm">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="mt-2 text-xs text-rose-400 hover:text-rose-600">Hapus</button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📁</div>
                      <p className="text-sm text-slate-500 font-medium">Klik untuk upload</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Tugas & tanggung jawab posisi ini</label>
                <textarea
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  rows={6}
                  placeholder={`Contoh:\n- Mengelola laporan keuangan bulanan\n- Koordinasi dengan vendor eksternal\n- Review kontrak dan PO\n- Membuat presentasi untuk manajemen`}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Step 3 - Model */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
            <h2 className="font-semibold text-slate-800 text-sm">Pilih Model AI</h2>
          </div>
          <div className="p-5">
            <ModelSelector value={model} onChange={setModel} />
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Hint jika belum lengkap */}
        {!canSubmit && !loading && (
          <p className="text-xs text-slate-400 text-center">
            {!selectedDept
              ? '← Pilih departemen terlebih dahulu'
              : mode === 'file'
              ? '← Upload dokumen terlebih dahulu'
              : '← Isi catatan tugas terlebih dahulu'}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full py-4 rounded-2xl text-sm font-bold transition-all disabled:cursor-not-allowed
            bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm
            disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              AI sedang generate checklist...
            </span>
          ) : canSubmit ? '✨ Generate Checklist' : 'Lengkapi langkah di atas'}
        </button>
      </form>
    </div>
  );
}

export default function UploadPage() {
  return <Suspense><UploadForm /></Suspense>;
}
