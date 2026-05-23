import type { ChangeEvent } from 'react'
import type { UploadedImage } from '../types'

interface ImageUploaderProps {
  image: UploadedImage | null
  onFileSelect: (file: File) => void | Promise<void>
}

export function ImageUploader({ image, onFileSelect }: ImageUploaderProps) {
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    await onFileSelect(file)
    event.target.value = ''
  }

  return (
    <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.04em] text-ink">
            Source image
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            JPG, PNG, or WebP. Everything stays in your browser.
          </p>
        </div>
        {image && (
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {image.width} × {image.height}
          </div>
        )}
      </div>

      <label className="mt-4 block cursor-pointer">
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-[linear-gradient(180deg,_rgba(246,249,253,1),_rgba(255,255,255,1))] p-5 transition hover:border-accent/50 hover:shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-xl text-white">
              +
            </div>
            <div className="flex-1">
              <div className="font-display text-lg font-semibold text-ink">
                {image ? 'Replace image' : 'Upload an image'}
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-600">
                {image
                  ? `Current file: ${image.name}`
                  : 'Upload one image and create covers for multiple platforms.'}
              </div>
            </div>
          </div>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleChange}
        />
      </label>
    </section>
  )
}
