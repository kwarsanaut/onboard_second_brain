'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Department, Position, ChecklistItem, ModelId, AdditionalCategory, OnboardingType } from '@/types';
import ModelSelector from '@/components/ModelSelector';

const ADDITIONAL_OPTIONS: { id: AdditionalCategory; label: string; icon: string; desc: string }[] = [
  { id: 'it-setup', label: 'Setup IT & Akses', icon: '💻', desc: 'Laptop, email, VPN, badge, sistem' },
  { id: 'hr-admin', label: 'Administrasi HR', icon: '📋', desc: 'Kontrak, BPJS, payroll, kebijakan' },
  { id: 'team-intro', label: 'Perkenalan Tim', icon: '🤝', desc: 'Tim, manager, stakeholder, buddy' },
];

function UploadForm() {
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [newPosName, setNewPosName] = useState('');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('dept') ?? '');
  const [selectedPos, setSelectedPos] = useState(searchParams.get('pos') ?? '');
  const [onboardingType, setOnboardingType] = useState<OnboardingType>('replacement');
  const [replacingPerson, setReplacingPerson] = useState('');
  const [additionalCategories, setAdditionalCategories] = useState<AdditionalCategory[]>(['it-setup', 'hr-admin', 'team-intro']);
  const [model, setModel] = useState<ModelId>('llama-3.3-70b-versatile');
  const [mode, setMode] = useState<'file' | 'manual'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [manualNotes, setManualNotes] = useState('');
  const [forceNew, setForceNew] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingPos, setAddingPos] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ items: ChecklistItem[]; isWikiUpdate: boolean; positionId: string; wikiStats?: { added: number; updated: number; removed: number } } | null>(null);

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(setDepartments);
  }, []);

  useEffect(() => {
    if (!selectedDept) return;
    fetch(`/api/positions?departmentId=${selectedDept}`).then(r => r.json()).then(setPositions);
    setSelectedPos('');
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedPos) { setHasExisting(false); return; }
    fetch(`/api/checklists/position/${selectedPos}`).then(r => setHasExisting(r.ok));
  }, [selectedPos]);

  async function handleAddPosition() {
    if (!newPosName.trim() || !selectedDept) return;
    setAddingPos(true);
    const res = await fetch('/api/positions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newPosName, departmentId: selectedDept }) });
    if (res.ok) {
      const pos = await res.json();
      setPositions(p => [...p, pos]);
      setSelectedPos(pos.id);
      setNewPosName('');
    }
    setAddingPos(false);
  }

  function toggleAdditional(cat: AdditionalCategory) {
    setAdditionalCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  const canSubmit = selectedPos && (mode === 'file' ? !!file : manualNotes.trim().length > 0) &&
    (onboardingType === 'new-hire' || replacingPerson.trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const body = new FormData();
    body.append('positionId', selectedPos);
    body.append('model', model);
    body.append('onboardingType', onboardingType);
    body.append('additionalCategories', JSON.stringify(additionalCategories));
    if (forceNew) body.append('forceNew', 'true');
    if (replacingPerson.trim()) body.append('replacingPerson', replacingPerson.trim());
    if (mode === 'file' && file) body.append('file', file);
    if (mode === 'manual') body.append('manualNotes', manualNotes);
    const res = await fetch('/api/generate', { method: 'POST', body });
    setLoading(false);
    if (res.ok) setResult({ ...(await res.json()), positionId: selectedPos });
    else setError((await res.json()).error ?? 'Error');
  }

  const posName = positions.find(p => p.id === selectedPos)?.name ?? '';

  if (result) return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className={`rounded-2xl p-5 mb-6 flex items-start gap-4 ${result.isWikiUpdate ? 'bg-indigo-50 border border-indigo-200' : 'bg-emerald-50 border border-emerald-200'}`}>
        <span className="text-3xl">{result.isWikiUpdate ? '🔄' : '✅'}</span>
        <div>
          <p className="font-black text-slate-800 text-lg">{result.isWikiUpdate ? 'Wiki diperbarui!' : 'Wiki berhasil dibuat!'}</p>
          <p className="text-sm text-slate-600 mt-1">
            {result.isWikiUpdate && result.wikiStats
              ? `+${result.wikiStats.added} baru · ${result.wikiStats.updated} diperbarui · ${result.wikiStats.removed} dihapus`
              : `${result.items.filter(i => i.source === 'document').length} item dari dokumen · ${result.items.filter(i => i.source === 'additional').length} item tambahan`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-black text-slate-700">Preview: {posName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{result.items.length} total item</p>
        </div>
        {['document', 'additional'].map(src => {
          const items = result.items.filter(i => i.source === src);
          if (items.length === 0) return null;
          return (
            <div key={src}>
              <div className="px-5 py-2 bg-slate-50/50 border-y border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {src === 'document' ? '📄 Dari Dokumen' : '✦ Tambahan'}
                </span>
              </div>
              {items.map((item, i) => (
                <div key={item.id} className="px-5 py-3 flex gap-3 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-300 w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setResult(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-semibold">Upload Lagi</button>
        <Link href={`/hr/checklist/${result.positionId}`} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-xl text-sm font-black">Edit Wiki →</Link>
        <Link href="/hr" className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-center rounded-xl text-sm font-black">Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
      <div className="mb-2">
        <h1 className="text-xl font-black text-slate-800">Generate / Update Wiki</h1>
        <p className="text-sm text-slate-500 mt-1">Buat checklist onboarding per posisi, spesifik untuk tiap orang</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Dept + Position */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${selectedPos ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{selectedPos ? '✓' : '1'}</div>
            <h2 className="font-black text-slate-700 text-sm">Departemen & Posisi</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Dept */}
            {departments.length === 0
              ? <p className="text-sm text-slate-400">Belum ada departemen. <Link href="/hr/departments" className="text-indigo-600 font-semibold">Buat dulu →</Link></p>
              : <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">Departemen</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {departments.map(d => (
                      <button key={d.id} type="button" onClick={() => setSelectedDept(d.id)}
                        className={`p-2.5 rounded-xl border-2 text-xs font-bold text-left transition-all ${selectedDept === d.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
            }

            {/* Position */}
            {selectedDept && (
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">Posisi / Jabatan</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {positions.map(p => (
                    <button key={p.id} type="button" onClick={() => setSelectedPos(p.id)}
                      className={`p-2.5 rounded-xl border-2 text-xs font-bold text-left transition-all ${selectedPos === p.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                      {p.name}
                    </button>
                  ))}
                  <div className="flex gap-1.5 col-span-full sm:col-span-1">
                    <input value={newPosName} onChange={e => setNewPosName(e.target.value)}
                      placeholder="+ Posisi baru..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddPosition())}
                      className="flex-1 border border-dashed border-slate-300 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-indigo-400 min-w-0" />
                    <button type="button" onClick={handleAddPosition} disabled={addingPos || !newPosName.trim()}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold disabled:opacity-40">
                      {addingPos ? '...' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Wiki mode */}
                {selectedPos && hasExisting && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3">
                    <span>🔄</span>
                    <div className="flex-1">
                      <p className="text-xs font-black text-indigo-700">Mode Wiki Update</p>
                      <p className="text-xs text-indigo-500">Dokumen baru akan di-merge ke wiki yang ada</p>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                      <input type="checkbox" checked={forceNew} onChange={e => setForceNew(e.target.checked)} />
                      <span className="text-xs text-indigo-600 font-semibold">Buat ulang</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Onboarding type + replacing person */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${onboardingType === 'new-hire' || replacingPerson.trim() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{onboardingType === 'new-hire' || replacingPerson.trim() ? '✓' : '2'}</div>
            <h2 className="font-black text-slate-700 text-sm">Tipe Rekrutmen</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {([['replacement', '🔄', 'Replacement', 'Menggantikan orang yang ada'], ['new-hire', '🌱', 'Fresh Hire', 'Posisi baru / tambahan headcount']] as const).map(([type, icon, label, desc]) => (
                <button key={type} type="button" onClick={() => setOnboardingType(type as OnboardingType)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${onboardingType === type ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="text-xl block mb-1">{icon}</span>
                  <p className="text-sm font-black text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>

            {onboardingType === 'replacement' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Orang yang Digantikan *</label>
                <input value={replacingPerson} onChange={e => setReplacingPerson(e.target.value)}
                  placeholder="cth: Ahmad Fauzi, Budi Santoso..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                <p className="text-xs text-slate-400 mt-1">Nama ini dipakai LLM untuk konteks checklist dan ditampilkan ke karyawan baru.</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Document */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${(mode === 'file' ? !!file : manualNotes.trim()) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{(mode === 'file' ? !!file : manualNotes.trim()) ? '✓' : '3'}</div>
            <h2 className="font-black text-slate-700 text-sm">Dokumen Sumber</h2>
          </div>
          <div className="p-5">
            <div className="flex gap-2 mb-4">
              {(['file', 'manual'] as const).map(m => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {m === 'file' ? '📄 Upload File' : '✏️ Manual'}
                </button>
              ))}
            </div>
            {mode === 'file' ? (
              <div onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}`}>
                {file ? (
                  <div>
                    <div className="text-2xl mb-2">📄</div>
                    <p className="font-bold text-slate-700 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="mt-2 text-xs text-rose-400">Hapus</button>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-2">📁</div>
                    <p className="text-sm text-slate-500 font-semibold">Klik untuk upload</p>
                    <p className="text-xs text-slate-400 mt-1">Handover doc, SOP, job desc · PDF, DOCX, TXT</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea value={manualNotes} onChange={e => setManualNotes(e.target.value)} rows={5}
                placeholder="Tulis tugas, tanggung jawab, tools, dan proses utama posisi ini..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
            )}
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        {/* Step 4: Additional */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">✓</div>
            <h2 className="font-black text-slate-700 text-sm">Checklist Tambahan</h2>
            <span className="text-xs text-slate-400 ml-auto">Dipilih LLM generate otomatis</span>
          </div>
          <div className="p-5 grid grid-cols-3 gap-3">
            {ADDITIONAL_OPTIONS.map(opt => (
              <button key={opt.id} type="button" onClick={() => toggleAdditional(opt.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${additionalCategories.includes(opt.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <span className="text-xl block mb-2">{opt.icon}</span>
                <p className="text-xs font-black text-slate-800 leading-tight">{opt.label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 5: Model */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">✓</div>
            <h2 className="font-black text-slate-700 text-sm">Model AI</h2>
          </div>
          <div className="p-5">
            <ModelSelector value={model} onChange={setModel} />
          </div>
        </div>

        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">⚠️ {error}</div>}

        {!canSubmit && !loading && (
          <p className="text-xs text-slate-400 text-center">
            {!selectedPos ? 'Pilih posisi dulu' : (onboardingType === 'replacement' && !replacingPerson.trim()) ? 'Isi nama orang yang digantikan' : 'Upload file atau isi catatan'}
          </p>
        )}

        <button type="submit" disabled={loading || !canSubmit}
          className="w-full py-4 rounded-2xl text-sm font-black transition-all bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 shadow-sm shadow-indigo-200">
          {loading
            ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Generating...</span>
            : canSubmit ? (hasExisting && !forceNew ? '🔄 Update Wiki' : '✦ Generate Wiki') : 'Lengkapi form'}
        </button>
      </form>
    </div>
  );
}

export default function HRUploadPage() {
  return <Suspense><UploadForm /></Suspense>;
}
