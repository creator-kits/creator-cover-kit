import { useEffect, useMemo, useState } from 'react'
import { CanvasEditor } from './components/CanvasEditor'
import { ExportPanel } from './components/ExportPanel'
import { ImageUploader } from './components/ImageUploader'
import { PlatformSelector } from './components/PlatformSelector'
import { TextControls } from './components/TextControls'
import { platformPresets, templatePresets } from './data/platformPresets'
import type {
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
  color: '#ffffff',
  position: 'center',
  align: 'center',
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
  }

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatformId(platformId)

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
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      await exportCoverAsPng({
        platform: selectedPlatform,
        image,
        transform,
        textSettings,
        overlayStyle,
        showSafeArea: false,
        includeSafeArea: false,
        includeWatermark: true,
        watermarkText: 'Created with Creator Cover Kit',
      })
    } finally {
      setIsExporting(false)
    }
  }

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
        <header className="rounded-[28px] border border-white/80 bg-white/80 px-6 py-6 shadow-panel backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-display text-sm font-medium uppercase tracking-[0.24em] text-teal/70">
                Creator Cover Kit
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl lg:text-5xl">
                One upload. Covers for every platform.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                上传一次，生成所有平台封面。所有图片处理都在浏览器本地完成，不上传服务器。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/80 p-3 text-sm text-slate-600 sm:grid-cols-4">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="font-display text-lg font-semibold text-ink">8</div>
                <div>Platform presets</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="font-display text-lg font-semibold text-ink">3</div>
                <div>Starter templates</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="font-display text-lg font-semibold text-ink">100%</div>
                <div>Browser local</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="font-display text-lg font-semibold text-ink">PNG</div>
                <div>Export ready</div>
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

          <section className="space-y-6">
            <CanvasEditor
              platform={selectedPlatform}
              image={image}
              transform={transform}
              textSettings={textSettings}
              overlayStyle={overlayStyle}
              showSafeArea={showSafeArea}
              onTransformChange={setTransform}
              onResetTransform={handleResetTransform}
            />

            <ExportPanel
              platform={selectedPlatform}
              isExporting={isExporting}
              hasImage={Boolean(image)}
              onExport={handleExport}
            />
          </section>
        </main>

        <footer className="mt-6 rounded-[28px] border border-white/80 bg-white/80 px-6 py-6 shadow-panel backdrop-blur md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-ink">
                Pro template packs coming soon
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                先把最核心的一键适配流程跑通，后续可以继续扩展行业模板、批量导出和品牌套件。
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
              Static frontend only. Ready for Vercel or Cloudflare Pages.
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {['Knowledge Creator Pack', 'Fitness Creator Pack', 'Course Creator Pack'].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(251,250,246,1),_rgba(255,255,255,1))] p-5 shadow-sm"
              >
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-teal/60">Pro</div>
                <div className="mt-2 font-display text-xl font-semibold text-ink">{item}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Curated layout rules and styling presets for creator-specific cover workflows.
                </p>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
