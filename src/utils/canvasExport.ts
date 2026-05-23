import type { ExportFormat, OverlayStyle, RenderOptions, TextAlign, TextPosition } from '../types'
import { sanitizeFileName } from './imageHelpers'

const FONT_STACK = '"Space Grotesk", "Plus Jakarta Sans", "Avenir Next", sans-serif'
const UI_STACK = '"Plus Jakarta Sans", "Avenir Next", sans-serif'

function alphaHex(opacity: number) {
  return Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  backgroundColor: string,
  textColor: string,
) {
  ctx.save()
  ctx.font = `700 28px ${UI_STACK}`
  const textWidth = ctx.measureText(text).width
  const width = textWidth + 44
  const height = 52
  drawRoundedRect(ctx, x, y, width, height, 18)
  ctx.fillStyle = backgroundColor
  ctx.fill()
  ctx.fillStyle = textColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + 22, y + height / 2 + 1)
  ctx.restore()
}

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
    ctx.fillStyle = `${overlayStyle.color}${alphaHex(overlayStyle.opacity)}`
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight)
    return
  }

  if (overlayStyle.kind === 'top-fade') {
    const overlayHeight = height * (overlayStyle.heightRatio ?? 0.32)
    const gradient = ctx.createLinearGradient(0, 0, 0, overlayHeight)
    gradient.addColorStop(0, `${overlayStyle.color}${alphaHex(overlayStyle.opacity)}`)
    gradient.addColorStop(1, `${overlayStyle.color}00`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, overlayHeight)
    return
  }

  if (overlayStyle.kind === 'center-card') {
    const cardWidth = width * (overlayStyle.cardWidthRatio ?? 0.74)
    const cardHeight = height * 0.34
    const cardX = (width - cardWidth) / 2
    const cardY = height * 0.34

    drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 42)
    ctx.fillStyle = `${overlayStyle.color}${alphaHex(overlayStyle.opacity)}`
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.78)'
    ctx.lineWidth = 3
    ctx.stroke()
    return
  }

  if (overlayStyle.kind === 'corner-label') {
    const bottomHeight = height * (overlayStyle.heightRatio ?? 0.18)
    const gradient = ctx.createLinearGradient(0, height - bottomHeight, 0, height)
    gradient.addColorStop(0, `${overlayStyle.color}00`)
    gradient.addColorStop(1, `${overlayStyle.color}${alphaHex(overlayStyle.opacity)}`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, height - bottomHeight, width, bottomHeight)
    return
  }

  if (overlayStyle.kind === 'fitness-impact') {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, `${overlayStyle.color}${alphaHex(overlayStyle.opacity)}`)
    gradient.addColorStop(0.55, `${overlayStyle.color}22`)
    gradient.addColorStop(1, `${overlayStyle.color}${alphaHex(overlayStyle.opacity)}`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = `${overlayStyle.accentColor ?? '#f97316'}22`
    ctx.fillRect(0, height * 0.68, width, height * 0.32)
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = text.split('\n')
  const lines: string[] = []

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push('')
      return
    }

    const words = paragraph.split(/\s+/)
    let currentLine = ''

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word

      if (ctx.measureText(candidate).width <= maxWidth || !currentLine) {
        currentLine = candidate
        return
      }

      lines.push(currentLine)
      currentLine = word
    })

    if (currentLine) {
      lines.push(currentLine)
    }
  })

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
  overlayStyle: OverlayStyle,
) {
  const cardLeft = width * 0.18
  const cardRight = width * 0.18
  const paddingX =
    overlayStyle.kind === 'center-card'
      ? Math.max(cardLeft, width * 0.16)
      : Math.max(safeArea.left, width * 0.08)
  const lineHeight = fontSize * 1.08
  const blockHeight = lineHeight * lineCount
  const x =
    align === 'left' ? paddingX : align === 'right' ? width - paddingX : width / 2
  const y =
    overlayStyle.kind === 'center-card'
      ? height * 0.48 - blockHeight / 2 + fontSize * 0.72
      : position === 'top'
        ? safeArea.top + fontSize
        : position === 'bottom'
          ? height - safeArea.bottom - blockHeight + fontSize * 0.2
          : height / 2 - blockHeight / 2 + fontSize * 0.8

  return {
    x,
    y,
    lineHeight,
    maxWidth:
      overlayStyle.kind === 'center-card'
        ? width - cardLeft - cardRight
        : width - paddingX * 2,
  }
}

export interface TitleLayout {
  lines: string[]
  x: number
  y: number
  lineHeight: number
  maxWidth: number
  box: {
    left: number
    top: number
    right: number
    bottom: number
  }
}

function formatMimeType(format: ExportFormat) {
  return format === 'jpg' ? 'image/jpeg' : 'image/png'
}

export function getTitleLayout(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
  width: number,
  height: number,
): TitleLayout | null {
  const { textSettings, platform, overlayStyle } = options
  const title = textSettings.title.trim()

  if (!title) {
    return null
  }

  ctx.save()
  ctx.font = `700 ${textSettings.fontSize}px ${FONT_STACK}`

  const metrics = getTextMetrics(
    width,
    height,
    platform.safeArea,
    textSettings.position,
    textSettings.align,
    1,
    textSettings.fontSize,
    overlayStyle,
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
    overlayStyle,
  )

  const lineWidths = lines.map((line) => ctx.measureText(line).width)
  const widestLine = lineWidths.length > 0 ? Math.max(...lineWidths) : 0
  const alignedLeft =
    textSettings.align === 'left'
      ? nextMetrics.x
      : textSettings.align === 'center'
        ? nextMetrics.x - widestLine / 2
        : nextMetrics.x - widestLine
  const alignedRight = alignedLeft + widestLine
  const top = nextMetrics.y - textSettings.fontSize + textSettings.offsetY
  const bottom =
    nextMetrics.y + (lines.length - 1) * nextMetrics.lineHeight + textSettings.offsetY + 18

  ctx.restore()

  return {
    lines,
    x: nextMetrics.x + textSettings.offsetX,
    y: nextMetrics.y + textSettings.offsetY,
    lineHeight: nextMetrics.lineHeight,
    maxWidth: nextMetrics.maxWidth,
    box: {
      left: alignedLeft + textSettings.offsetX - 24,
      top: top - 20,
      right: alignedRight + textSettings.offsetX + 24,
      bottom: bottom + 20,
    },
  }
}

function drawDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: RenderOptions,
) {
  const { overlayStyle } = options

  if (overlayStyle.kind === 'top-fade' && overlayStyle.badgeText) {
    drawBadge(
      ctx,
      overlayStyle.badgeText,
      width * 0.08,
      height * 0.07,
      overlayStyle.accentColor ?? '#ff7a59',
      '#ffffff',
    )
  }

  if (overlayStyle.kind === 'corner-label') {
    if (overlayStyle.badgeText) {
      drawBadge(
        ctx,
        overlayStyle.badgeText,
        width * 0.08,
        height * 0.08,
        overlayStyle.accentColor ?? '#ff7a59',
        '#ffffff',
      )
    }

    if (overlayStyle.signatureText) {
      ctx.save()
      ctx.font = `600 28px ${UI_STACK}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      ctx.fillText(overlayStyle.signatureText, width * 0.08, height * 0.89)
      ctx.restore()
    }
  }

  if (overlayStyle.kind === 'center-card' && overlayStyle.badgeText) {
    drawBadge(
      ctx,
      overlayStyle.badgeText,
      width * 0.2,
      height * 0.36,
      overlayStyle.accentColor ?? '#2f7c85',
      '#ffffff',
    )
  }

  if (overlayStyle.kind === 'fitness-impact') {
    if (overlayStyle.numberText) {
      ctx.save()
      ctx.font = `700 ${Math.round(width * 0.3)}px ${FONT_STACK}`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = `${overlayStyle.accentColor ?? '#f97316'}66`
      ctx.fillText(overlayStyle.numberText, width * 0.92, height * 0.38)
      ctx.restore()
    }

    if (overlayStyle.badgeText) {
      drawBadge(
        ctx,
        overlayStyle.badgeText,
        width * 0.08,
        height * 0.08,
        '#ffffff',
        overlayStyle.color,
      )
    }
  }
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
  width: number,
  height: number,
) {
  const { textSettings, overlayStyle } = options
  const layout = getTitleLayout(ctx, options, width, height)

  if (!layout) {
    return
  }

  ctx.save()
  ctx.font = `700 ${textSettings.fontSize}px ${FONT_STACK}`
  ctx.textAlign = textSettings.align
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor =
    overlayStyle.kind === 'center-card' ? 'rgba(255,255,255,0)' : 'rgba(15, 23, 42, 0.3)'
  ctx.shadowBlur = overlayStyle.kind === 'center-card' ? 0 : 24
  ctx.shadowOffsetY = overlayStyle.kind === 'center-card' ? 0 : 12
  ctx.fillStyle = textSettings.color

  layout.lines.forEach((line, index) => {
    ctx.fillText(line, layout.x, layout.y + index * layout.lineHeight)
  })

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
  ctx.fillText('上传一张图片', width / 2, height / 2 - 18)
  ctx.font = `500 ${Math.max(Math.round(width * 0.021), 16)}px ${UI_STACK}`
  ctx.fillStyle = '#516079'
  ctx.fillText('即可快速生成多平台封面', width / 2, height / 2 + 24)
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
  drawDecorations(ctx, width, height, options)
  drawTitle(ctx, options, width, height)

  if (options.showSafeArea && options.includeSafeArea) {
    drawSafeArea(ctx, width, height, options.platform.safeArea)
  }
}

export async function exportCoverAsPng(options: RenderOptions) {
  const { platform } = options
  const format = options.format ?? 'png'
  const canvas = document.createElement('canvas')
  canvas.width = platform.width
  canvas.height = platform.height
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas rendering is not supported in this browser.')
  }

  drawCoverToCanvas(context, options)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, formatMimeType(format), format === 'jpg' ? 0.92 : undefined)
  })

  if (!blob) {
    throw new Error('Unable to export PNG file.')
  }

  const extension = format === 'jpg' ? 'jpg' : 'png'
  const fileName = `creator-cover-kit-${sanitizeFileName(platform.name)}-${platform.width}x${platform.height}.${extension}`
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(objectUrl)

  return fileName
}
