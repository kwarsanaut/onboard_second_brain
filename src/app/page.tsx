import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Hero3D from '@/components/landing/Hero3D';

const problems = [
  {
    color: '#ef4444', bg: 'bg-red-500/10', ring: 'ring-red-500/20',
    title: 'Knowledge ikut resign',
    body: 'Cara kerja, kontak penting, dan “trik” yang tidak terdokumentasi hilang begitu karyawan lama pergi.',
    icon: (<><path d="M12 3v2m0 14v2M5 12H3m18 0h-2" strokeLinecap="round" /><circle cx="12" cy="12" r="4" /><path d="M8 8l-2-2m12 12l-2-2" strokeLinecap="round" /></>),
  },
  {
    color: '#3b82f6', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20',
    title: 'Onboarding tidak konsisten',
    body: 'Tiap manajer punya caranya sendiri. Pengalaman karyawan baru beda-beda dan mustahil diukur.',
    icon: (<><path d="M4 7h7M4 12h11M4 17h6" strokeLinecap="round" /><path d="M17 8l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" /></>),
  },
  {
    color: '#a855f7', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20',
    title: 'Template terlalu generik',
    body: 'Checklist umum tidak relevan — Backend Engineer dan Product Manager dapat tugas yang sama persis.',
    icon: (<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" /></>),
  },
  {
    color: '#f59e0b', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20',
    title: 'HR buang waktu',
    body: 'Menyusun & memperbarui checklist manual tiap ada posisi baru bisa makan waktu berhari-hari.',
    icon: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></>),
  },
];

const steps = [
  {
    n: '01', title: 'Upload handover',
    body: 'Drop PDF, Word, atau catatan teks dari karyawan lama — atau ketik manual. Satu posisi, satu klik.',
  },
  {
    n: '02', title: 'AI menyusun',
    body: 'AI mengekstrak tugas, tools, proses, dan target 30/60/90 hari menjadi checklist spesifik per posisi.',
  },
  {
    n: '03', title: 'Karyawan jalan & terlacak',
    body: 'Pengganti mencentang progres dan menambah catatan; HR memantau perkembangan secara real-time.',
  },
];

const features = [
  {
    title: 'Generate dari dokumen', accent: 'text-orange-500',
    body: 'Baca konteks pekerjaan nyata dari .pdf / .docx / teks, bukan asumsi.',
    icon: (<><path d="M9 13h6m-3-3v6" strokeLinecap="round" /><path d="M14 3v5h5" /><path d="M19 8.5V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h7.5L19 8.5z" /></>),
  },
  {
    title: 'LLM Wiki — merge, bukan timpa', accent: 'text-emerald-500',
    body: 'Dokumen baru memperkaya checklist lama. Versi naik otomatis, item lama tetap aman.',
    icon: (<><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 12l9 5 9-5M3 16l9 5 9-5" /></>),
  },
  {
    title: 'Per posisi, bukan per departemen', accent: 'text-blue-500',
    body: 'Tiap jabatan dapat checklist sendiri yang relevan dengan tugasnya.',
    icon: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>),
  },
  {
    title: 'Asisten AI', accent: 'text-pink-500',
    body: 'Karyawan baru bisa bertanya soal tugas & ekspektasi posisi, langsung dari checklist-nya.',
    icon: (<><path d="M21 12a8 8 0 01-11.5 7.2L4 20l1-4.5A8 8 0 1121 12z" strokeLinejoin="round" /><path d="M9 11h6M9 14h4" strokeLinecap="round" /></>),
  },
  {
    title: 'Kuis & Assessment', accent: 'text-amber-500',
    body: 'Uji pemahaman onboarding dengan kuis yang dibuat otomatis dari checklist.',
    icon: (<><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" /></>),
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(user.user_metadata?.role === 'hr' ? '/hr' : '/employee');

  return (
    <div className="bg-white text-stone-900" style={{ fontFamily: 'var(--font-space, system-ui, sans-serif)' }}>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-stone-100 flex items-center justify-between px-6 md:px-12 h-16">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm">O</div>
          <span className="font-black text-sm tracking-tight">OnboardKit</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-stone-500">
          <a href="#masalah" className="hover:text-stone-900 transition-colors">Masalah</a>
          <a href="#solusi" className="hover:text-stone-900 transition-colors">Solusi</a>
          <a href="#fitur" className="hover:text-stone-900 transition-colors">Fitur</a>
          <Link href="/login" className="hover:text-stone-900 transition-colors">Masuk</Link>
        </nav>
        <Link href="/register" className="h-9 px-5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors">
          Mulai Gratis
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative px-6 md:px-12 pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-6 items-center">
          <div className="motion-safe-anim" style={{ animation: 'riseIn .7s ease-out both' }}>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Onboarding berbasis AI
            </div>
            <h1 className="text-[2.6rem] leading-[1.05] sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              Knowledge yang ikut <span className="text-stone-400 line-through decoration-stone-300">resign</span>,
              <br />sekarang <span className="text-orange-500">tetap tinggal.</span>
            </h1>
            <p className="text-stone-500 text-lg md:text-xl leading-relaxed mb-9 max-w-xl">
              OnboardKit membaca dokumen handover dari karyawan yang pergi, lalu menyusun
              checklist onboarding <span className="text-stone-800 font-semibold">spesifik per posisi</span> — bukan template generik.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-orange-200">
                Mulai Gratis
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <a href="#solusi" className="h-12 px-8 border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 font-medium rounded-xl transition-all flex items-center justify-center text-base">
                Lihat cara kerja
              </a>
            </div>
            <p className="text-xs text-stone-400 mt-5">Gratis · tanpa kartu kredit · checklist siap dalam &lt; 2 menit</p>
          </div>

          {/* 3D scene */}
          <Hero3D />
        </div>
      </section>

      {/* ── Problem (dark) ── */}
      <section id="masalah" className="px-6 md:px-12 py-24 bg-stone-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Masalahnya</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-5">
              Setiap orang resign, sebagian perusahaan ikut lupa caranya kerja.
            </h2>
            <p className="text-stone-400 text-lg leading-relaxed">
              Onboarding yang buruk bukan soal kurang ramah — tapi soal pengetahuan yang tidak pernah benar-benar diserahkan.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {problems.map((p) => (
              <div key={p.title} className="group bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.06]">
                <div className={`w-11 h-11 rounded-xl ${p.bg} ring-1 ${p.ring} flex items-center justify-center mb-5`}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={p.color} strokeWidth={1.8}>{p.icon}</svg>
                </div>
                <h3 className="text-base font-bold mb-2">{p.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution / How it works ── */}
      <section id="solusi" className="px-6 md:px-12 py-24 border-b border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Solusinya</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-stone-900 mb-5">
              Dari dokumen mentah ke checklist siap-jalan, dalam 3 langkah.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ perspective: '1200px' }}>
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="scene-3d relative bg-white border border-stone-200 rounded-2xl p-7 shadow-sm transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{ transform: `rotateY(${(i - 1) * 4}deg)` }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl font-black text-orange-500/90">{s.n}</span>
                  <span className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2.5">{s.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Knowledge Graph highlight ── */}
      <section className="px-6 md:px-12 py-24 bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Knowledge Graph</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-stone-900 mb-5">
              Lihat seluruh pengetahuan tim sebagai satu peta.
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-7">
              Setiap departemen, posisi, wiki, item, dan karyawan terhubung dalam satu graph interaktif.
              Telusuri relasinya — siapa menggantikan siapa, knowledge apa dipakai di posisi mana.
            </p>
            <ul className="space-y-3">
              {['Peta relasi seluruh organisasi', 'Hover untuk menyorot koneksi terkait', 'Klik node untuk langsung membuka detailnya'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2L8 3" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {/* mini constellation */}
          <div className="relative rounded-2xl bg-stone-950 border border-white/10 h-[320px] overflow-hidden shadow-2xl shadow-stone-400/30">
            <svg viewBox="0 0 400 320" className="w-full h-full">
              <g stroke="rgba(168,162,158,0.25)" strokeWidth="1">
                <line x1="200" y1="160" x2="110" y2="80" /><line x1="200" y1="160" x2="300" y2="90" />
                <line x1="200" y1="160" x2="120" y2="240" /><line x1="200" y1="160" x2="300" y2="230" />
                <line x1="110" y1="80" x2="60" y2="150" /><line x1="300" y1="90" x2="350" y2="160" />
                <line x1="120" y1="240" x2="80" y2="180" /><line x1="300" y1="230" x2="340" y2="250" />
                <line x1="110" y1="80" x2="190" y2="60" /><line x1="300" y1="90" x2="240" y2="60" />
              </g>
              {[
                { x: 200, y: 160, r: 13, c: '#f97316' }, { x: 110, y: 80, r: 9, c: '#3b82f6' },
                { x: 300, y: 90, r: 9, c: '#3b82f6' }, { x: 120, y: 240, r: 8, c: '#a855f7' },
                { x: 300, y: 230, r: 8, c: '#a855f7' }, { x: 60, y: 150, r: 5, c: '#10b981' },
                { x: 350, y: 160, r: 5, c: '#10b981' }, { x: 80, y: 180, r: 5, c: '#ec4899' },
                { x: 340, y: 250, r: 5, c: '#eab308' }, { x: 190, y: 60, r: 5, c: '#64748b' },
                { x: 240, y: 60, r: 5, c: '#64748b' },
              ].map((n, i) => (
                <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.c}
                  className="motion-safe-anim" style={{ transformOrigin: `${n.x}px ${n.y}px`, animation: `floatYsm ${5 + (i % 3)}s ease-in-out ${i * 0.3}s infinite` }} />
              ))}
            </svg>
            <div className="absolute bottom-3 left-4 text-[11px] text-stone-500">/hr/graph</div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="fitur" className="px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Kemampuan</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-stone-900">
              Lebih dari sekadar checklist.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group bg-white border border-stone-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-stone-300">
                <div className="w-11 h-11 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-5 transition-colors group-hover:bg-orange-50">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} className={f.accent} stroke="currentColor">{f.icon}</svg>
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-7xl mx-auto rounded-3xl bg-stone-950 px-8 md:px-16 py-16 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(closest-side, rgba(249,115,22,0.35), transparent)' }} />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                Mulai pertahankan<br /><span className="text-orange-400">knowledge tim kamu.</span>
              </h2>
              <p className="text-stone-400 text-lg">Gratis untuk dicoba. Setup dalam hitungan menit.</p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <Link href="/register" className="h-12 px-10 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-orange-500/20">
                Mulai Gratis
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link href="/login" className="h-12 px-10 bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white font-medium rounded-xl transition-colors flex items-center justify-center text-base">
                Sudah punya akun
              </Link>
            </div>
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
