import { useEffect, useMemo, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { CanvasEditor } from './components/CanvasEditor'
import { ImageUploader } from './components/ImageUploader'
import { PlatformSelector } from './components/PlatformSelector'
import { TextControls } from './components/TextControls'
import { platformPresets, templatePresets } from './data/platformPresets'
import type {
  ExportFormat,
  ImageTransform,
  OverlayStyle,
  TemplatePreset,
  TextSettings,
  UploadedImage,
} from './types'
import { exportCoverAsPng } from './utils/canvasExport'
import { computeCoverTransform, loadImageFromFile } from './utils/imageHelpers'

const defaultTextSettings: TextSettings = {
  title: '',
  fontSize: 72,
  color: '#FFFFFF',
  position: 'center',
  align: 'center',
  offsetX: 0,
  offsetY: 0,
}

function applyTemplateSettings(template: TemplatePreset, currentTitle: string) {
  return {
    textSettings: {
      ...defaultTextSettings,
      ...template.textSettings,
      title: currentTitle,
    } satisfies TextSettings,
    overlayStyle: template.overlayStyle,
  }
}

function App() {
  const [image, setImage] = useState<UploadedImage | null>(null)
  const [selectedPlatformId, setSelectedPlatformId] = useState(platformPresets[0].id)
  const [showSafeArea, setShowSafeArea] = useState(true)
  const [transform, setTransform] = useState<ImageTransform>({ scale: 1, x: 0, y: 0 })
  const [activeTemplateId, setActiveTemplateId] = useState(templatePresets[0].id)
  const [textSettings, setTextSettings] = useState<TextSettings>({
    ...defaultTextSettings,
    ...templatePresets[0].textSettings,
  })
  const [overlayStyle, setOverlayStyle] = useState<OverlayStyle>(templatePresets[0].overlayStyle)
  const [isExporting, setIsExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const selectedPlatform = useMemo(
    () => platformPresets.find((preset) => preset.id === selectedPlatformId) ?? platformPresets[0],
    [selectedPlatformId],
  )

  const handleFileSelect = async (file: File) => {
    const loadedImage = await loadImageFromFile(file)
    const firstPlatform = platformPresets[0]
    setImage((previousImage) => {
      if (previousImage?.src.startsWith('blob:')) {
        URL.revokeObjectURL(previousImage.src)
      }
      return loadedImage
    })
    setSelectedPlatformId(firstPlatform.id)
    setTransform(
      computeCoverTransform(
        loadedImage.width,
        loadedImage.height,
        firstPlatform.width,
        firstPlatform.height,
      ),
    )
    setExportMessage(null)
  }

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatformId(platformId)
    setExportMessage(null)

    if (!image) {
      return
    }

    const nextPlatform =
      platformPresets.find((preset) => preset.id === platformId) ?? platformPresets[0]

    setTransform(
      computeCoverTransform(image.width, image.height, nextPlatform.width, nextPlatform.height),
    )
  }

  const handleResetTransform = () => {
    if (!image) {
      return
    }

    setTransform(
      computeCoverTransform(image.width, image.height, selectedPlatform.width, selectedPlatform.height),
    )
  }

  const handleTemplateApply = (template: TemplatePreset) => {
    const next = applyTemplateSettings(template, textSettings.title)
    setTextSettings(next.textSettings)
    setOverlayStyle(next.overlayStyle)
    setActiveTemplateId(template.id)
    setExportMessage(null)
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportMessage(null)

    try {
      await exportCoverAsPng({
        platform: selectedPlatform,
        image,
        transform,
        textSettings,
        overlayStyle,
        showSafeArea: false,
        includeSafeArea: false,
        format: exportFormat,
      })

      setExportMessage(`${exportFormat.toUpperCase()} 导出成功。`)
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (!exportMessage) {
      return
    }

    const timer = window.setTimeout(() => {
      setExportMessage(null)
    }, 2800)

    return () => window.clearTimeout(timer)
  }, [exportMessage])

  useEffect(() => {
    return () => {
      if (image?.src.startsWith('blob:')) {
        URL.revokeObjectURL(image.src)
      }
    }
  }, [image])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,122,89,0.18),_transparent_24%),linear-gradient(180deg,_#fbfcfe_0%,_#f3f7fb_48%,_#eef4fb_100%)] text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        {exportMessage && (
          <div className="pointer-events-none fixed right-4 top-4 z-50 rounded-2xl border border-emerald-200 bg-white/95 px-5 py-4 text-sm text-emerald-700 shadow-xl backdrop-blur">
            <div className="font-semibold">PNG 导出成功。</div>
          </div>
        )}

        <header className="rounded-[28px] border border-white/80 bg-white/80 px-6 py-6 shadow-panel backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-display text-sm font-medium uppercase tracking-[0.24em] text-teal/70">
                Creator Cover Kit
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl lg:text-5xl">
                多平台封面一键适配工具
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
                上传一次，生成小红书、抖音、TikTok、YouTube、Instagram 和 Pinterest 封面。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/80 p-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="font-display text-lg font-semibold text-ink">8</div>
                <div>平台预设</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="font-display text-lg font-semibold text-ink">6</div>
                <div>内置模板</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="font-display text-lg font-semibold text-ink">PNG</div>
                <div>支持 PNG / JPG</div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-6 grid flex-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <ImageUploader image={image} onFileSelect={handleFileSelect} />
            <PlatformSelector
              platforms={platformPresets}
              selectedPlatformId={selectedPlatformId}
              onSelectPlatform={handlePlatformSelect}
              showSafeArea={showSafeArea}
              onToggleSafeArea={setShowSafeArea}
            />
            <TextControls
              textSettings={textSettings}
              onTextSettingsChange={setTextSettings}
              templates={templatePresets}
              activeTemplateId={activeTemplateId}
              onApplyTemplate={handleTemplateApply}
            />
          </aside>

          <section className="xl:sticky xl:top-6 xl:self-start">
            <CanvasEditor
              platform={selectedPlatform}
              image={image}
              transform={transform}
              textSettings={textSettings}
              overlayStyle={overlayStyle}
              showSafeArea={showSafeArea}
              isExporting={isExporting}
              hasImage={Boolean(image)}
              exportMessage={exportMessage}
              exportFormat={exportFormat}
              onExportFormatChange={setExportFormat}
              onExport={handleExport}
              onTransformChange={setTransform}
              onTextSettingsChange={setTextSettings}
              onResetTransform={handleResetTransform}
            />
          </section>
        </main>

        <footer className="mt-6 rounded-[28px] border border-white/80 bg-white/80 px-6 py-6 shadow-panel backdrop-blur md:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-ink">
            后续会加入：
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {['批量导出', '更多创作者模板', '品牌套件预设'].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(251,250,246,1),_rgba(255,255,255,1))] p-5 shadow-sm"
              >
                <div className="font-display text-lg font-semibold text-ink">{item}</div>
              </div>
            ))}
          </div>
        </footer>
        <Analytics />
      </div>
    </div>
  )
}

export default App
