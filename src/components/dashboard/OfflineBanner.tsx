export default function OfflineBanner({ online, syncStatus }: { online: boolean; syncStatus: string | null }) {
  if (online && !syncStatus) return null

  return (
    <div className="mb-5 space-y-2">
      {!online && (
        <div className="flex items-center gap-3 glass-card rounded-xl border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300 animate-[slide-up-fade_0.3s_ease-out]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </span>
          <div>
            <span className="font-semibold">You are offline.</span>{' '}
            <span className="text-amber-400/70">Changes are saved locally and will sync when the connection is restored.</span>
          </div>
        </div>
      )}
      {syncStatus && (
        <div className="flex items-center gap-3 glass-card rounded-xl border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-300 animate-[slide-up-fade_0.3s_ease-out]">
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {syncStatus}
        </div>
      )}
    </div>
  )
}
