'use client';
import { useRef } from 'react';

const BASE_RX = 7;
const BASE_RY = -15;

const docs = [
  { name: 'handover_budi.pdf', tag: 'PDF', color: '#ef4444', z: -70, x: '2%', y: '14%', delay: '0s', rot: -8 },
  { name: 'sop_finance.docx', tag: 'DOCX', color: '#3b82f6', z: -30, x: '12%', y: '46%', delay: '1.1s', rot: 5 },
  { name: 'catatan_tim.md', tag: 'MD', color: '#a855f7', z: -100, x: '20%', y: '4%', delay: '0.6s', rot: -3 },
];

const items = [
  { done: true, text: 'Setup environment lokal (Docker, env vars)' },
  { done: true, text: 'Review arsitektur sistem & dokumentasi' },
  { done: true, text: 'Kenalan dengan tim & shadow standup' },
  { done: false, text: 'Review open PR & backlog sprint aktif' },
  { done: false, text: 'Baca handover notes dari Budi' },
];

export default function Hero3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const wrap = wrapRef.current, scene = sceneRef.current;
    if (!wrap || !scene) return;
    const rect = wrap.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    scene.style.transform = `rotateX(${BASE_RX - py * 12}deg) rotateY(${BASE_RY + px * 20}deg)`;
  }
  function reset() {
    if (sceneRef.current) sceneRef.current.style.transform = `rotateX(${BASE_RX}deg) rotateY(${BASE_RY}deg)`;
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={reset}
      aria-hidden
      className="relative w-full h-[420px] sm:h-[500px] lg:h-[560px] select-none"
      style={{ perspective: '1400px' }}
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-3xl opacity-60"
        style={{ background: 'radial-gradient(closest-side, rgba(249,115,22,0.18), transparent)' }} />

      <div
        ref={sceneRef}
        className="scene-3d absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `rotateX(${BASE_RX}deg) rotateY(${BASE_RY}deg)` }}
      >
        {/* perspective grid floor */}
        <div
          className="motion-safe-anim absolute left-1/2 bottom-[-6%] w-[150%] h-[55%] -translate-x-1/2"
          style={{
            transform: 'translateZ(-130px) rotateX(72deg)',
            backgroundImage:
              'linear-gradient(to right, rgba(120,113,108,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.22) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(closest-side, #000 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(closest-side, #000 30%, transparent 80%)',
            animation: 'gridDrift 4s linear infinite',
          }}
        />

        {/* handover documents (the mess) */}
        {docs.map((d) => (
          <div
            key={d.name}
            className="motion-safe-anim absolute"
            style={{ left: d.x, top: d.y, transform: `translateZ(${d.z}px)`, animation: `floatYsm 6s ease-in-out ${d.delay} infinite` }}
          >
            <div
              className="flex items-center gap-2.5 bg-white rounded-xl border border-stone-200 shadow-xl shadow-stone-300/40 px-3 py-2.5 w-[170px]"
              style={{ transform: `rotate(${d.rot}deg)` }}
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0" style={{ background: d.color }}>
                {d.tag}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-stone-700 truncate">{d.name}</p>
                <p className="text-[9px] text-stone-400">dokumen handover</p>
              </div>
            </div>
          </div>
        ))}

        {/* AI core */}
        <div className="absolute left-[40%] top-[42%]" style={{ transform: 'translateZ(30px)' }}>
          <div className="relative">
            <span className="motion-safe-anim absolute inset-0 rounded-full bg-orange-500/40" style={{ animation: 'pulseRing 2.4s ease-out infinite' }} />
            <span className="motion-safe-anim absolute inset-0 rounded-full bg-orange-500/30" style={{ animation: 'pulseRing 2.4s ease-out 1.2s infinite' }} />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/40">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1M7.7 16.3l-2.1 2.1" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3.2" fill="white" stroke="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* flow beam track */}
        <div className="absolute left-[20%] top-[48%] w-[26%] h-[3px] overflow-hidden rounded-full bg-stone-200/60" style={{ transform: 'translateZ(10px)' }}>
          <div className="motion-safe-anim h-full w-1/3 bg-gradient-to-r from-transparent via-orange-500 to-transparent" style={{ animation: 'beamFlow 1.8s ease-in-out infinite' }} />
        </div>

        {/* generated checklist — the product */}
        <div className="absolute right-[1%] top-1/2 -translate-y-1/2" style={{ transform: 'translateZ(90px)' }}>
          <div className="motion-safe-anim w-[290px] sm:w-[320px] bg-white rounded-2xl border border-stone-200 shadow-2xl shadow-stone-400/30 overflow-hidden" style={{ animation: 'floatY 7s ease-in-out infinite' }}>
            {/* chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-50 border-b border-stone-100">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
              <span className="ml-2 text-[10px] text-stone-400">onboardkit.app · checklist</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] text-stone-400 font-medium">Backend Engineer · Engineering</p>
                  <p className="text-sm font-black text-stone-800 mt-0.5">Andi Pratama</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-orange-500 leading-none">60%</p>
                  <p className="text-[9px] text-stone-400 mt-1">3 / 5 selesai</p>
                </div>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full mb-4 overflow-hidden">
                <div className="h-full w-3/5 bg-orange-500 rounded-full" />
              </div>
              <div className="space-y-1.5">
                {items.map((it, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-2 rounded-lg ${it.done ? 'bg-orange-50/70' : ''}`}>
                    <span className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center ${it.done ? 'bg-orange-500 border-orange-500' : 'border-stone-300'}`}>
                      {it.done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </span>
                    <p className={`text-[11px] leading-snug ${it.done ? 'line-through text-stone-400' : 'text-stone-700'}`}>{it.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[8px] font-bold text-stone-500">B</span>
                <p className="text-[9px] text-stone-400">Menggantikan <span className="font-semibold text-stone-500">Budi Santoso</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
