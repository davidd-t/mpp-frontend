import { go } from '../model'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pt-20 pb-32 sm:pt-28 relative">
      <div className="mx-auto max-w-3xl text-center">
        {/* Floating logo with glow ring */}
        <div className="mb-8 flex justify-center">
          <div className="relative animate-[float_6s_ease-in-out_infinite]">
            <div className="absolute -inset-4 rounded-full bg-cyan-500/10 blur-xl animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950/80 border border-slate-800 ring-1 ring-cyan-500/30 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
              <svg className="h-9 w-9 text-cyan-400 transition-transform duration-700 hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25l7.5 4.33v8.66L12 19.57l-7.5-4.33V6.58L12 2.25z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl font-mono">
          <span className="bg-gradient-to-b from-white via-white/90 to-slate-400 bg-clip-text text-transparent">Your Hub for</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]">Intelligent Code</span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mt-6 max-w-lg text-sm sm:text-base leading-relaxed text-slate-400 font-sans">
          Transform your codebase into a semantic knowledge matrix. Query, map, and telemetry-inspect index repositories in real-time.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 font-mono">
          <button onClick={() => go('/register')} className="btn-primary px-8 py-3.5 text-xs tracking-wider uppercase rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
            Get Started
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          <button onClick={() => go('/dashboard')} className="btn-ghost px-8 py-3.5 text-xs tracking-wider uppercase rounded-xl border-slate-800 bg-slate-950/60 hover:bg-slate-900/60 transition-all">
            View Dashboard
          </button>
        </div>

        {/* Social proof / stats strip */}
        <div className="mt-20 flex items-center justify-center gap-8 sm:gap-16">
          {[
            { value: '10K+', label: 'REPOS INDEXED', color: 'text-cyan-400' },
            { value: '50ms', label: 'LATENCY', color: 'text-purple-400' },
            { value: '99.99%', label: 'ACCURACY', color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="text-center font-mono">
              <p className={`text-xl font-bold sm:text-2xl ${stat.color} drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]`}>{stat.value}</p>
              <p className="mt-1 text-[9px] font-semibold tracking-widest text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
