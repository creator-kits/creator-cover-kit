export type TextPosition = 'top' | 'center' | 'bottom'
export type TextAlign = 'left' | 'center' | 'right'
export type ExportFormat = 'png' | 'jpg'
export type OverlayKind =
  | 'none'
  | 'bottom-banner'
  | 'top-fade'
  | 'center-card'
  | 'corner-label'
  | 'fitness-impact'

export interface SafeArea {
  top: number
  right: number
  bottom: number
  left: number
}

export interface PlatformPreset {
  id: string
  name: string
  width: number
  height: number
  aspectRatioLabel: string
  safeArea: SafeArea
}

export interface ImageTransform {
  scale: number
  x: number
  y: number
}

export interface UploadedImage {
  element: HTMLImageElement
  src: string
  width: number
  height: number
  name: string
  type: string
}

export interface TextSettings {
  title: string
  fontSize: number
  color: string
  position: TextPosition
  align: TextAlign
  offsetX: number
  offsetY: number
}

export interface OverlayStyle {
  kind: OverlayKind
  color: string
  opacity: number
  accentColor?: string
  badgeText?: string
  signatureText?: string
  numberText?: string
  heightRatio?: number
  cardWidthRatio?: number
}

export interface TemplatePreset {
  id: string
  name: string
  description: string
  textSettings: Partial<TextSettings>
  overlayStyle: OverlayStyle
}

export interface RenderOptions {
  platform: PlatformPreset
  image: UploadedImage | null
  transform: ImageTransform
  textSettings: TextSettings
  overlayStyle: OverlayStyle
  showSafeArea: boolean
  includeSafeArea: boolean
  format?: ExportFormat
}
