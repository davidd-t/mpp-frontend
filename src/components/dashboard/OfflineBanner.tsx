export default function OfflineBanner({ online, syncStatus }: { online: boolean; syncStatus: string | null }) {
  if (online && !syncStatus) return null

  return (
    <div className="mb-4 space-y-2">
      {!online && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 animate-[slide-up-fade_0.3s_ease-out]">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </span>
          <div>
            <span className="font-semibold">You are offline.</span>{' '}
            Changes are saved locally and will sync when the connection is restored.
          </div>
        </div>
      )}
      {syncStatus && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 animate-[slide-up-fade_0.3s_ease-out]">
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {syncStatus}
        </div>
      )}
    </div>
  )
}
