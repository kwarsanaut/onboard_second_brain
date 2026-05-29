'use client';
import { useState, useRef, useEffect } from 'react';
import type { UserOnboarding } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  user: UserOnboarding;
}

// ── Ubah ukuran Peri di sini ──────────────────────────────
const PERI_SIZE = 240;  // ukuran Peri (px) — ganti angka ini
// ──────────────────────────────────────────────────────────

function PeriVideo({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <video
      src="/peri.mp4"
      autoPlay loop muted playsInline
      className={className}
      style={{ objectFit: 'contain', mixBlendMode: 'multiply', ...style }}
    />
  );
}

export default function ChatWidget({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: `Halo ${user.name}! ✨ Saya Peri, asisten onboarding kamu. Tanya apa saja soal jobdeskmu sebagai **${user.positionName}** — saya siap bantu!`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [periState, setPeriState] = useState<'idle' | 'thinking' | 'happy'>('idle');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function sendText(text: string) {
    if (!text.trim() || loading) return;
    await sendMessage(text.trim());
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    await sendMessage(text);
  }

  async function sendMessage(text: string) {
    const newMessages: Message[] = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setLoading(true);
    setPeriState('thinking');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          context: {
            userName: user.name,
            positionName: user.positionName,
            departmentName: user.departmentName,
            replacingPerson: user.replacingPerson,
            items: user.items.map(i => ({ title: i.title, description: i.description, category: i.category, completed: i.completed })),
          },
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'Maaf, terjadi kesalahan.' }]);
      setPeriState('happy');
      setTimeout(() => setPeriState('idle'), 3000);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Koneksi bermasalah. Coba lagi ya!' }]);
      setPeriState('idle');
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const SUGGESTIONS = [
    'Apa tugas utamaku?',
    `Pelajari dari ${user.replacingPerson ?? 'pendahulu saya'}?`,
    'Mulai dari mana?',
    'Item paling penting?',
  ];

  // Panel chat: posisi fixed, di atas Peri
  const panelBottom = PERI_SIZE + 8;

  return (
    <>
      {/* ── Peri floating — benar-benar independent, tidak ada parent constraint ── */}
      <div
        className="fixed z-50 cursor-pointer group"
        style={{ bottom: 8, right: 16, width: PERI_SIZE, height: PERI_SIZE }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Speech bubble on hover */}
        {!open && (
          <div className="absolute -top-10 right-full mr-2 bg-white border border-stone-200 rounded-xl rounded-br-none px-3 py-1.5 shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            <p className="text-xs font-semibold text-stone-700">Ada yang bisa dibantu? ✨</p>
          </div>
        )}

        {/* Colored glow behind untuk mix-blend-mode multiply */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-200 to-pink-200 blur-2xl opacity-80"
          style={{ transform: 'scale(0.7)' }}
        />

        <PeriVideo
          className="relative group-hover:scale-110 transition-transform duration-200 drop-shadow-2xl"
          style={{ width: PERI_SIZE, height: PERI_SIZE }}
        />

        {/* Notif dot */}
        {!open && messages.length === 1 && (
          <span className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <span className="text-[9px] text-white font-black">!</span>
          </span>
        )}
      </div>

      {/* ── Chat panel — fixed, terpisah dari Peri ── */}
      <div
        className="fixed z-40 transition-all duration-300 origin-bottom-right"
        style={{
          bottom: panelBottom,
          right: 16,
          width: 340,
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1)' : 'scale(0.92)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/15 border border-stone-200 flex flex-col overflow-hidden" style={{ height: 440 }}>

          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-orange-400 to-pink-500 flex-shrink-0 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-bold">Peri ✨</p>
              <p className="text-white/70 text-[11px]">
                {periState === 'thinking' ? 'Sedang berpikir...' : `Asisten ${user.positionName}`}
              </p>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50/40">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center flex-shrink-0 mb-0.5 text-sm">✨</div>
                )}
                <div className={`max-w-[220px] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white rounded-br-sm'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center flex-shrink-0 mb-0.5 text-sm">✨</div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !loading && (
            <div className="px-3 py-2 bg-white border-t border-stone-100 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map(q => (
                <button key={q} onClick={() => sendText(q)}
                  className="text-[11px] bg-orange-50 border border-orange-200 text-orange-600 rounded-lg px-2.5 py-1 hover:bg-orange-100 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-stone-100 bg-white flex items-end gap-2 flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tanya Peri..."
              rows={1}
              className="flex-1 text-xs text-stone-800 placeholder-stone-400 outline-none resize-none bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              style={{ minHeight: '36px', maxHeight: '80px' }}
            />
            <button onClick={send} disabled={!input.trim() || loading}
              className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-orange-500 to-pink-500 hover:opacity-90 disabled:from-stone-200 disabled:to-stone-200 text-white rounded-xl flex items-center justify-center transition-all">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
