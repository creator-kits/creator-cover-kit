import type { PlatformPreset } from '../types'

interface PlatformSelectorProps {
  platforms: PlatformPreset[]
  selectedPlatformId: string
  onSelectPlatform: (platformId: string) => void
  showSafeArea: boolean
  onToggleSafeArea: (value: boolean) => void
}

export function PlatformSelector({
  platforms,
  selectedPlatformId,
  onSelectPlatform,
  showSafeArea,
  onToggleSafeArea,
}: PlatformSelectorProps) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.04em] text-ink">
            Platform presets
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Pick a target format. The canvas will re-fit your image in cover mode.
          </p>
        </div>
        <label className="flex items-center gap-3 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={showSafeArea}
            onChange={(event) => onToggleSafeArea(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Show safe area
        </label>
      </div>

      <div className="mt-4 grid gap-3">
        {platforms.map((platform) => {
          const isActive = platform.id === selectedPlatformId

          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => onSelectPlatform(platform.id)}
              className={`rounded-[22px] border p-4 text-left transition ${
                isActive
                  ? 'border-transparent bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                  : 'border-slate-200 bg-white hover:border-accent/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-base font-semibold">{platform.name}</div>
                  <div
                    className={`mt-1 text-sm ${
                      isActive ? 'text-white/80' : 'text-slate-500'
                    }`}
                  >
                    {platform.width} × {platform.height}
                  </div>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {platform.aspectRatioLabel}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
