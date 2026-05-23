import type { OverlayStyle, RenderOptions, TextAlign, TextPosition } from '../types'
import { sanitizeFileName } from './imageHelpers'

const FONT_STACK = '"Space Grotesk", "Plus Jakarta Sans", "Avenir Next", sans-serif'

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlayStyle: OverlayStyle,
) {
  if (overlayStyle.kind === 'none' || overlayStyle.opacity <= 0) {
    return
  }

  if (overlayStyle.kind === 'bottom-banner') {
    const bannerHeight = height * (overlayStyle.heightRatio ?? 0.26)
    ctx.fillStyle = `${overlayStyle.color}${Math.round(overlayStyle.opacity * 255)
      .toString(16)
      .padStart(2, '0')}`
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight)
    return
  }

  if (overlayStyle.kind === 'top-fade') {
    const overlayHeight = height * (overlayStyle.heightRatio ?? 0.32)
    const gradient = ctx.createLinearGradient(0, 0, 0, overlayHeight)
    gradient.addColorStop(0, `${overlayStyle.color}${Math.round(overlayStyle.opacity * 255)
      .toString(16)
      .padStart(2, '0')}`)
    gradient.addColorStop(1, `${overlayStyle.color}00`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, overlayHeight)
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const characters = Array.from(text.replace(/\n/g, ' \n '))
  const lines: string[] = []
  let currentLine = ''

  characters.forEach((char) => {
    if (char === '\n') {
      lines.push(currentLine.trim())
      currentLine = ''
      return
    }

    const nextLine = `${currentLine}${char}`

    if (ctx.measureText(nextLine).width <= maxWidth || currentLine.length === 0) {
      currentLine = nextLine
      return
    }

    lines.push(currentLine.trim())
    currentLine = char.trimStart()
  })

  if (currentLine.trim()) {
    lines.push(currentLine.trim())
  }

  return lines.length > 0 ? lines.slice(0, 3) : ['']
}

function getTextMetrics(
  width: number,
  height: number,
  safeArea: RenderOptions['platform']['safeArea'],
  position: TextPosition,
  align: TextAlign,
  lineCount: number,
  fontSize: number,
) {
  const paddingX = Math.max(safeArea.left, width * 0.08)
  const lineHeight = fontSize * 1.08
  const blockHeight = lineHeight * lineCount
  const x =
    align === 'left' ? paddingX : align === 'right' ? width - paddingX : width / 2
  const y =
    position === 'top'
      ? safeArea.top + fontSize
      : position === 'bottom'
        ? height - safeArea.bottom - blockHeight + fontSize * 0.2
        : height / 2 - blockHeight / 2 + fontSize * 0.8

  return {
    x,
    y,
    lineHeight,
    maxWidth: width - paddingX * 2,
  }
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
  width: number,
  height: number,
) {
  const { textSettings, platform } = options
  const title = textSettings.title.trim()

  if (!title) {
    return
  }

  ctx.save()
  ctx.font = `700 ${textSettings.fontSize}px ${FONT_STACK}`
  ctx.textAlign = textSettings.align
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = 'rgba(15, 23, 42, 0.3)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 12
  ctx.fillStyle = textSettings.color

  const metrics = getTextMetrics(
    width,
    height,
    platform.safeArea,
    textSettings.position,
    textSettings.align,
    1,
    textSettings.fontSize,
  )
  const lines = wrapText(ctx, title, metrics.maxWidth)
  const nextMetrics = getTextMetrics(
    width,
    height,
    platform.safeArea,
    textSettings.position,
    textSettings.align,
    lines.length,
    textSettings.fontSize,
  )

  lines.forEach((line, index) => {
    ctx.fillText(line, nextMetrics.x, nextMetrics.y + index * nextMetrics.lineHeight)
  })

  ctx.restore()
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  ctx.save()
  ctx.font = `500 ${Math.max(Math.round(width * 0.022), 20)}px "Plus Jakarta Sans", sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.86)'
  ctx.shadowColor = 'rgba(15, 23, 42, 0.25)'
  ctx.shadowBlur = 16
  ctx.fillText(text, width - 36, height - 30)
  ctx.restore()
}

function drawSafeArea(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  safeArea: RenderOptions['platform']['safeArea'],
) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.lineWidth = 4
  ctx.setLineDash([18, 14])
  ctx.strokeRect(
    safeArea.left,
    safeArea.top,
    width - safeArea.left - safeArea.right,
    height - safeArea.top - safeArea.bottom,
  )
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'
  ctx.fillRect(
    safeArea.left,
    safeArea.top,
    width - safeArea.left - safeArea.right,
    height - safeArea.top - safeArea.bottom,
  )
  ctx.restore()
}

function drawEmptyState(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#eff4fb')
  gradient.addColorStop(1, '#dfe9f7')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.strokeStyle = 'rgba(23, 32, 51, 0.15)'
  ctx.lineWidth = 4
  ctx.setLineDash([22, 14])
  ctx.strokeRect(width * 0.1, height * 0.12, width * 0.8, height * 0.76)
  ctx.restore()

  ctx.fillStyle = '#172033'
  ctx.textAlign = 'center'
  ctx.font = `700 ${Math.max(Math.round(width * 0.045), 26)}px ${FONT_STACK}`
  ctx.fillText('Upload one image', width / 2, height / 2 - 18)
  ctx.font = `500 ${Math.max(Math.round(width * 0.021), 16)}px "Plus Jakarta Sans", sans-serif`
  ctx.fillStyle = '#516079'
  ctx.fillText('and create covers for multiple platforms.', width / 2, height / 2 + 24)
}

export function drawCoverToCanvas(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
  width = options.platform.width,
  height = options.platform.height,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#d9e4f3'
  ctx.fillRect(0, 0, width, height)

  if (options.image) {
    ctx.drawImage(
      options.image.element,
      options.transform.x,
      options.transform.y,
      options.image.width * options.transform.scale,
      options.image.height * options.transform.scale,
    )
  } else {
    drawEmptyState(ctx, width, height)
  }

  drawOverlay(ctx, width, height, options.overlayStyle)
  drawTitle(ctx, options, width, height)

  if (options.includeWatermark) {
    drawWatermark(ctx, width, height, options.watermarkText)
  }

  if (options.showSafeArea && options.includeSafeArea) {
    drawSafeArea(ctx, width, height, options.platform.safeArea)
  }
}

export async function exportCoverAsPng(options: RenderOptions) {
  const { platform } = options
  const canvas = document.createElement('canvas')
  canvas.width = platform.width
  canvas.height = platform.height
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas rendering is not supported in this browser.')
  }

  drawCoverToCanvas(context, options)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) {
    throw new Error('Unable to export PNG file.')
  }

  const fileName = `creator-cover-kit-${sanitizeFileName(platform.name)}-${platform.width}x${platform.height}.png`
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(objectUrl)
}
