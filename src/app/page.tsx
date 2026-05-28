import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(user.user_metadata?.role === 'hr' ? '/hr' : '/employee');

  return (
    <div className="bg-white min-h-screen text-stone-900" style={{ fontFamily: 'var(--font-space, system-ui, sans-serif)' }}>

      {/* ── Sticky Nav ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100 flex items-center justify-between px-6 md:px-12 h-16">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm">O</div>
          <span className="font-black text-stone-900 text-sm tracking-tight">OnboardKit</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-stone-500">
          <a href="#fitur" className="hover:text-stone-900 transition-colors">Fitur</a>
          <a href="#cara-kerja" className="hover:text-stone-900 transition-colors">Cara Kerja</a>
          <Link href="/login" className="hover:text-stone-900 transition-colors">Masuk</Link>
        </nav>
        <Link href="/register" className="h-9 px-5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors">
          Mulai Gratis
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 pt-20 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="pb-20">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              AI-powered onboarding
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight text-stone-900 mb-6">
              Onboarding checklist<br />
              dari handover<br />
              <span className="text-orange-500">yang nyata.</span>
            </h1>
            <p className="text-stone-500 text-xl leading-relaxed mb-10 max-w-lg">
              Upload dokumen handover karyawan lama. AI extract konteks pekerjaan dan generate checklist yang spesifik — per posisi, bukan template generik.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-orange-200">
                Mulai Gratis
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </Link>
              <Link href="/login" className="h-12 px-8 border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 font-medium rounded-xl transition-all flex items-center justify-center text-base">
                Sudah punya akun
              </Link>
            </div>
          </div>

          {/* Right: Product Mockup */}
          <div className="relative lg:h-[600px] flex items-end justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl shadow-stone-200/60 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-stone-50 border-b border-stone-100">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <div className="flex-1 mx-3 bg-stone-100 rounded-md h-5 flex items-center px-2">
                  <span className="text-[10px] text-stone-400">onboardkit.app/employee/andi</span>
                </div>
              </div>
              {/* Checklist content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-xs text-stone-400 font-medium">Backend Engineer · Engineering</p>
                    <p className="text-sm font-bold text-stone-800 mt-0.5">Andi Pratama</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-orange-500">75%</p>
                    <p className="text-[10px] text-stone-400">9 / 12 selesai</p>
                  </div>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full mb-5 mt-3">
                  <div className="h-full w-3/4 bg-orange-500 rounded-full" />
                </div>
                <div className="space-y-2">
                  {[
                    { done: true,  text: 'Review arsitektur sistem & dokumentasi teknis' },
                    { done: true,  text: 'Setup environment lokal (Docker, env vars)' },
                    { done: true,  text: 'Kenalan dengan tim Backend (Slack, 1-on-1)' },
                    { done: true,  text: 'Shadow standup pertama bersama tim' },
                    { done: false, text: 'Review open PRs dan backlog sprint aktif' },
                    { done: false, text: 'Baca handover notes dari Budi Santoso' },
                    { done: false, text: 'Meeting 1-on-1 dengan Engineering Manager' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg ${item.done ? 'bg-orange-50' : 'hover:bg-stone-50'}`}>
                      <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center ${item.done ? 'bg-orange-500 border-orange-500' : 'border-stone-300'}`}>
                        {item.done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <p className={`text-xs leading-relaxed ${item.done ? 'line-through text-stone-400' : 'text-stone-700'}`}>{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-500">B</div>
                  <p className="text-[10px] text-stone-400">Menggantikan <span className="font-semibold text-stone-500">Budi Santoso</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 1: Generate from docs ── */}
      <section id="fitur" className="px-6 md:px-12 py-28 border-t border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Generate AI</p>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight mb-6">
              Upload sekali.<br />Checklist langsung<br />jadi.
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-8">
              Upload PDF atau Word dari karyawan yang pergi. AI baca konteks pekerjaan nyata — tugas, tools, kontak penting — dan jadikan checklist untuk penggantinya. Tidak ada yang perlu diketik manual.
            </p>
            <ul className="space-y-3">
              {['Mendukung .pdf, .docx, dan input teks manual', 'Pilih dari Groq Llama atau Qwen sebagai model AI', 'Selesai dalam kurang dari 2 menit'].map(t => (
                <li key={t} className="flex items-center gap-3 text-sm text-stone-600">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2L8 3" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {/* Upload mock */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-5">Generate Checklist</p>
            <div className="space-y-3 mb-5">
              <div className="bg-white border border-stone-200 rounded-xl p-4">
                <p className="text-xs text-stone-400 mb-1">Posisi</p>
                <p className="text-sm font-semibold text-stone-800">Backend Engineer</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4">
                <p className="text-xs text-stone-400 mb-1">Menggantikan</p>
                <p className="text-sm font-semibold text-stone-800">Budi Santoso</p>
              </div>
              <div className="bg-white border-2 border-dashed border-orange-200 rounded-xl p-5 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <p className="text-xs font-semibold text-stone-600">handover_budi.pdf</p>
                <p className="text-[10px] text-stone-400">234 KB · siap diproses</p>
              </div>
            </div>
            <button className="w-full h-10 bg-orange-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>
              AI sedang memproses...
            </button>
          </div>
        </div>
      </section>

      {/* ── Feature 2: LLM Wiki ── */}
      <section className="px-6 md:px-12 py-28 bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Wiki mock */}
          <div className="order-2 lg:order-1 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
              <p className="text-xs font-bold text-stone-500">Wiki Checklist · Backend Engineer</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                v3 · diperbarui
              </div>
            </div>
            <div className="p-5 space-y-2">
              {[
                { tag: 'lama', text: 'Review dokumentasi arsitektur microservices' },
                { tag: 'lama', text: 'Setup Kubernetes local via minikube' },
                { tag: 'baru', text: 'Pelajari migration ke GraphQL (dari handover terbaru)' },
                { tag: 'baru', text: 'Ikuti weekly sync dengan tim Platform Engineering' },
                { tag: 'lama', text: 'Review runbook on-call dan alert channels' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-50">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${item.tag === 'baru' ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-400'}`}>
                    {item.tag === 'baru' ? 'BARU' : 'ADA'}
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Text */}
          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">LLM Wiki</p>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight mb-6">
              Upload dokumen<br />baru — checklist<br />makin lengkap.
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed">
              Setiap dokumen baru yang diupload memperkaya checklist yang sudah ada. Bukan menimpa — tapi merge. Checklist posisi Backend Engineer versi 1 akan diperbarui otomatis saat ada dokumen baru, tanpa kehilangan item yang sudah ada sebelumnya.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature 3: Per posisi ── */}
      <section id="cara-kerja" className="px-6 md:px-12 py-28 border-b border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Per Posisi</p>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight mb-6">
              Setiap jabatan<br />checklist-nya<br />berbeda.
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-8">
              Software Engineer dan Product Manager di departemen yang sama punya tugas onboarding yang sangat berbeda. OnboardKit buat checklist per posisi — bukan per departemen seperti template biasa.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { pos: 'Backend Engineer', items: 12 },
                { pos: 'Product Manager', items: 9 },
                { pos: 'Data Scientist', items: 11 },
                { pos: 'UX Designer', items: 8 },
              ].map(p => (
                <div key={p.pos} className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-stone-700">{p.pos}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{p.items} checklist items</p>
                </div>
              ))}
            </div>
          </div>
          {/* HR Dashboard mock */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-stone-100">
              <p className="text-xs font-bold text-stone-500">HR Dashboard · Engineering</p>
            </div>
            <div className="p-5 space-y-3">
              {[
                { pos: 'Backend Engineer', rev: 3, users: 2, progress: 75 },
                { pos: 'Frontend Engineer', rev: 2, users: 1, progress: 40 },
                { pos: 'DevOps Engineer', rev: 1, users: 0, progress: 0 },
                { pos: 'Engineering Manager', rev: 2, users: 1, progress: 100 },
              ].map(p => (
                <div key={p.pos} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-xs font-black text-orange-600">
                      {p.pos[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">{p.pos}</p>
                      <p className="text-[10px] text-stone-400">v{p.rev} · {p.users} karyawan aktif</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold w-7 text-right ${p.progress === 100 ? 'text-emerald-500' : 'text-stone-400'}`}>{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 md:px-12 py-28 bg-stone-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Siap onboarding<br />
              <span className="text-orange-400">lebih efektif?</span>
            </h2>
            <p className="text-stone-400 text-lg">Gratis. Tidak perlu kartu kredit.</p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link href="/register" className="h-12 px-10 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-orange-500/20">
              Mulai Gratis
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </Link>
            <Link href="/login" className="h-12 px-10 bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white font-medium rounded-xl transition-colors flex items-center justify-center text-base">
              Sudah punya akun
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 md:px-12 py-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-xs">O</div>
          <span className="font-bold text-stone-900 text-sm">OnboardKit</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-stone-400">
          <Link href="/login" className="hover:text-stone-600 transition-colors">Masuk</Link>
          <Link href="/register" className="hover:text-stone-600 transition-colors">Daftar</Link>
          <span className="text-stone-300">© 2026 OnboardKit</span>
        </div>
      </footer>

    </div>
  );
}
