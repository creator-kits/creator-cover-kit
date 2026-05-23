import type { PlatformPreset, TemplatePreset } from '../types'

export const platformPresets: PlatformPreset[] = [
  {
    id: 'xiaohongshu-portrait',
    name: '小红书图文封面',
    width: 1080,
    height: 1440,
    aspectRatioLabel: '3:4',
    safeArea: { top: 96, right: 72, bottom: 140, left: 72 },
  },
  {
    id: 'xiaohongshu-square',
    name: '小红书方图',
    width: 1080,
    height: 1080,
    aspectRatioLabel: '1:1',
    safeArea: { top: 88, right: 88, bottom: 110, left: 88 },
  },
  {
    id: 'douyin-cover',
    name: '抖音竖版封面',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    safeArea: { top: 150, right: 88, bottom: 180, left: 88 },
  },
  {
    id: 'tiktok-cover',
    name: 'TikTok vertical cover',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    safeArea: { top: 150, right: 88, bottom: 180, left: 88 },
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube thumbnail',
    width: 1280,
    height: 720,
    aspectRatioLabel: '16:9',
    safeArea: { top: 60, right: 80, bottom: 70, left: 80 },
  },
  {
    id: 'instagram-square',
    name: 'Instagram post square',
    width: 1080,
    height: 1080,
    aspectRatioLabel: '1:1',
    safeArea: { top: 88, right: 88, bottom: 110, left: 88 },
  },
  {
    id: 'instagram-reel-cover',
    name: 'Instagram reel cover',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    safeArea: { top: 150, right: 88, bottom: 180, left: 88 },
  },
  {
    id: 'pinterest-pin',
    name: 'Pinterest pin',
    width: 1000,
    height: 1500,
    aspectRatioLabel: '2:3',
    safeArea: { top: 120, right: 80, bottom: 140, left: 80 },
  },
]

export const templatePresets: TemplatePreset[] = [
  {
    id: 'clean-title',
    name: 'Clean title',
    description: '大标题居中，适合知识博主。',
    textSettings: {
      position: 'center',
      align: 'center',
      fontSize: 76,
      color: '#ffffff',
    },
    overlayStyle: {
      kind: 'none',
      color: '#111827',
      opacity: 0,
    },
  },
  {
    id: 'bottom-banner',
    name: 'Bottom banner',
    description: '底部半透明色块加标题，适合课程封面。',
    textSettings: {
      position: 'bottom',
      align: 'center',
      fontSize: 64,
      color: '#ffffff',
    },
    overlayStyle: {
      kind: 'bottom-banner',
      color: '#0f172a',
      opacity: 0.62,
      heightRatio: 0.28,
    },
  },
  {
    id: 'top-hook',
    name: 'Top hook',
    description: '顶部大标题，适合短视频封面。',
    textSettings: {
      position: 'top',
      align: 'left',
      fontSize: 68,
      color: '#ffffff',
    },
    overlayStyle: {
      kind: 'top-fade',
      color: '#111827',
      opacity: 0.72,
      heightRatio: 0.34,
    },
  },
]
