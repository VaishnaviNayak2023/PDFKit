import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import type { ConversionOptions } from '@/types'

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target!.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

async function getPDFJS() {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
  return pdfjsLib
}

// ─── PDF → Text ────────────────────────────────────────────────────────────────

export async function pdfToText(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<string> {
  const pdfjsLib = await getPDFJS()
  const buffer = await fileToArrayBuffer(file)
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages)
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    fullText += `\n--- Page ${i} ---\n${pageText}`
  }

  return fullText.trim()
}

// ─── PDF → Images ──────────────────────────────────────────────────────────────

export async function pdfToImages(
  file: File,
  format: 'jpeg' | 'png' = 'png',
  dpi: number = 150,
  onProgress?: (page: number, total: number) => void
): Promise<string[]> {
  const pdfjsLib = await getPDFJS()
  const buffer = await fileToArrayBuffer(file)
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise
  const scale = dpi / 72
  const images: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages)
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    images.push(canvas.toDataURL(mimeType, 0.92))
  }

  return images
}

// ─── PDF → Word ────────────────────────────────────────────────────────────────

export async function pdfToWord(file: File): Promise<Blob> {
  const text = await pdfToText(file)
  const sections = text.split(/--- Page \d+ ---/).filter(Boolean)

  const children = sections.flatMap((section, idx) => [
    new Paragraph({
      text: `Page ${idx + 1}`,
      heading: HeadingLevel.HEADING_2
    }),
    ...section
      .split('\n')
      .filter(Boolean)
      .map(line => new Paragraph({
        children: [new TextRun({ text: line.trim(), size: 22 })]
      }))
  ])

  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  })

  return Packer.toBlob(doc)
}

// ─── PDF → Excel ───────────────────────────────────────────────────────────────

export async function pdfToExcel(file: File): Promise<Blob> {
  const XLSX = await import('xlsx')
  const text = await pdfToText(file)
  const rows = text.split('\n').map(line => [line])
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Extracted Text')
  const xlsxData = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new Blob([xlsxData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}

// ─── Images → PDF ──────────────────────────────────────────────────────────────

export async function imagesToPDF(
  files: File[],
  onProgress?: (idx: number, total: number) => void
): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length)
    const file = files[i]
    const buffer = await fileToArrayBuffer(file)
    const isJpeg = file.type === 'image/jpeg' || file.name.match(/\.jpe?g$/i)
    const isPng = file.type === 'image/png' || file.name.match(/\.png$/i)

    let pdfImage
    if (isJpeg) {
      pdfImage = await pdfDoc.embedJpg(new Uint8Array(buffer))
    } else if (isPng) {
      pdfImage = await pdfDoc.embedPng(new Uint8Array(buffer))
    } else {
      // Convert to PNG via canvas
      const blob = new Blob([buffer], { type: file.type })
      const imgBitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = imgBitmap.width
      canvas.height = imgBitmap.height
      canvas.getContext('2d')!.drawImage(imgBitmap, 0, 0)
      const pngBlob = await new Promise<Blob>(resolve =>
        canvas.toBlob(b => resolve(b!), 'image/png')
      )
      const pngBuffer = await pngBlob.arrayBuffer()
      pdfImage = await pdfDoc.embedPng(new Uint8Array(pngBuffer))
    }

    const page = pdfDoc.addPage([pdfImage.width, pdfImage.height])
    page.drawImage(pdfImage, {
      x: 0,
      y: 0,
      width: pdfImage.width,
      height: pdfImage.height
    })
  }

  return pdfDoc.save()
}

// ─── Word → PDF ────────────────────────────────────────────────────────────────

export async function wordToPDF(file: File): Promise<Uint8Array> {
  const mammoth = await import('mammoth')
  const buffer = await fileToArrayBuffer(file)
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
  return htmlToPDF(result.value)
}

// ─── Markdown → PDF ────────────────────────────────────────────────────────────

export async function markdownToPDF(content: string): Promise<Uint8Array> {
  // Basic Markdown → HTML conversion
  const html = content
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '• $1')
    .replace(/^\d+\. (.+)$/gm, '$1')
    .replace(/\n\n/g, '\n')
  return htmlToPDF(html)
}

// ─── HTML → PDF ────────────────────────────────────────────────────────────────

export async function htmlToPDF(html: string): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Extract plain text from HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const text = tempDiv.innerText || tempDiv.textContent || ''

  doc.setFontSize(11)
  const lines = doc.splitTextToSize(text, 180)
  let y = 20
  const lineHeight = 6

  for (const line of lines) {
    if (y > 280) {
      doc.addPage()
      y = 20
    }
    doc.text(line, 15, y)
    y += lineHeight
  }

  const output = doc.output('arraybuffer')
  return new Uint8Array(output as ArrayBuffer)
}

// ─── TXT → PDF ─────────────────────────────────────────────────────────────────

export async function textToPDF(text: string): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setFontSize(11)
  const lines = doc.splitTextToSize(text, 180)
  let y = 20

  for (const line of lines) {
    if (y > 280) {
      doc.addPage()
      y = 20
    }
    doc.text(line, 15, y)
    y += 6
  }

  const output = doc.output('arraybuffer')
  return new Uint8Array(output as ArrayBuffer)
}

// ─── CSV → XLSX ────────────────────────────────────────────────────────────────

export async function csvToXlsx(file: File): Promise<Blob> {
  const XLSX = await import('xlsx')
  const text = await file.text()
  const wb = XLSX.read(text, { type: 'string' })
  const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}

// ─── JSON → CSV ────────────────────────────────────────────────────────────────

export async function jsonToCsv(file: File): Promise<Blob> {
  const XLSX = await import('xlsx')
  const text = await file.text()
  const data = JSON.parse(text)
  const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data])
  const csv = XLSX.utils.sheet_to_csv(ws)
  return new Blob([csv], { type: 'text/csv' })
}

// ─── Download helper ───────────────────────────────────────────────────────────

export function downloadBlob(blob: Blob | Uint8Array, filename: string) {
  const blobObj = blob instanceof Uint8Array
    ? new Blob([blob], { type: 'application/pdf' })
    : blob
  const url = URL.createObjectURL(blobObj)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
