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
            上传图片
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            支持 JPG、PNG、WebP。所有图片只在本地浏览器中处理。
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
                {image ? '重新选择图片' : '上传一张图片'}
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-600">
                {image
                  ? `当前文件：${image.name}`
                  : '上传一次，快速生成多个平台的封面图。'}
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
