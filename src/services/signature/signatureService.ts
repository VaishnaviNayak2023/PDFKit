import type { SignatureData, SignaturePlacement } from '@/types'

const SIGNATURE_KEY = 'pdfkit_saved_signatures'

// ─── Create from Canvas ────────────────────────────────────────────────────────

export function createSignatureFromCanvas(canvas: HTMLCanvasElement): SignatureData {
  // Trim to tight bounding box
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData

  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3]
      if (alpha > 10) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    return {
      type: 'drawn',
      imageData: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
      createdAt: new Date()
    }
  }

  const padding = 10
  const trimCanvas = document.createElement('canvas')
  trimCanvas.width = maxX - minX + padding * 2
  trimCanvas.height = maxY - minY + padding * 2
  const trimCtx = trimCanvas.getContext('2d')!
  trimCtx.drawImage(canvas, minX - padding, minY - padding, trimCanvas.width, trimCanvas.height, 0, 0, trimCanvas.width, trimCanvas.height)

  return {
    type: 'drawn',
    imageData: trimCanvas.toDataURL('image/png'),
    width: trimCanvas.width,
    height: trimCanvas.height,
    createdAt: new Date()
  }
}

// ─── Create from Typed Text ────────────────────────────────────────────────────

export async function createSignatureFromText(
  text: string,
  fontFamily = 'Dancing Script',
  color = '#1a1a2e',
  fontSize = 64
): Promise<SignatureData> {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 160
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = `${fontSize}px "${fontFamily}", cursive, serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  return {
    type: 'typed',
    imageData: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    name: text,
    createdAt: new Date()
  }
}

// ─── Create from Uploaded Image ────────────────────────────────────────────────

export async function createSignatureFromImage(file: File): Promise<SignatureData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const imageData = e.target!.result as string
      const img = new Image()
      img.onload = () => {
        resolve({
          type: 'uploaded',
          imageData,
          width: img.naturalWidth,
          height: img.naturalHeight,
          createdAt: new Date()
        })
      }
      img.onerror = reject
      img.src = imageData
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Place Signature on PDF ────────────────────────────────────────────────────

export async function placeSignatureOnPDF(
  file: File,
  signature: SignatureData,
  placement: SignaturePlacement
): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const buffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(new Uint8Array(buffer))
  const pages = pdfDoc.getPages()

  if (placement.pageIndex >= pages.length) {
    throw new Error('Page index out of range')
  }

  const page = pages[placement.pageIndex]
  const { width: pageW, height: pageH } = page.getSize()

  // Convert base64 data URL to Uint8Array
  const base64 = signature.imageData.split(',')[1]
  const binaryStr = atob(base64)
  const bytes2 = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes2[i] = binaryStr.charCodeAt(i)
  }

  // Embed PNG (signature should always be PNG for transparency)
  const pdfImage = await pdfDoc.embedPng(bytes2)

  const x = placement.x * pageW
  const y = pageH - (placement.y + placement.height) * pageH
  const w = placement.width * pageW
  const h = placement.height * pageH

  page.drawImage(pdfImage, { x, y, width: w, height: h })

  return pdfDoc.save()
}

// ─── Local Storage for Signatures ─────────────────────────────────────────────

export function saveSignature(sig: SignatureData): void {
  const saved = getSavedSignatures()
  saved.unshift(sig)
  localStorage.setItem(SIGNATURE_KEY, JSON.stringify(saved.slice(0, 10)))
}

export function getSavedSignatures(): SignatureData[] {
  try {
    const stored = localStorage.getItem(SIGNATURE_KEY)
    if (!stored) return []
    return JSON.parse(stored).map((s: SignatureData) => ({
      ...s,
      createdAt: new Date(s.createdAt)
    }))
  } catch {
    return []
  }
}

export function deleteSignature(index: number): void {
  const saved = getSavedSignatures()
  saved.splice(index, 1)
  localStorage.setItem(SIGNATURE_KEY, JSON.stringify(saved))
}

export function clearAllSignatures(): void {
  localStorage.removeItem(SIGNATURE_KEY)
}

// ─── Signature Fonts ──────────────────────────────────────────────────────────

export const SIGNATURE_FONTS = [
  { label: 'Dancing Script', value: 'Dancing Script' },
  { label: 'Great Vibes', value: 'Great Vibes' },
  { label: 'Pacifico', value: 'Pacifico' },
  { label: 'Sacramento', value: 'Sacramento' },
  { label: 'Satisfy', value: 'Satisfy' },
  { label: 'Pinyon Script', value: 'Pinyon Script' },
  { label: 'Alex Brush', value: 'Alex Brush' },
  { label: 'Allura', value: 'Allura' }
]

export const SIGNATURE_COLORS = [
  { label: 'Black', value: '#0a0a0a' },
  { label: 'Dark Blue', value: '#1a237e' },
  { label: 'Navy', value: '#0d1b2a' },
  { label: 'Dark Green', value: '#1b5e20' },
  { label: 'Dark Red', value: '#b71c1c' },
  { label: 'Purple', value: '#4a148c' }
]
