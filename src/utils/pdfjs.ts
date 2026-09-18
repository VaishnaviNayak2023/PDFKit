import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export async function loadPdfDocument(data: ArrayBuffer | Uint8Array, password?: string) {
  return pdfjsLib.getDocument({
    data: data instanceof Uint8Array ? data : new Uint8Array(data),
    password,
    isOffscreenCanvasSupported: false
  }).promise
}

export async function renderPageToCanvas(
  data: ArrayBuffer | Uint8Array,
  pageNumber: number,
  scale = 1.5,
  password?: string
): Promise<HTMLCanvasElement> {
  const pdf = await loadPdfDocument(data, password)
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas context')
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  return canvas
}

export async function renderPageToJpeg(
  data: ArrayBuffer | Uint8Array,
  pageNumber: number,
  scale = 1.2,
  quality = 0.72
): Promise<Uint8Array> {
  const canvas = await renderPageToCanvas(data, pageNumber, scale)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('JPEG encode failed'))), 'image/jpeg', quality)
  })
  return new Uint8Array(await blob.arrayBuffer())
}

export async function extractPdfText(data: ArrayBuffer | Uint8Array): Promise<string> {
  const pdf = await loadPdfDocument(data)
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => ('str' in item ? item.str : '')).join(' ')
    text += `\n--- Page ${i} ---\n${pageText}`
  }
  return text.trim()
}

export { pdfjsLib }
