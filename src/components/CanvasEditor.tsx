import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useRef, useState } from 'react'
import type {
  ExportFormat,
  ImageTransform,
  OverlayStyle,
  PlatformPreset,
  TextSettings,
  UploadedImage,
} from '../types'
import { drawCoverToCanvas, getTitleLayout } from '../utils/canvasExport'
import { clamp } from '../utils/imageHelpers'

interface CanvasEditorProps {
  platform: PlatformPreset
  image: UploadedImage | null
  transform: ImageTransform
  textSettings: TextSettings
  overlayStyle: OverlayStyle
  showSafeArea: boolean
  isExporting: boolean
  hasImage: boolean
  exportMessage: string | null
  exportFormat: ExportFormat
  onExportFormatChange: Dispatch<SetStateAction<ExportFormat>>
  onExport: () => void | Promise<void>
  onTransformChange: Dispatch<SetStateAction<ImageTransform>>
  onTextSettingsChange: Dispatch<SetStateAction<TextSettings>>
  onResetTransform: () => void
}

export function CanvasEditor({
  platform,
  image,
  transform,
  textSettings,
  overlayStyle,
  showSafeArea,
  isExporting,
  hasImage,
  exportMessage,
  exportFormat,
  onExportFormatChange,
  onExport,
  onTransformChange,
  onTextSettingsChange,
  onResetTransform,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<{
    target: 'image' | 'text'
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const [displaySize, setDisplaySize] = useState({ width: 320, height: 320 })

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    canvas.width = platform.width
    canvas.height = platform.height

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    drawCoverToCanvas(context, {
      platform,
      image,
      transform,
      textSettings,
      overlayStyle,
      showSafeArea,
      includeSafeArea: true,
    })
  }, [platform, image, transform, textSettings, overlayStyle, showSafeArea])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      const availableWidth = Math.max(entry.contentRect.width - 8, 280)
      const scale = Math.min(availableWidth / platform.width, 720 / platform.height)
      setDisplaySize({
        width: Math.round(platform.width * scale),
        height: Math.round(platform.height * scale),
      })
    })

    observer.observe(container)

    return () => observer.disconnect()
  }, [platform])

  const handleScaleChange = (nextScale: number) => {
    onTransformChange((current) => {
      if (!image) {
        return current
      }

      const clampedScale = clamp(nextScale, 0.5, 3)
      const currentCenterX = (platform.width / 2 - current.x) / current.scale
      const currentCenterY = (platform.height / 2 - current.y) / current.scale

      return {
        scale: clampedScale,
        x: platform.width / 2 - currentCenterX * clampedScale,
        y: platform.height / 2 - currentCenterY * clampedScale,
      }
    })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    const ratio = platform.width / displaySize.width
    const rect = event.currentTarget.getBoundingClientRect()
    const canvasX = (event.clientX - rect.left) * ratio
    const canvasY = (event.clientY - rect.top) * ratio
    const titleLayout = context
      ? getTitleLayout(
          context,
          {
            platform,
            image,
            transform,
            textSettings,
            overlayStyle,
            showSafeArea,
            includeSafeArea: true,
          },
          platform.width,
          platform.height,
        )
      : null

    const hitText =
      titleLayout &&
      canvasX >= titleLayout.box.left &&
      canvasX <= titleLayout.box.right &&
      canvasY >= titleLayout.box.top &&
      canvasY <= titleLayout.box.bottom

    if (!hitText && !image) {
      return
    }

    dragStateRef.current = {
      target: hitText ? 'text' : 'image',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: hitText ? textSettings.offsetX : transform.x,
      originY: hitText ? textSettings.offsetY : transform.y,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const dragState = dragStateRef.current

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    const ratio = platform.width / displaySize.width
    const deltaX = (event.clientX - dragState.startX) * ratio
    const deltaY = (event.clientY - dragState.startY) * ratio

    if (dragState.target === 'text') {
      onTextSettingsChange((current) => ({
        ...current,
        offsetX: dragState.originX + deltaX,
        offsetY: dragState.originY + deltaY,
      }))
      return
    }

    onTransformChange((current) => ({
      ...current,
      x: dragState.originX + deltaX,
      y: dragState.originY + deltaY,
    }))
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <section className="rounded-[32px] border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-ink">
              实时预览
            </h2>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {platform.name}
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            拖动图片调整位置，使用缩放滑块放大或缩小，点击重置可恢复默认裁剪。
          </p>
          {exportMessage && (
            <div className="mt-3 inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              PNG 导出成功。
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
            {platform.width} × {platform.height} · {platform.aspectRatioLabel}
          </div>
          <select
            value={exportFormat}
            onChange={(event) => onExportFormatChange(event.target.value as ExportFormat)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-accent"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
          <button
            type="button"
            onClick={onResetTransform}
            disabled={!image}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            重置
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={!hasImage || isExporting}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? '导出中…' : `导出 ${exportFormat.toUpperCase()}`}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div
          ref={containerRef}
          className="flex min-h-[420px] items-center justify-center rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(255,122,89,0.18),_transparent_22%),linear-gradient(180deg,_#edf3fb_0%,_#e0ebf7_100%)] p-4"
        >
          <canvas
            ref={canvasRef}
            style={{ width: displaySize.width, height: displaySize.height, touchAction: 'none' }}
            className="rounded-[26px] shadow-[0_28px_60px_rgba(23,32,51,0.18)]"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>

        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
          <div>
            <div className="text-sm font-medium text-slate-700">缩放</div>
            <div className="mt-1 text-sm text-slate-500">建议范围：0.5x 到 3x</div>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.01}
              value={transform.scale}
              onChange={(event) => handleScaleChange(Number(event.target.value))}
              disabled={!image}
              className="mt-4 w-full"
            />
            <div className="mt-2 text-right text-sm font-semibold text-slate-700">
              {transform.scale.toFixed(2)}x
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-4">
            <div className="text-sm font-medium text-slate-700">编辑说明</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>图片使用浏览器 Canvas 本地 cover 适配逻辑。</li>
              <li>切换平台会保留原图，但会重新按目标比例适配裁剪。</li>
              <li>安全区只用于预览提醒，不会出现在导出的 PNG 中。</li>
              <li>当前导出为免费测试版，所有可见功能都可直接使用。</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
