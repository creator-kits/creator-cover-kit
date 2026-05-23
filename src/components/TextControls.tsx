import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { TemplatePreset, TextAlign, TextPosition, TextSettings } from '../types'

interface TextControlsProps {
  textSettings: TextSettings
  onTextSettingsChange: Dispatch<SetStateAction<TextSettings>>
  templates: TemplatePreset[]
  activeTemplateId: string
  onApplyTemplate: (template: TemplatePreset) => void
}

const positions: Array<{ label: string; value: TextPosition }> = [
  { label: '顶部', value: 'top' },
  { label: '居中', value: 'center' },
  { label: '底部', value: 'bottom' },
]

const alignments: Array<{ label: string; value: TextAlign }> = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
]

const hexColorPattern = /^#([0-9a-fA-F]{6})$/

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
          标题与模板
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          输入封面标题，并快速切换不同视觉结构的模板样式。
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          右侧预览区也支持直接拖拽标题位置。
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
          <label className="mb-2 block text-sm font-medium text-slate-700">标题文案</label>
          <textarea
            value={textSettings.title}
            onChange={(event) =>
              onTextSettingsChange((current) => ({ ...current, title: event.target.value }))
            }
            rows={4}
            placeholder="输入你的封面标题"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>字号</span>
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
            <label className="mb-2 block text-sm font-medium text-slate-700">文字颜色</label>
            <ColorInputControl
              key={textSettings.color}
              color={textSettings.color}
              onColorChange={(nextColor) =>
                onTextSettingsChange((current) => ({
                  ...current,
                  color: nextColor,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">文字位置</label>
            <div className="grid grid-cols-3 gap-2">
              {positions.map((position) => (
                <button
                  key={position.value}
                  type="button"
                  onClick={() =>
                    onTextSettingsChange((current) => ({
                      ...current,
                      position: position.value,
                      offsetX: 0,
                      offsetY: 0,
                    }))
                  }
                  className={`rounded-2xl px-3 py-3 text-sm font-medium transition ${
                    textSettings.position === position.value
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {position.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">文字对齐</label>
          <div className="grid grid-cols-3 gap-2">
            {alignments.map((align) => (
              <button
                key={align.value}
                type="button"
                onClick={() =>
                    onTextSettingsChange((current) => ({
                      ...current,
                      align: align.value,
                      offsetX: 0,
                    }))
                  }
                className={`rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  textSettings.align === align.value
                    ? 'bg-accent text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface ColorInputControlProps {
  color: string
  onColorChange: (nextColor: string) => void
}

function ColorInputControl({ color, onColorChange }: ColorInputControlProps) {
  const [colorInput, setColorInput] = useState(color.toUpperCase())

  const handleColorTextChange = (value: string) => {
    const normalized = value.startsWith('#') ? value : `#${value}`
    setColorInput(normalized.toUpperCase())

    if (!hexColorPattern.test(normalized)) {
      return
    }

    onColorChange(normalized.toUpperCase())
  }

  const handleColorBlur = () => {
    if (hexColorPattern.test(colorInput)) {
      setColorInput(colorInput.toUpperCase())
      return
    }

    setColorInput(color.toUpperCase())
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <input
        type="color"
        value={color}
        onChange={(event) => onColorChange(event.target.value.toUpperCase())}
        className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
      />
      <input
        type="text"
        value={colorInput}
        onChange={(event) => handleColorTextChange(event.target.value)}
        onBlur={handleColorBlur}
        placeholder="#FFFFFF"
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm uppercase text-ink outline-none transition focus:border-accent"
      />
    </div>
  )
}
