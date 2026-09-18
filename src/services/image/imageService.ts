import type { CropRect, ImageResizeOptions, ImageConvertOptions, WatermarkOptions } from '@/types'

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file)
}

function bitmapToCanvas(bitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('Canvas to blob failed'))),
      `image/${format}`,
      quality
    )
  })
}

function getMimeFormat(file: File): string {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpeg'
}

// ─── Compress ─────────────────────────────────────────────────────────────────

export async function compressImage(file: File, quality: number): Promise<Blob> {
  const bitmap = await fileToImageBitmap(file)
  const canvas = bitmapToCanvas(bitmap)
  bitmap.close()
  const format = getMimeFormat(file)
  return canvasToBlob(canvas, format, Math.max(0.01, Math.min(1, quality)))
}

// ─── Resize ───────────────────────────────────────────────────────────────────

export async function resizeImage(file: File, options: ImageResizeOptions): Promise<Blob> {
  const bitmap = await fileToImageBitmap(file)
  const { width: origW, height: origH } = bitmap

  let targetW = options.width ?? origW
  let targetH = options.height ?? origH

  if (options.keepAspectRatio !== false) {
    const ratio = origW / origH
    if (options.width && !options.height) {
      targetH = Math.round(options.width / ratio)
    } else if (!options.width && options.height) {
      targetW = Math.round(options.height * ratio)
    } else if (options.width && options.height) {
      const scaleW = options.width / origW
      const scaleH = options.height / origH
      const scale = Math.min(scaleW, scaleH)
      targetW = Math.round(origW * scale)
      targetH = Math.round(origH * scale)
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close()

  return canvasToBlob(canvas, getMimeFormat(file))
}

// ─── Crop ─────────────────────────────────────────────────────────────────────

export async function cropImage(file: File, rect: CropRect): Promise<Blob> {
  const bitmap = await fileToImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = rect.width
  canvas.height = rect.height
  canvas.getContext('2d')!.drawImage(
    bitmap,
    rect.x, rect.y, rect.width, rect.height,
    0, 0, rect.width, rect.height
  )
  bitmap.close()
  return canvasToBlob(canvas, 'png')
}

// ─── Rotate ───────────────────────────────────────────────────────────────────

export async function rotateImage(file: File, angleDegrees: number): Promise<Blob> {
  const bitmap = await fileToImageBitmap(file)
  const rad = angleDegrees * (Math.PI / 180)
  const abscos = Math.abs(Math.cos(rad))
  const abssin = Math.abs(Math.sin(rad))
  const newW = Math.round(bitmap.width * abscos + bitmap.height * abssin)
  const newH = Math.round(bitmap.width * abssin + bitmap.height * abscos)

  const canvas = document.createElement('canvas')
  canvas.width = newW
  canvas.height = newH
  const ctx = canvas.getContext('2d')!
  ctx.translate(newW / 2, newH / 2)
  ctx.rotate(rad)
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)
  bitmap.close()

  return canvasToBlob(canvas, 'png')
}

// ─── Format Convert ───────────────────────────────────────────────────────────

export async function convertImageFormat(
  file: File,
  options: ImageConvertOptions
): Promise<Blob> {
  const bitmap = await fileToImageBitmap(file)
  const canvas = bitmapToCanvas(bitmap)
  bitmap.close()
  return canvasToBlob(canvas, options.format, options.quality ?? 0.92)
}

// ─── Watermark ────────────────────────────────────────────────────────────────

export async function addWatermarkToImage(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  const bitmap = await fileToImageBitmap(file)
  const canvas = bitmapToCanvas(bitmap)
  bitmap.close()
  const ctx = canvas.getContext('2d')!

  if (options.type === 'text' && options.text) {
    ctx.save()
    ctx.globalAlpha = options.opacity
    const fontSize = options.fontSize ?? Math.round(Math.min(canvas.width, canvas.height) * 0.07)
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.fillStyle = options.color ?? '#ffffff'

    if (options.position === 'center') {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((options.rotation * Math.PI) / 180)
      ctx.fillText(options.text, 0, 0)
    } else if (options.position === 'tile') {
      const metrics = ctx.measureText(options.text)
      const textW = metrics.width + 20
      const textH = fontSize + 20
      ctx.rotate((options.rotation * Math.PI) / 180)
      for (let x = -canvas.width * 2; x < canvas.width * 2; x += textW * 1.5) {
        for (let y = -canvas.height * 2; y < canvas.height * 2; y += textH * 3) {
          ctx.fillText(options.text, x, y)
        }
      }
    } else {
      ctx.textBaseline = 'middle'
      const margin = 20
      const metrics = ctx.measureText(options.text)
      let x = margin
      let y = canvas.height / 2
      if (options.position.includes('right')) x = canvas.width - metrics.width - margin
      if (options.position.includes('top')) y = fontSize
      if (options.position.includes('bottom')) y = canvas.height - fontSize
      ctx.fillText(options.text, x, y)
    }
    ctx.restore()
  }

  return canvasToBlob(canvas, 'png')
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = reject
    img.src = url
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function getCompressionRatio(original: number, compressed: number): string {
  const saved = ((original - compressed) / original) * 100
  return `${saved.toFixed(1)}%`
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target!.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
