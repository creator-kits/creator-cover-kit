import type { Dispatch, SetStateAction } from 'react'
import type { TemplatePreset, TextAlign, TextPosition, TextSettings } from '../types'

interface TextControlsProps {
  textSettings: TextSettings
  onTextSettingsChange: Dispatch<SetStateAction<TextSettings>>
  templates: TemplatePreset[]
  activeTemplateId: string
  onApplyTemplate: (template: TemplatePreset) => void
}

const positions: TextPosition[] = ['top', 'center', 'bottom']
const alignments: TextAlign[] = ['left', 'center', 'right']

export function TextControls({
  textSettings,
  onTextSettingsChange,
  templates,
  activeTemplateId,
  onApplyTemplate,
}: TextControlsProps) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-[-0.04em] text-ink">
          Title and templates
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Add one title layer and quickly switch between built-in cover styles.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {templates.map((template) => {
          const isActive = template.id === activeTemplateId

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyTemplate(template)}
              className={`rounded-[22px] border p-4 text-left transition ${
                isActive
                  ? 'border-teal/30 bg-teal/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-display text-base font-semibold text-ink">{template.name}</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{template.description}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Title text</label>
          <textarea
            value={textSettings.title}
            onChange={(event) =>
              onTextSettingsChange((current) => ({ ...current, title: event.target.value }))
            }
            rows={4}
            placeholder="Type your cover title here"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Font size</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {textSettings.fontSize}px
            </span>
          </label>
          <input
            type="range"
            min={28}
            max={140}
            step={1}
            value={textSettings.fontSize}
            onChange={(event) =>
              onTextSettingsChange((current) => ({
                ...current,
                fontSize: Number(event.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Text color</label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <input
                type="color"
                value={textSettings.color}
                onChange={(event) =>
                  onTextSettingsChange((current) => ({
                    ...current,
                    color: event.target.value,
                  }))
                }
                className="h-10 w-12 rounded-lg border-0 bg-transparent p-0"
              />
              <div className="text-sm text-slate-600">{textSettings.color.toUpperCase()}</div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Text position</label>
            <div className="grid grid-cols-3 gap-2">
              {positions.map((position) => (
                <button
                  key={position}
                  type="button"
                  onClick={() =>
                    onTextSettingsChange((current) => ({
                      ...current,
                      position,
                    }))
                  }
                  className={`rounded-2xl px-3 py-3 text-sm font-medium capitalize transition ${
                    textSettings.position === position
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Text align</label>
          <div className="grid grid-cols-3 gap-2">
            {alignments.map((align) => (
              <button
                key={align}
                type="button"
                onClick={() =>
                  onTextSettingsChange((current) => ({
                    ...current,
                    align,
                  }))
                }
                className={`rounded-2xl px-3 py-3 text-sm font-medium capitalize transition ${
                  textSettings.align === align
                    ? 'bg-accent text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
