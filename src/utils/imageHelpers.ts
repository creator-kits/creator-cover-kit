import type { ImageTransform, UploadedImage } from '../types'

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function computeCoverTransform(
  imageWidth: number,
  imageHeight: number,
  targetWidth: number,
  targetHeight: number,
): ImageTransform {
  const scale = Math.max(targetWidth / imageWidth, targetHeight / imageHeight)

  return {
    scale,
    x: (targetWidth - imageWidth * scale) / 2,
    y: (targetHeight - imageHeight * scale) / 2,
  }
}

export async function loadImageFromFile(file: File): Promise<UploadedImage> {
  const objectUrl = URL.createObjectURL(file)

  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve({
        element: image,
        src: objectUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,
        name: file.name.replace(/\.[^.]+$/, ''),
        type: file.type,
      })
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to load the selected image file.'))
    }

    image.src = objectUrl
  })
}

export function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
