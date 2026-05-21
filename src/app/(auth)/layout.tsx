export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0c0a09] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[420px] flex-col justify-between p-12 border-r border-white/[0.06] relative overflow-hidden">
        {/* Orange glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-base">O</div>
            <span className="text-white font-black text-lg">OnboardKit</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-4">
            Onboarding yang<br /><span className="text-orange-400">lebih cerdas.</span>
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed">
            Generate checklist onboarding berbasis dokumen kerja, spesifik per posisi dan per orang.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: '📄', label: 'Upload handover doc → checklist otomatis' },
            { icon: '🔄', label: 'LLM Wiki — update inkremental tiap dokumen baru' },
            { icon: '✦', label: 'Per posisi, per orang yang digantikan' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-sm flex-shrink-0">
                {f.icon}
              </div>
              <p className="text-stone-400 text-xs">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
