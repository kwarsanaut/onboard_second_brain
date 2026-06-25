'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export type GraphNodeType = 'department' | 'position' | 'checklist' | 'item' | 'category' | 'employee' | 'team';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  href?: string;
  meta?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

interface SimNode extends GraphNode {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  r: number;
  degree: number;
  charge: number;
  // projected (recomputed every frame)
  sx: number; sy: number; sc: number; dz: number;
}

const TYPE_STYLE: Record<GraphNodeType, { color: string; r: number; label: string }> = {
  department: { color: '#f97316', r: 13, label: 'Departemen' },
  position:   { color: '#3b82f6', r: 10, label: 'Posisi' },
  checklist:  { color: '#a855f7', r: 11, label: 'Wiki Checklist' },
  category:   { color: '#10b981', r: 8,  label: 'Kategori' },
  employee:   { color: '#ec4899', r: 9,  label: 'Karyawan' },
  team:       { color: '#eab308', r: 7,  label: 'Anggota Tim' },
  item:       { color: '#64748b', r: 4,  label: 'Item Knowledge' },
};

const ALL_TYPES = Object.keys(TYPE_STYLE) as GraphNodeType[];

// ── Physics (3D) ──
const REPULSION = 3200;        // makin besar → node makin berjarak
const LINK_DIST = 72;          // panjang ikatan antar node terhubung
const LINK_STRENGTH = 0.04;
const DAMPING = 0.86;
const CENTER_PULL = 0.0015;    // containment konstan → cloud tidak kabur (kecil = lebih renggang)
const JITTER = 0.28;           // gerak brownian → node mengambang
const ALPHA_FLOOR = 0.06;     // physics tidak pernah benar-benar berhenti
const ALPHA_DECAY = 0.985;
const ALPHA_REHEAT = 0.5;

// ── Camera (statis, tanpa auto-rotasi) ──
const FOCAL = 640;
const MIN_K = 0.15;
const MAX_K = 5;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function KnowledgeGraph({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const simRef = useRef<SimNode[]>([]);
  const linksRef = useRef<{ s: SimNode; t: SimNode }[]>([]);
  const adjRef = useRef<Map<string, Set<string>>>(new Map());
  const viewRef = useRef({ k: 1 });
  const rotRef = useRef({ yaw: 0.5, pitch: -0.32 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const dprRef = useRef(1);
  const alphaRef = useRef(1);
  const hoverRef = useRef<SimNode | null>(null);
  const playingRef = useRef(true);
  const dragRef = useRef<{ active: boolean; node: SimNode | null; lastX: number; lastY: number; dist: number }>(
    { active: false, node: null, lastX: 0, lastY: 0, dist: 0 }
  );
  const rafRef = useRef(0);
  const queryRef = useRef('');
  const hiddenRef = useRef<Set<GraphNodeType>>(new Set());

  const [hoverLabel, setHoverLabel] = useState<{ label: string; type: GraphNodeType; meta?: string; clickable: boolean } | null>(null);
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState<Set<GraphNodeType>>(new Set());
  const [playing, setPlaying] = useState(true);

  useEffect(() => { queryRef.current = query.trim().toLowerCase(); }, [query]);
  useEffect(() => { hiddenRef.current = hidden; }, [hidden]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // ── Build / rebuild simulation ──
  useEffect(() => {
    const degree = new Map<string, number>();
    for (const e of edges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }

    const n = nodes.length;
    const init = 30 * Math.cbrt(Math.max(n, 1)) + 40;
    const sim: SimNode[] = nodes.map((node) => {
      const deg = degree.get(node.id) ?? 0;
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const rad = init * Math.cbrt(Math.random());
      return {
        ...node,
        x: rad * Math.sin(phi) * Math.cos(theta),
        y: rad * Math.sin(phi) * Math.sin(theta),
        z: rad * Math.cos(phi),
        vx: 0, vy: 0, vz: 0,
        degree: deg,
        r: TYPE_STYLE[node.type].r + Math.min(deg, 18) * 0.7,
        charge: 1 + Math.min(deg, 16) * 0.12,
        sx: 0, sy: 0, sc: 1, dz: 0,
      };
    });

    const byId = new Map(sim.map(s => [s.id, s]));
    const links: { s: SimNode; t: SimNode }[] = [];
    const adj = new Map<string, Set<string>>();
    for (const e of edges) {
      const s = byId.get(e.source);
      const t = byId.get(e.target);
      if (!s || !t) continue;
      links.push({ s, t });
      if (!adj.has(s.id)) adj.set(s.id, new Set());
      if (!adj.has(t.id)) adj.set(t.id, new Set());
      adj.get(s.id)!.add(t.id);
      adj.get(t.id)!.add(s.id);
    }

    simRef.current = sim;
    linksRef.current = links;
    adjRef.current = adj;
    alphaRef.current = 1;

    for (let i = 0; i < 220; i++) step(1);
    fitView();
  }, [nodes, edges]);

  // ── One physics tick (3D) ──
  function step(alpha: number) {
    const sim = simRef.current;
    const links = linksRef.current;
    const len = sim.length;

    for (let i = 0; i < len; i++) {
      const a = sim[i];
      for (let j = i + 1; j < len; j++) {
        const b = sim[j];
        let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        let d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; dz = Math.random() - 0.5; d2 = dx * dx + dy * dy + dz * dz + 0.01; }
        const d = Math.sqrt(d2);
        const f = (REPULSION * a.charge * b.charge) / d2 * alpha;
        const fx = (dx / d) * f, fy = (dy / d) * f, fz = (dz / d) * f;
        a.vx += fx; a.vy += fy; a.vz += fz;
        b.vx -= fx; b.vy -= fy; b.vz -= fz;
      }
    }

    for (const { s, t } of links) {
      const dx = t.x - s.x, dy = t.y - s.y, dz = t.z - s.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
      const desired = LINK_DIST + Math.min((s.degree + t.degree) * 0.9, 70);
      const f = (d - desired) * LINK_STRENGTH * alpha;
      const fx = (dx / d) * f, fy = (dy / d) * f, fz = (dz / d) * f;
      s.vx += fx; s.vy += fy; s.vz += fz;
      t.vx -= fx; t.vy -= fy; t.vz -= fz;
    }

    const drag = dragRef.current.node;
    const dragging = dragRef.current.active;
    for (let i = 0; i < len; i++) {
      const node = sim[i];
      if (dragging && node === drag) { node.vx = 0; node.vy = 0; node.vz = 0; continue; }
      // containment + perpetual brownian float
      node.vx += -node.x * CENTER_PULL + (Math.random() - 0.5) * JITTER;
      node.vy += -node.y * CENTER_PULL + (Math.random() - 0.5) * JITTER;
      node.vz += -node.z * CENTER_PULL + (Math.random() - 0.5) * JITTER;
      node.vx *= DAMPING; node.vy *= DAMPING; node.vz *= DAMPING;
      node.x += node.vx; node.y += node.vy; node.z += node.vz;
    }
  }

  function fitView() {
    const sim = simRef.current;
    const { w, h } = sizeRef.current;
    if (!sim.length || !w || !h) return;
    let maxR = 1;
    for (const node of sim) {
      const r = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z);
      if (r > maxR) maxR = r;
    }
    viewRef.current.k = clamp((Math.min(w, h) * 0.42) / maxR, MIN_K, 2);
  }

  function nodeAt(px: number, py: number): SimNode | null {
    const hiddenT = hiddenRef.current;
    let best: SimNode | null = null;
    let bestDz = Infinity;
    for (const node of simRef.current) {
      if (hiddenT.has(node.type)) continue;
      const dx = node.sx - px, dy = node.sy - py;
      const hit = node.r * node.sc + 5;
      if (dx * dx + dy * dy < hit * hit && node.dz < bestDz) { bestDz = node.dz; best = node; }
    }
    return best;
  }

  // ── Animation loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const w = wrap.clientWidth, h = wrap.clientHeight;
      const first = sizeRef.current.w === 0;
      sizeRef.current = { w, h };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      if (first) fitView();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const depthAlpha = (sc: number, k: number) => clamp(0.25 + (sc / k - 0.6) * 0.7, 0.18, 1);

    const draw = () => {
      const dpr = dprRef.current;
      const { w, h } = sizeRef.current;
      const k = viewRef.current.k;
      const hiddenT = hiddenRef.current;
      const adj = adjRef.current;
      const q = queryRef.current;
      const hover = hoverRef.current;
      const sim = simRef.current;

      // kamera statis (hanya berubah saat user drag)
      const yaw = rotRef.current.yaw;
      const pitch = rotRef.current.pitch;
      const cy = Math.cos(yaw), syaw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      for (const n of sim) {
        const x1 = n.x * cy - n.z * syaw;
        const z1 = n.x * syaw + n.z * cy;
        const y2 = n.y * cp - z1 * sp;
        const z2 = n.y * sp + z1 * cp;
        const persp = FOCAL / (FOCAL + z2);
        n.sx = w / 2 + x1 * persp * k;
        n.sy = h / 2 + y2 * persp * k;
        n.sc = persp * k;
        n.dz = z2;
      }

      let focus: Set<string> | null = null;
      if (hover) focus = new Set([hover.id, ...(adj.get(hover.id) ?? [])]);
      else if (q) focus = new Set(sim.filter(nd => nd.label.toLowerCase().includes(q)).map(nd => nd.id));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // edges
      for (const { s, t } of linksRef.current) {
        if (hiddenT.has(s.type) || hiddenT.has(t.type)) continue;
        const active = focus ? (focus.has(s.id) && focus.has(t.id)) : false;
        const da = Math.min(depthAlpha(s.sc, k), depthAlpha(t.sc, k));
        if (focus && !active) ctx.strokeStyle = `rgba(120,113,108,${0.05 * da})`;
        else if (active) ctx.strokeStyle = `rgba(249,115,22,${0.55 * da})`;
        else ctx.strokeStyle = `rgba(168,162,158,${0.14 * da})`;
        ctx.lineWidth = Math.max(0.4, 0.7 * ((s.sc + t.sc) / 2));
        ctx.beginPath();
        ctx.moveTo(s.sx, s.sy);
        ctx.lineTo(t.sx, t.sy);
        ctx.stroke();
      }

      // nodes — far first (painter's algorithm)
      const order = sim.filter(nd => !hiddenT.has(nd.type)).sort((a, b) => b.dz - a.dz);
      for (const node of order) {
        const inFocus = focus ? focus.has(node.id) : true;
        const da = depthAlpha(node.sc, k);
        const radius = Math.max(0.6, node.r * node.sc);
        ctx.globalAlpha = (focus && !inFocus) ? 0.12 * da : da;
        const style = TYPE_STYLE[node.type];
        if (node === hover) { ctx.shadowColor = style.color; ctx.shadowBlur = 22 * node.sc; }
        else ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = style.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = (focus && !inFocus) ? 0.12 : Math.min(1, da + 0.15);
        ctx.lineWidth = Math.max(0.5, 1.2 * node.sc);
        ctx.strokeStyle = 'rgba(12,10,9,0.9)';
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // labels — hanya saat hover (+ tetangga) / pencarian
      if (focus) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
        for (const node of order) {
          if (!focus.has(node.id)) continue;
          const label = node.label.length > 30 ? node.label.slice(0, 29) + '…' : node.label;
          const yy = node.sy + node.r * node.sc + 3;
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(12,10,9,0.9)';
          ctx.strokeText(label, node.sx, yy);
          ctx.fillStyle = '#e7e5e4';
          ctx.fillText(label, node.sx, yy);
        }
      }
    };

    const loop = () => {
      if (playingRef.current) {
        if (alphaRef.current > ALPHA_FLOOR) alphaRef.current *= ALPHA_DECAY;
        step(Math.max(alphaRef.current, ALPHA_FLOOR));
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  // ── Pointer ──
  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { active: true, node: nodeAt(px, py), lastX: px, lastY: py, dist: 0 };
    alphaRef.current = Math.max(alphaRef.current, ALPHA_REHEAT);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const drag = dragRef.current;
    if (tooltipRef.current) tooltipRef.current.style.transform = `translate(${px + 14}px, ${py + 14}px)`;

    if (drag.active) {
      // putar manual (orbit) — hanya saat di-drag
      const dx = px - drag.lastX, dy = py - drag.lastY;
      rotRef.current.yaw += dx * 0.005;
      rotRef.current.pitch = clamp(rotRef.current.pitch + dy * 0.005, -1.4, 1.4);
      drag.dist += Math.abs(dx) + Math.abs(dy);
      drag.lastX = px; drag.lastY = py;
      return;
    }

    const node = nodeAt(px, py);
    hoverRef.current = node;
    e.currentTarget.style.cursor = node ? (node.href ? 'pointer' : 'default') : 'grab';
    if (node) {
      setHoverLabel(prev =>
        prev && prev.label === node.label && prev.meta === node.meta
          ? prev
          : { label: node.label, type: node.type, meta: node.meta, clickable: !!node.href }
      );
    } else if (hoverLabel) setHoverLabel(null);
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    if (drag.node && drag.dist < 6 && drag.node.href) router.push(drag.node.href);
    dragRef.current = { active: false, node: null, lastX: 0, lastY: 0, dist: 0 };
  }

  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    viewRef.current.k = clamp(viewRef.current.k * Math.exp(-e.deltaY * 0.0014), MIN_K, MAX_K);
  }

  function zoomBy(factor: number) { viewRef.current.k = clamp(viewRef.current.k * factor, MIN_K, MAX_K); }

  function toggleType(t: GraphNodeType) {
    setHidden(prev => { const next = new Set(prev); if (next.has(t)) next.delete(t); else next.add(t); return next; });
  }

  const btn = 'w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-stone-300 text-lg font-bold transition-colors';

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-[#0c0a09] select-none">
      <canvas
        ref={canvasRef}
        className="block touch-none"
        style={{ cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      />

      {/* Search */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-[#1c1917]/90 backdrop-blur border border-white/10 rounded-xl px-3 h-10 shadow-lg">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#a8a29e" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari node…"
            className="bg-transparent outline-none text-sm text-stone-200 placeholder-stone-500 w-40" />
          {query && <button onClick={() => setQuery('')} className="text-stone-500 hover:text-stone-300 text-sm">✕</button>}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-[#1c1917]/90 backdrop-blur border border-white/10 rounded-xl p-1.5 shadow-lg">
        <button className={btn} onClick={() => zoomBy(1.25)} title="Perbesar">+</button>
        <button className={btn} onClick={() => zoomBy(0.8)} title="Perkecil">−</button>
        <button className={btn} onClick={() => fitView()} title="Fit ke layar">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" strokeLinecap="round" />
          </svg>
        </button>
        <button className={btn + (playing ? ' text-orange-400' : '')} onClick={() => setPlaying(v => !v)} title={playing ? 'Hentikan gerakan' : 'Mulai gerakan'}>
          {playing
            ? <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            : <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#1c1917]/90 backdrop-blur border border-white/10 rounded-xl p-3 shadow-lg">
        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Tipe — klik untuk filter</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => toggleType(t)}
              className={`flex items-center gap-2 text-xs transition-opacity ${hidden.has(t) ? 'opacity-35' : 'opacity-100'}`}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_STYLE[t].color }} />
              <span className="text-stone-300">{TYPE_STYLE[t].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <div ref={tooltipRef} className="absolute top-0 left-0 z-20 pointer-events-none" style={{ display: hoverLabel ? 'block' : 'none' }}>
        {hoverLabel && (
          <div className="bg-[#1c1917] border border-white/15 rounded-lg px-3 py-2 shadow-xl max-w-[240px]">
            <p className="text-sm font-bold text-stone-100 leading-tight">{hoverLabel.label}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ background: TYPE_STYLE[hoverLabel.type].color }} />
              <span className="text-[11px] text-stone-400">{TYPE_STYLE[hoverLabel.type].label}</span>
            </div>
            {hoverLabel.meta && <p className="text-[11px] text-stone-500 mt-0.5">{hoverLabel.meta}</p>}
            {hoverLabel.clickable && <p className="text-[10px] text-orange-400 mt-1">Klik untuk buka →</p>}
          </div>
        )}
      </div>
    </div>
  );
}
