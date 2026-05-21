'use client';
import { useEffect, useState } from 'react';
import type { ModelId, ModelOption } from '@/types';

const ALL_MODELS: ModelOption[] = [
  { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B (Groq)', provider: 'groq', description: 'Terbaik — dokumen kompleks', speed: 'medium' },
  { id: 'llama-3.1-8b-instant',    name: 'LLaMA 3.1 8B Instant (Groq)', provider: 'groq', description: 'Tercepat', speed: 'fast' },
  { id: 'mixtral-8x7b-32768',      name: 'Mixtral 8x7B (Groq)', provider: 'groq', description: 'Konteks panjang 32K', speed: 'medium' },
  { id: 'qwen-qwq-32b',            name: 'Qwen QwQ 32B (Groq)', provider: 'qwen', description: 'Reasoning kuat via Groq', speed: 'slow' },
  { id: 'qwen-plus',               name: 'Qwen Plus (Qwen API)', provider: 'qwen', description: 'Seimbang kecepatan & kualitas', speed: 'medium' },
  { id: 'qwen-turbo',              name: 'Qwen Turbo (Qwen API)', provider: 'qwen', description: 'Paling cepat dari Qwen', speed: 'fast' },
  { id: 'qwen-max',                name: 'Qwen Max (Qwen API)', provider: 'qwen', description: 'Terbaik Qwen', speed: 'slow' },
];

interface Props {
  value: ModelId;
  onChange: (id: ModelId) => void;
}

export default function ModelSelector({ value, onChange }: Props) {
  const [activeProvider, setActiveProvider] = useState<string>('groq');

  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then(d => { if (d.provider) setActiveProvider(d.provider); })
      .catch(() => {});
  }, []);

  const selected = ALL_MODELS.find(m => m.id === value) ?? ALL_MODELS[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeProvider === 'groq' ? 'bg-violet-500' : 'bg-blue-500'}`} />
        <span className="text-xs text-slate-500">{activeProvider === 'groq' ? 'Groq API aktif' : 'Qwen API aktif'}</span>
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value as ModelId)}
        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white cursor-pointer"
      >
        <optgroup label="— Groq Models —">
          {ALL_MODELS.filter(m => m.provider === 'groq').map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </optgroup>
        <optgroup label="— Qwen API Direct —">
          {ALL_MODELS.filter(m => m.provider === 'qwen' && m.id !== 'qwen-qwq-32b').map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </optgroup>
      </select>
      <p className="text-xs text-slate-400">{selected.description}</p>
    </div>
  );
}
