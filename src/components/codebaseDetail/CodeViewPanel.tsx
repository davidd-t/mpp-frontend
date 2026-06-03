import { sampleCode } from '../../model'

export default function CodeViewPanel() {
  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900 p-3">
      <p className="mb-2 text-sm font-semibold text-zinc-300">Code view</p>
      <pre className="overflow-auto rounded bg-[#0c111d] p-3 text-xs text-zinc-300">{sampleCode}</pre>
    </section>
  )
}
