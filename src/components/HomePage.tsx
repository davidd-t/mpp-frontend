import { go } from '../model'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex justify-center">
          <img src="/logo.svg" alt="SourceStream logo" className="h-12 w-12 transition-transform duration-700 hover:rotate-180" />
        </div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">SourceStream</p>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">Your Hub for Code</h1>
        <p className="mx-auto mt-6 max-w-2xl text-zinc-300">
          Transform your codebase into an intelligent knowledge base. Ask questions and get contextual answers from indexed repositories.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button onClick={() => go('/register')} className="rounded bg-cyan-500 px-6 py-3 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] active:scale-95">
            Get Started
          </button>
          <button onClick={() => go('/dashboard')} className="rounded bg-zinc-800 px-6 py-3 font-semibold text-zinc-100 transition-all duration-300 hover:scale-105 hover:bg-zinc-700 active:scale-95">
            View Dashboard
          </button>
        </div>
      </div>
    </main>
  )
}
