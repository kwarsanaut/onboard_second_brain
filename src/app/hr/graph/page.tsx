'use client';
import { useEffect, useState } from 'react';
import KnowledgeGraph, { type GraphNode, type GraphEdge } from '@/components/KnowledgeGraph';

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    departments: number;
    positions: number;
    checklists: number;
    employees: number;
    nodes: number;
    edges: number;
  };
}

export default function GraphPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/graph')
      .then(r => r.json())
      .then((d: GraphData & { error?: string }) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Gagal memuat graph'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-stone-200 bg-white flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Knowledge Graph</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Peta relasi seluruh pengetahuan onboarding — departemen, posisi, wiki, item & karyawan.
          </p>
        </div>
        {data && (
          <div className="hidden md:flex items-center gap-5 text-right">
            <Stat value={data.stats.nodes} label="node" />
            <Stat value={data.stats.edges} label="relasi" />
            <Stat value={data.stats.checklists} label="wiki" />
            <Stat value={data.stats.employees} label="karyawan" />
          </div>
        )}
      </header>

      {/* Graph area */}
      <div className="flex-1 relative bg-[#0c0a09]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400">
            <svg className="animate-spin w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">Menyusun graph…</p>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#1c1917] border border-red-500/30 rounded-xl px-5 py-4 text-center">
              <p className="text-red-400 text-sm font-semibold">Gagal memuat graph</p>
              <p className="text-stone-500 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && data && data.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-stone-300 text-sm font-semibold">Belum ada data untuk divisualisasikan</p>
              <p className="text-stone-500 text-xs mt-1">Tambah departemen, posisi, atau generate wiki dulu.</p>
            </div>
          </div>
        )}

        {!loading && !error && data && data.nodes.length > 0 && (
          <KnowledgeGraph nodes={data.nodes} edges={data.edges} />
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-xl font-black text-stone-900 leading-none">{value}</p>
      <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
