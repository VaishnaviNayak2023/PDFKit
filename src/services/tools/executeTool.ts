import Tesseract from 'tesseract.js'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import * as pdfOps from '@/services/pdf/pdfOps'
import * as conversion from '@/services/conversion/conversionService'
import * as imageService from '@/services/image/imageService'
import * as signatureService from '@/services/signature/signatureService'
import * as invoiceService from '@/services/business/invoiceService'
import { extractPdfText, renderPageToCanvas } from '@/utils/pdfjs'
import { zipFiles } from '@/utils/download'
import type { ProcessingResult } from '@/types'
import type { InvoiceData } from '@/types'

export interface ToolSettings {
  [key: string]: string | number | boolean | undefined
}

export interface ExecuteContext {
  files: File[]
  settings: ToolSettings
  onProgress?: (value: number, label: string) => void
}

function result(filename: string, mimeType: string, data: Uint8Array | Blob): ProcessingResult {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType })
  return { data: blob, filename, mimeType, size: blob.size }
}

async function buf(file: File) {
  return file.arrayBuffer()
}

async function readText(file: File) {
  return file.text()
}

function str(settings: ToolSettings, key: string, fallback = '') {
  const value = settings[key]
  return value == null ? fallback : String(value)
}

function num(settings: ToolSettings, key: string, fallback: number) {
  const value = Number(settings[key])
  return Number.isFinite(value) ? value : fallback
}

function bool(settings: ToolSettings, key: string, fallback = false) {
  const value = settings[key]
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function pdfs(files: File[]) {
  return files.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf')
}

function images(files: File[]) {
  return files.filter(f => f.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(f.name))
}

async function textFileResult(name: string, text: string): Promise<ProcessingResult> {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  return result(name, blob.type, blob)
}

async function zipPdfs(buffers: Uint8Array[], basename: string) {
  if (buffers.length === 1) return [result(`${basename}.pdf`, 'application/pdf', buffers[0])]
  const zip = await zipFiles(buffers.map((data, i) => ({ name: `${basename}-${i + 1}.pdf`, data })))
  return [result(`${basename}.zip`, 'application/zip', zip)]
}

async function rasterizeToImages(file: File, format: 'jpeg' | 'png' | 'webp', dpi: number, onProgress?: ExecuteContext['onProgress']) {
  const { pdfToImages } = conversion
  const urls = await pdfToImages(file, format === 'webp' ? 'png' : format, dpi, (page, total) => onProgress?.(Math.round((page / total) * 100), `Rendering page ${page}/${total}`))
  const outputs: ProcessingResult[] = []
  for (let i = 0; i < urls.length; i++) {
    const dataUrl = urls[i]
    const raw = atob(dataUrl.split(',')[1] ?? '')
    const bytes = new Uint8Array(raw.length)
    for (let n = 0; n < raw.length; n++) bytes[n] = raw.charCodeAt(n)
    let blob = new Blob([bytes], { type: format === 'jpeg' ? 'image/jpeg' : 'image/png' })
    if (format === 'webp') {
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
      blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('webp failed')), 'image/webp', 0.9))
    }
    outputs.push(result(`${file.name.replace(/\.pdf$/i, '')}-page-${i + 1}.${format === 'jpeg' ? 'jpg' : format}`, blob.type, blob))
  }
  if (outputs.length > 1) {
    const zip = await zipFiles(outputs.map(o => ({ name: o.filename, data: o.data instanceof Blob ? o.data : new Blob([o.data]) })))
    return [result(`${file.name.replace(/\.pdf$/i, '')}-images.zip`, 'application/zip', zip)]
  }
  return outputs
}

async function ocrFile(file: File, onProgress?: ExecuteContext['onProgress']): Promise<string> {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const bytes = await buf(file)
    const pdf = await (await import('@/utils/pdfjs')).loadPdfDocument(bytes)
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(Math.round((i / pdf.numPages) * 100), `OCR page ${i}/${pdf.numPages}`)
      const canvas = await renderPageToCanvas(bytes, i, 2)
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas')), 'image/png'))
      const out = await Tesseract.recognize(blob, 'eng')
      text += `\n--- Page ${i} ---\n${out.data.text}`
    }
    return text.trim()
  }
  onProgress?.(40, 'Running OCR')
  const out = await Tesseract.recognize(file, 'eng')
  return out.data.text
}

function summarizeText(text: string, sentences = 6) {
  const parts = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 40)
  if (!parts.length) return text.slice(0, 1200)
  const freq = new Map<string, number>()
  for (const word of text.toLowerCase().match(/[a-z]{4,}/g) ?? []) {
    freq.set(word, (freq.get(word) ?? 0) + 1)
  }
  const scored = parts.map(sentence => {
    const score = (sentence.toLowerCase().match(/[a-z]{4,}/g) ?? []).reduce((s, w) => s + (freq.get(w) ?? 0), 0)
    return { sentence, score }
  })
  return scored.sort((a, b) => b.score - a.score).slice(0, sentences).map(s => s.sentence).join(' ')
}

function analyzeDocument(text: string, kind: 'contract' | 'resume' | 'chat', question = '') {
  const emails = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []
  const dates = text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi) ?? []
  const money = text.match(/\$\s?\d[\d,]*(?:\.\d{2})?/g) ?? []
  if (kind === 'chat') {
    const q = question.toLowerCase()
    const sentences = text.split(/(?<=[.!?])\s+/)
    const hits = sentences.filter(s => q.split(/\s+/).some(word => word.length > 3 && s.toLowerCase().includes(word)))
    return hits.slice(0, 12).join('\n') || summarizeText(text, 4)
  }
  if (kind === 'resume') {
    return [
      'Resume analysis (local, extractive)',
      '',
      `Emails: ${emails.join(', ') || 'none found'}`,
      `Dates: ${[...new Set(dates)].slice(0, 8).join(', ') || 'none found'}`,
      '',
      'Summary:',
      summarizeText(text, 8)
    ].join('\n')
  }
  return [
    'Contract analysis (local, extractive — no file upload)',
    '',
    `Money amounts: ${[...new Set(money)].slice(0, 12).join(', ') || 'none found'}`,
    `Dates: ${[...new Set(dates)].slice(0, 12).join(', ') || 'none found'}`,
    `Emails: ${[...new Set(emails)].join(', ') || 'none found'}`,
    '',
    'Key excerpts:',
    summarizeText(text, 10)
  ].join('\n')
}

async function removeBackground(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data, width, height } = image
  const corners = [0, (width - 1) * 4, (height - 1) * width * 4, ((height * width) - 1) * 4]
  const avg = [0, 0, 0]
  for (const i of corners) {
    avg[0] += data[i]
    avg[1] += data[i + 1]
    avg[2] += data[i + 2]
  }
  avg[0] /= 4; avg[1] /= 4; avg[2] /= 4
  const threshold = 42
  for (let i = 0; i < data.length; i += 4) {
    const dist = Math.abs(data[i] - avg[0]) + Math.abs(data[i + 1] - avg[1]) + Math.abs(data[i + 2] - avg[2])
    if (dist < threshold * 3) data[i + 3] = 0
  }
  ctx.putImageData(image, 0, 0)
  bitmap.close()
  return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Background removal failed')), 'image/png'))
}

async function excelToPdf(file: File): Promise<Uint8Array> {
  const XLSX = await import('xlsx')
  const wb = XLSX.read(await buf(file), { type: 'array' })
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  wb.SheetNames.forEach((name, idx) => {
    if (idx) doc.addPage()
    doc.setFontSize(14)
    doc.text(name, 12, 12)
    const rows = XLSX.utils.sheet_to_csv(wb.Sheets[name]).split('\n').slice(0, 40)
    doc.setFontSize(8)
    let y = 20
    for (const row of rows) {
      if (y > 190) break
      doc.text(doc.splitTextToSize(row, 270)[0] ?? '', 12, y)
      y += 5
    }
  })
  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer)
}

async function officeTextToPdf(file: File): Promise<Uint8Array> {
  if (/\.docx?$/i.test(file.name)) return conversion.wordToPDF(file)
  if (/\.xlsx?$/i.test(file.name) || /\.csv$/i.test(file.name)) return excelToPdf(file)
  if (/\.pptx?$/i.test(file.name) || /\.odt$/i.test(file.name) || /\.epub$/i.test(file.name)) {
    const text = await extractZipText(file)
    return conversion.textToPDF(text)
  }
  if (/\.html?$/i.test(file.name)) return conversion.htmlToPDF(await readText(file))
  if (/\.md$/i.test(file.name)) return conversion.markdownToPDF(await readText(file))
  return conversion.textToPDF(await readText(file))
}

async function extractZipText(file: File): Promise<string> {
  const bytes = new Uint8Array(await buf(file))
  // Minimal uncompressed ZIP scan for XML/HTML/text entries
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return stripped.slice(0, 20000) || 'No extractable text was found in this file.'
}

function defaultInvoice(settings: ToolSettings): InvoiceData {
  return {
    invoiceNumber: str(settings, 'invoiceNumber', 'INV-001'),
    invoiceDate: str(settings, 'invoiceDate', new Date().toISOString().slice(0, 10)),
    currency: str(settings, 'currency', 'USD'),
    seller: { name: str(settings, 'seller', 'Your Company') },
    buyer: { name: str(settings, 'buyer', 'Client') },
    lineItems: [
      {
        description: str(settings, 'item', 'Professional services'),
        quantity: num(settings, 'qty', 1),
        unitPrice: num(settings, 'price', 100)
      }
    ],
    notes: str(settings, 'notes', 'Generated locally in PDFKit')
  }
}

export async function executeTool(toolId: string, ctx: ExecuteContext): Promise<ProcessingResult[]> {
  const { files, settings, onProgress } = ctx
  onProgress?.(8, 'Validating files')
  if (!files.length && !['invoice-generator', 'gst-invoice', 'receipt-generator', 'thermal-receipt', 'purchase-order', 'quote-generator', 'business-letter', 'create-pdf', 'create-forms', 'document-templates'].includes(toolId)) {
    throw new Error('Please upload a file first')
  }

  const first = files[0]
  onProgress?.(20, 'Processing locally')

  switch (toolId) {
    case 'merge-pdf':
      return [result('merged.pdf', 'application/pdf', await pdfOps.mergePdfs(await Promise.all(pdfs(files).map(buf))))]
    case 'split-pdf':
      return zipPdfs(await pdfOps.splitPdf(await buf(first), str(settings, 'splitMode', 'every') === 'ranges' ? 'ranges' : 'every', str(settings, 'ranges', '1-1')), 'split')
    case 'compress-pdf':
    case 'optimize-pdf': {
      const quality = (str(settings, 'quality', 'medium') as 'low' | 'medium' | 'high')
      const out = await pdfOps.compressPdf(await buf(first), quality)
      return [result('compressed.pdf', 'application/pdf', out)]
    }
    case 'repair-pdf':
      return [result('repaired.pdf', 'application/pdf', await pdfOps.repairPdf(await buf(first)))]
    case 'compare-pdf': {
      if (files.length < 2) throw new Error('Upload two PDFs to compare')
      const report = await pdfOps.comparePdfs(await buf(files[0]), await buf(files[1]))
      return [await textFileResult('comparison.txt', report)]
    }
    case 'create-pdf':
      if (images(files).length) return [result('created.pdf', 'application/pdf', await conversion.imagesToPDF(images(files)))]
      if (first) return [result('created.pdf', 'application/pdf', await officeTextToPdf(first))]
      return [result('blank.pdf', 'application/pdf', await pdfOps.createBlankPdf(num(settings, 'pages', 1)))]
    case 'flatten-pdf':
      return [result('flattened.pdf', 'application/pdf', await pdfOps.flattenPdf(await buf(first)))]
    case 'organize-pdf':
    case 'reorder-pages':
      return [result('reordered.pdf', 'application/pdf', await pdfOps.reorderPages(await buf(first), str(settings, 'pages', '')))]
    case 'rotate-pages':
      return [result('rotated.pdf', 'application/pdf', await pdfOps.rotatePdf(await buf(first), num(settings, 'rotation', 90), str(settings, 'pages', '')))]
    case 'delete-pages':
      return [result('pages-removed.pdf', 'application/pdf', await pdfOps.deletePages(await buf(first), str(settings, 'pages', '1')))]
    case 'extract-pages':
      return [result('extracted.pdf', 'application/pdf', await pdfOps.extractPages(await buf(first), str(settings, 'pages', '1')))]
    case 'duplicate-pages':
      return [result('duplicated.pdf', 'application/pdf', await pdfOps.duplicatePages(await buf(first), str(settings, 'pages', '1')))]
    case 'reverse-pdf':
      return [result('reversed.pdf', 'application/pdf', await pdfOps.reversePages(await buf(first)))]
    case 'alternate-mix':
      if (files.length < 2) throw new Error('Upload two PDFs to mix')
      return [result('mixed.pdf', 'application/pdf', await pdfOps.mixPdfs(await buf(files[0]), await buf(files[1])))]
    case 'insert-blank-pages':
      return [result('blank-pages.pdf', 'application/pdf', await pdfOps.insertBlankPages(await buf(first), num(settings, 'afterPage', 1), num(settings, 'count', 1)))]
    case 'replace-pages':
      if (files.length < 2) throw new Error('Upload a base PDF and a replacement PDF')
      return [result('replaced.pdf', 'application/pdf', await pdfOps.replacePages(await buf(files[0]), await buf(files[1]), str(settings, 'pages', '1')))]
    case 'watermark-pdf':
      return [result('watermarked.pdf', 'application/pdf', await pdfOps.addWatermark(await buf(first), str(settings, 'watermark', 'CONFIDENTIAL'), num(settings, 'opacity', 0.18)))]
    case 'add-page-numbers':
      return [result('page-numbers.pdf', 'application/pdf', await pdfOps.addPageNumbers(await buf(first), str(settings, 'position', 'bottom') === 'top' ? 'top' : 'bottom'))]
    case 'header-footer':
      return [result('header-footer.pdf', 'application/pdf', await pdfOps.addHeaderFooter(await buf(first), str(settings, 'header', 'PDFKit'), str(settings, 'footer', 'Page')) )]
    case 'background-pdf': {
      const img = images(files)[0]
      if (!img) throw new Error('Upload a PDF and a background image')
      return [result('background.pdf', 'application/pdf', await pdfOps.addBackgroundImage(await buf(pdfs(files)[0] ?? first), await buf(img), img.type))]
    }
    case 'overlay-pdf':
      if (files.length < 2) throw new Error('Upload a base PDF and an overlay PDF')
      return [result('overlay.pdf', 'application/pdf', await pdfOps.overlayPdfs(await buf(files[0]), await buf(files[1]), num(settings, 'opacity', 0.35)))]
    case 'metadata-editor':
      return [result('metadata.pdf', 'application/pdf', await pdfOps.setMetadata(await buf(first), {
        title: str(settings, 'title'),
        author: str(settings, 'author'),
        subject: str(settings, 'subject'),
        keywords: str(settings, 'keywords')
      }))]
    case 'add-text':
      return [result('text-added.pdf', 'application/pdf', await pdfOps.addTextToPdf(await buf(first), str(settings, 'text', 'Hello'), num(settings, 'page', 1), num(settings, 'x', 72), num(settings, 'y', 720), num(settings, 'fontSize', 16)))]
    case 'add-images':
    case 'add-images-to-pdf': {
      const img = images(files)[0]
      const pdf = pdfs(files)[0] ?? first
      if (!img) throw new Error('Upload a PDF and an image')
      return [result('image-added.pdf', 'application/pdf', await pdfOps.addImageToPdf(await buf(pdf), await buf(img), img.type, num(settings, 'page', 1)))]
    }
    case 'highlight-pdf':
    case 'annotate-pdf':
      return [result('highlighted.pdf', 'application/pdf', await pdfOps.highlightSearch(await buf(first), str(settings, 'query', 'the')))]
    case 'fill-forms': {
      const values: Record<string, string> = {}
      str(settings, 'fields', '').split('\n').forEach(line => {
        const [key, ...rest] = line.split('=')
        if (key && rest.length) values[key.trim()] = rest.join('=').trim()
      })
      return [result('filled.pdf', 'application/pdf', await pdfOps.fillFormPdf(await buf(first), values))]
    }
    case 'create-forms':
      return [result('form.pdf', 'application/pdf', await pdfOps.createFormPdf(str(settings, 'title', 'Form'), str(settings, 'fields', 'Name\nEmail\nDate').split('\n')))]
    case 'protect-pdf':
    case 'encryption':
    case 'permission-management':
      return [result('protected.pdf', 'application/pdf', await pdfOps.protectPdf(await buf(first), str(settings, 'password'), str(settings, 'ownerPassword'), bool(settings, 'allowPrinting', true), bool(settings, 'allowCopying', false)))]
    case 'unlock-pdf':
      return [result('unlocked.pdf', 'application/pdf', await pdfOps.unlockPdf(await buf(first), str(settings, 'password')))]
    case 'redact-pdf':
      return [result('redacted.pdf', 'application/pdf', await pdfOps.redactSearch(await buf(first), str(settings, 'query', 'confidential')))]
    case 'metadata-cleaner':
      return [result('cleaned.pdf', 'application/pdf', await pdfOps.clearMetadata(await buf(first)))]
    case 'privacy-scanner':
      return [await textFileResult('privacy-scan.txt', await pdfOps.scanPrivacy(await buf(first)))]
    case 'bates-numbering':
      return [result('bates.pdf', 'application/pdf', await pdfOps.batesNumber(await buf(first), str(settings, 'prefix', 'BATES-')))]
    case 'ocr-pdf':
    case 'ocr-images':
    case 'batch-ocr':
    case 'text-extraction':
    case 'searchable-pdf': {
      const chunks: string[] = []
      for (let i = 0; i < files.length; i++) {
        chunks.push(await ocrFile(files[i], onProgress))
      }
      const text = chunks.join('\n\n')
      if (toolId === 'searchable-pdf') {
        const pdf = await conversion.textToPDF(text)
        return [result('searchable.pdf', 'application/pdf', pdf), await textFileResult('extracted.txt', text)]
      }
      return [await textFileResult('ocr.txt', text)]
    }
    case 'camera-scanner':
    case 'deskew': {
      const img = images(files)[0]
      if (!img) throw new Error('Upload a scan image')
      const rotated = toolId === 'deskew' ? await imageService.rotateImage(img, num(settings, 'rotation', 0)) : img
      const fileForPdf = rotated instanceof Blob ? new File([rotated], img.name, { type: rotated.type }) : img
      return [result('scan.pdf', 'application/pdf', await conversion.imagesToPDF([fileForPdf]))]
    }
    case 'pdf-to-word':
      return [result('document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', await conversion.pdfToWord(first))]
    case 'pdf-to-excel':
      return [result('document.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', await conversion.pdfToExcel(first))]
    case 'pdf-to-powerpoint': {
      const text = await conversion.pdfToText(first)
      const { Document, Packer, Paragraph } = await import('docx')
      const doc = new Document({ sections: [{ children: text.split('\n').map(t => new Paragraph(t)) }] })
      return [result('slides.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', await Packer.toBlob(doc))]
    }
    case 'pdf-to-html': {
      const text = await conversion.pdfToText(first)
      const html = `<!doctype html><html><body>${text.split('\n').map(l => `<p>${l}</p>`).join('')}</body></html>`
      return [result('document.html', 'text/html', new Blob([html], { type: 'text/html' }))]
    }
    case 'pdf-to-markdown':
      return [await textFileResult('document.md', await conversion.pdfToText(first))]
    case 'pdf-to-txt':
      return [await textFileResult('document.txt', await conversion.pdfToText(first))]
    case 'pdf-to-jpg':
      return rasterizeToImages(first, 'jpeg', num(settings, 'dpi', 150), onProgress)
    case 'pdf-to-png':
      return rasterizeToImages(first, 'png', num(settings, 'dpi', 150), onProgress)
    case 'pdf-to-webp':
      return rasterizeToImages(first, 'webp', num(settings, 'dpi', 120), onProgress)
    case 'pdf-to-svg': {
      const text = await conversion.pdfToText(first)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100"><rect width="100%" height="100%" fill="white"/><text x="40" y="60" font-size="14">${text.slice(0, 3000).replace(/[<>&]/g, '')}</text></svg>`
      return [result('page.svg', 'image/svg+xml', new Blob([svg], { type: 'image/svg+xml' }))]
    }
    case 'pdf-to-epub':
    case 'epub-generator': {
      const text = first ? (/\.pdf$/i.test(first.name) ? await conversion.pdfToText(first) : await readText(first)) : str(settings, 'text', 'Untitled ebook')
      const html = `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body>${text.split('\n').map(l => `<p>${l}</p>`).join('')}</body></html>`
      const zip = await zipFiles([
        { name: 'mimetype', data: new TextEncoder().encode('application/epub+zip') },
        { name: 'OPS/book.xhtml', data: new TextEncoder().encode(html) }
      ])
      return [result('book.epub', 'application/epub+zip', zip)]
    }
    case 'word-to-pdf':
    case 'combine-word':
      return [result('word.pdf', 'application/pdf', await conversion.wordToPDF(first))]
    case 'excel-to-pdf':
      return [result('excel.pdf', 'application/pdf', await excelToPdf(first))]
    case 'pptx-to-pdf':
    case 'odt-to-docx':
    case 'epub-to-pdf':
    case 'html-to-pdf':
    case 'markdown-to-pdf':
    case 'txt-to-pdf':
    case 'html-document':
    case 'markdown-document':
    case 'pptx-extract':
      return [result('converted.pdf', 'application/pdf', await officeTextToPdf(first))]
    case 'image-to-pdf':
      return [result('images.pdf', 'application/pdf', await conversion.imagesToPDF(images(files)))]
    case 'csv-to-xlsx':
      return [result('data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', await conversion.csvToXlsx(first))]
    case 'excel-split': {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(await buf(first), { type: 'array' })
      const parts = wb.SheetNames.map(name => {
        const next = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(next, wb.Sheets[name], name.slice(0, 31))
        return { name: `${name}.xlsx`, data: new Uint8Array(XLSX.write(next, { type: 'array', bookType: 'xlsx' })) }
      })
      return [result('sheets.zip', 'application/zip', await zipFiles(parts))]
    }
    case 'json-to-csv':
      return [result('data.csv', 'text/csv', await conversion.jsonToCsv(first))]
    case 'compress-images': {
      const quality = num(settings, 'quality', 0.7)
      const blobs = await Promise.all(images(files).map(f => imageService.compressImage(f, quality)))
      const zip = await zipFiles(blobs.map((b, i) => ({ name: images(files)[i].name, data: b })))
      return [result('compressed-images.zip', 'application/zip', zip)]
    }
    case 'convert-images': {
      const format = str(settings, 'format', 'png') as 'png' | 'jpeg' | 'webp'
      const blobs = await Promise.all(images(files).map(f => imageService.convertImageFormat(f, { format })))
      const zip = await zipFiles(blobs.map((b, i) => ({ name: images(files)[i].name.replace(/\.[^.]+$/, `.${format}`), data: b })))
      return [result(`converted.${format === 'jpeg' ? 'jpg' : format}`, blobs[0].type, blobs.length === 1 ? blobs[0] : zip)]
    }
    case 'resize-images': {
      const blob = await imageService.resizeImage(images(files)[0], {
        width: num(settings, 'width', 800),
        height: num(settings, 'height', 0) || undefined,
        keepAspectRatio: bool(settings, 'keepAspect', true)
      })
      return [result('resized.png', blob.type, blob)]
    }
    case 'crop-images': {
      const blob = await imageService.cropImage(images(files)[0], {
        x: num(settings, 'x', 0),
        y: num(settings, 'y', 0),
        width: num(settings, 'width', 200),
        height: num(settings, 'height', 200)
      })
      return [result('cropped.png', blob.type, blob)]
    }
    case 'rotate-images': {
      const blob = await imageService.rotateImage(images(files)[0], num(settings, 'rotation', 90))
      return [result('rotated.png', blob.type, blob)]
    }
    case 'watermark-images': {
      const blob = await imageService.addWatermarkToImage(images(files)[0], {
        type: 'text',
        text: str(settings, 'watermark', 'PDFKit'),
        opacity: num(settings, 'opacity', 0.35),
        rotation: -25,
        position: 'center'
      })
      return [result('watermarked.png', blob.type, blob)]
    }
    case 'remove-background':
      return [result('transparent.png', 'image/png', await removeBackground(images(files)[0]))]
    case 'image-enhancement': {
      const blob = await imageService.compressImage(images(files)[0], 0.95)
      return [result('enhanced.jpg', blob.type, blob)]
    }
    case 'passport-photo': {
      const blob = await imageService.resizeImage(images(files)[0], { width: 413, height: 531, keepAspectRatio: false })
      return [result('passport.png', blob.type, blob)]
    }
    case 'batch-image': {
      const blobs = await Promise.all(images(files).map(f => imageService.compressImage(f, 0.8)))
      return [result('batch.zip', 'application/zip', await zipFiles(blobs.map((b, i) => ({ name: images(files)[i].name, data: b }))))]
    }
    case 'sign-pdf':
    case 'multi-signature':
    case 'initials-stamp':
    case 'signature-request':
    case 'date-signed':
    case 'signature-templates': {
      const pdf = pdfs(files)[0]
      const sigFile = images(files)[0]
      if (!pdf || !sigFile) throw new Error('Upload a PDF and a signature image (PNG recommended)')
      const signature = await signatureService.createSignatureFromImage(sigFile)
      const signed = await signatureService.placeSignatureOnPDF(pdf, signature, {
        pageIndex: Math.max(0, num(settings, 'page', 1) - 1),
        x: num(settings, 'x', 0.65),
        y: num(settings, 'y', 0.82),
        width: num(settings, 'width', 0.28),
        height: num(settings, 'height', 0.1)
      })
      return [result('signed.pdf', 'application/pdf', signed)]
    }
    case 'signature-certificate': {
      const text = first ? await extractPdfText(await buf(first)) : ''
      return [await textFileResult('signature-certificate.txt', `Local signature certificate\nGenerated: ${new Date().toISOString()}\nSource: ${first?.name}\nCharacters: ${text.length}`)]
    }
    case 'document-templates':
      return [result('letter.pdf', 'application/pdf', await conversion.textToPDF(str(settings, 'text', 'Dear recipient,\n\nThis letter was generated locally in PDFKit.\n\nSincerely,')))]
    case 'invoice-generator':
    case 'gst-invoice':
    case 'receipt-generator':
    case 'thermal-receipt':
    case 'purchase-order':
    case 'quote-generator':
    case 'business-letter':
      return [result(`${toolId}.pdf`, 'application/pdf', await invoiceService.generateInvoice(defaultInvoice(settings)))]
    case 'chat-with-pdf':
    case 'summarize-pdf':
    case 'resume-analysis':
    case 'contract-analysis':
    case 'flashcard-generator':
    case 'translate-pdf': {
      const text = /\.pdf$/i.test(first.name) ? await extractPdfText(await buf(first)) : await readText(first)
      if (toolId === 'summarize-pdf') return [await textFileResult('summary.txt', summarizeText(text))]
      if (toolId === 'flashcard-generator') {
        const cards = text.split(/(?<=[.!?])\s+/).slice(0, 20).map((s, i) => `Q${i + 1}: What is discussed here?\nA${i + 1}: ${s}`).join('\n\n')
        return [await textFileResult('flashcards.txt', cards)]
      }
      if (toolId === 'translate-pdf') {
        return [await textFileResult('extracted-for-translation.txt', `Target language: ${str(settings, 'language', 'es')}\n\n${text}`)]
      }
      const kind = toolId === 'resume-analysis' ? 'resume' : toolId === 'chat-with-pdf' ? 'chat' : 'contract'
      return [await textFileResult(`${toolId}.txt`, analyzeDocument(text, kind, str(settings, 'question')))]
    }
    default:
      throw new Error(`No processor is registered for ${toolId}`)
  }
}
