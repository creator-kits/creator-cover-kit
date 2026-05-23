import type { PlatformPreset } from '../types'

interface ExportPanelProps {
  platform: PlatformPreset
  isExporting: boolean
  hasImage: boolean
  onExport: () => void | Promise<void>
}

export function ExportPanel({
  platform,
  isExporting,
  hasImage,
  onExport,
}: ExportPanelProps) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-ink">
            Export
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Export the current composition as a PNG. The generated file includes your image, title,
            template styling, and the free watermark.
          </p>
        </div>
        <button
          type="button"
          onClick={onExport}
          disabled={!hasImage || isExporting}
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? 'Exporting…' : `Export PNG · ${platform.width}×${platform.height}`}
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg font-semibold text-ink">Watermark</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Free exports include “Created with Creator Cover Kit”.
              </p>
            </div>
            <label className="flex items-center gap-3 rounded-full bg-white px-3 py-2 text-sm text-slate-500">
              <input type="checkbox" disabled className="h-4 w-4 rounded border-slate-300" />
              Remove watermark is a Pro feature.
            </label>
          </div>
        </div>

        <div className="rounded-[24px] border border-dashed border-slate-300 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(246,249,253,1))] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-display text-lg font-semibold text-ink">
                Batch export selected platforms
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Coming soon. Export one image into multiple platform covers.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-400"
            >
              Coming soon
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
