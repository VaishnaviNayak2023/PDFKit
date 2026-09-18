import { PDFDocument, StandardFonts, rgb, degrees, PageSizes, type PDFPage } from 'pdf-lib'
import { extractPdfText, loadPdfDocument, renderPageToJpeg } from '@/utils/pdfjs'

export function parsePageRanges(input: string, pageCount: number): number[] {
  const pages = new Set<number>()
  const parts = input.split(',').map(p => p.trim()).filter(Boolean)
  if (!parts.length) return Array.from({ length: pageCount }, (_, i) => i)
  for (const part of parts) {
    const range = part.split('-').map(n => Number(n.trim()))
    if (range.length === 1 && Number.isInteger(range[0])) {
      const idx = range[0] - 1
      if (idx >= 0 && idx < pageCount) pages.add(idx)
    } else if (range.length === 2 && range.every(Number.isInteger)) {
      const start = Math.max(1, range[0])
      const end = Math.min(pageCount, range[1])
      for (let p = start; p <= end; p++) pages.add(p - 1)
    }
  }
  return [...pages].sort((a, b) => a - b)
}

export async function loadPdf(bytes: ArrayBuffer | Uint8Array, password?: string) {
  return PDFDocument.load(bytes, {
    ignoreEncryption: !password,
    ...(password ? { password } : {})
  } as Parameters<typeof PDFDocument.load>[1])
}

async function copyPagesTo(dest: PDFDocument, source: PDFDocument, indices: number[]) {
  const copied = await dest.copyPages(source, indices)
  copied.forEach(page => dest.addPage(page))
}

export async function mergePdfs(files: ArrayBuffer[]): Promise<Uint8Array> {
  if (files.length < 1) throw new Error('Select at least one PDF')
  const out = await PDFDocument.create()
  for (const file of files) {
    const src = await loadPdf(file)
    await copyPagesTo(out, src, src.getPageIndices())
  }
  return out.save()
}

export async function splitPdf(
  file: ArrayBuffer,
  mode: 'every' | 'ranges',
  ranges: string
): Promise<Uint8Array[]> {
  const src = await loadPdf(file)
  const count = src.getPageCount()
  const groups: number[][] = []
  if (mode === 'every') {
    for (let i = 0; i < count; i++) groups.push([i])
  } else {
    const parts = ranges.split(';').map(p => p.trim()).filter(Boolean)
    const chunks = parts.length ? parts : [ranges || `1-${count}`]
    for (const chunk of chunks) {
      const pages = parsePageRanges(chunk, count)
      if (pages.length) groups.push(pages)
    }
  }
  const outputs: Uint8Array[] = []
  for (const indices of groups) {
    const doc = await PDFDocument.create()
    await copyPagesTo(doc, src, indices)
    outputs.push(await doc.save())
  }
  return outputs
}

export async function extractPages(file: ArrayBuffer, ranges: string): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const pages = parsePageRanges(ranges, src.getPageCount())
  if (!pages.length) throw new Error('No valid pages selected')
  const doc = await PDFDocument.create()
  await copyPagesTo(doc, src, pages)
  return doc.save()
}

export async function deletePages(file: ArrayBuffer, ranges: string): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const remove = new Set(parsePageRanges(ranges, src.getPageCount()))
  const keep = src.getPageIndices().filter(i => !remove.has(i))
  if (!keep.length) throw new Error('Cannot delete every page')
  const doc = await PDFDocument.create()
  await copyPagesTo(doc, src, keep)
  return doc.save()
}

export async function reorderPages(file: ArrayBuffer, order: string): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const pages = parsePageRanges(order, src.getPageCount())
  if (pages.length !== src.getPageCount()) {
    throw new Error('Reorder list must include every page exactly once, e.g. 3,1,2,4')
  }
  const doc = await PDFDocument.create()
  await copyPagesTo(doc, src, pages)
  return doc.save()
}

export async function reversePages(file: ArrayBuffer): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const doc = await PDFDocument.create()
  await copyPagesTo(doc, src, [...src.getPageIndices()].reverse())
  return doc.save()
}

export async function duplicatePages(file: ArrayBuffer, ranges: string): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const extra = parsePageRanges(ranges || '1', src.getPageCount())
  const doc = await PDFDocument.create()
  await copyPagesTo(doc, src, src.getPageIndices())
  await copyPagesTo(doc, src, extra)
  return doc.save()
}

export async function rotatePdf(file: ArrayBuffer, angle: number, ranges: string): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const targets = ranges ? parsePageRanges(ranges, src.getPageCount()) : src.getPageIndices()
  const safe = ((angle % 360) + 360) % 360 as 0 | 90 | 180 | 270
  for (const i of targets) {
    const page = src.getPage(i)
    const current = page.getRotation().angle
    page.setRotation(degrees((current + safe) % 360))
  }
  return src.save()
}

export async function insertBlankPages(file: ArrayBuffer, afterPage: number, count: number): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const insertAt = Math.max(0, Math.min(src.getPageCount(), afterPage))
  const size = src.getPage(0)?.getSize() ?? { width: 595, height: 842 }
  for (let i = 0; i < count; i++) {
    src.insertPage(insertAt + i, [size.width, size.height])
  }
  return src.save()
}

export async function replacePages(base: ArrayBuffer, replacement: ArrayBuffer, ranges: string): Promise<Uint8Array> {
  const src = await loadPdf(base)
  const other = await loadPdf(replacement)
  const targets = parsePageRanges(ranges, src.getPageCount())
  const doc = await PDFDocument.create()
  let replacementIndex = 0
  for (let i = 0; i < src.getPageCount(); i++) {
    if (targets.includes(i) && replacementIndex < other.getPageCount()) {
      const [page] = await doc.copyPages(other, [replacementIndex])
      doc.addPage(page)
      replacementIndex++
    } else {
      const [page] = await doc.copyPages(src, [i])
      doc.addPage(page)
    }
  }
  return doc.save()
}

export async function mixPdfs(first: ArrayBuffer, second: ArrayBuffer): Promise<Uint8Array> {
  const a = await loadPdf(first)
  const b = await loadPdf(second)
  const doc = await PDFDocument.create()
  const max = Math.max(a.getPageCount(), b.getPageCount())
  for (let i = 0; i < max; i++) {
    if (i < a.getPageCount()) {
      const [page] = await doc.copyPages(a, [i])
      doc.addPage(page)
    }
    if (i < b.getPageCount()) {
      const [page] = await doc.copyPages(b, [i])
      doc.addPage(page)
    }
  }
  return doc.save()
}

export async function overlayPdfs(base: ArrayBuffer, overlay: ArrayBuffer, opacity = 0.4): Promise<Uint8Array> {
  const src = await loadPdf(base)
  const stamp = await loadPdf(overlay)
  const embedded = await src.embedPage(stamp.getPage(0))
  for (const page of src.getPages()) {
    const { width, height } = page.getSize()
    page.drawPage(embedded, { x: 0, y: 0, width, height, opacity })
  }
  return src.save()
}

export async function addBackgroundImage(file: ArrayBuffer, image: ArrayBuffer, mime: string, opacity = 0.2): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const img = mime.includes('png')
    ? await src.embedPng(image)
    : await src.embedJpg(image)
  for (const page of src.getPages()) {
    const { width, height } = page.getSize()
    page.drawImage(img, { x: 0, y: 0, width, height, opacity })
  }
  return src.save()
}

export async function compressPdf(file: ArrayBuffer, quality: 'low' | 'medium' | 'high'): Promise<Uint8Array> {
  const scale = quality === 'high' ? 1.1 : quality === 'medium' ? 0.85 : 0.6
  const jpegQ = quality === 'high' ? 0.82 : quality === 'medium' ? 0.62 : 0.42
  const src = await loadPdfDocument(file)
  const out = await PDFDocument.create()
  for (let i = 1; i <= src.numPages; i++) {
    const jpeg = await renderPageToJpeg(file, i, scale, jpegQ)
    const image = await out.embedJpg(jpeg)
    const page = out.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  }
  return out.save({ useObjectStreams: true })
}

export async function repairPdf(file: ArrayBuffer): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const out = await PDFDocument.create()
  await copyPagesTo(out, src, src.getPageIndices())
  out.setTitle(src.getTitle() ?? 'Repaired PDF')
  return out.save()
}

export async function flattenPdf(file: ArrayBuffer): Promise<Uint8Array> {
  const src = await loadPdf(file)
  try {
    src.getForm().flatten()
  } catch {
    /* no form */
  }
  return src.save()
}

export async function setMetadata(
  file: ArrayBuffer,
  meta: { title?: string; author?: string; subject?: string; keywords?: string }
): Promise<Uint8Array> {
  const src = await loadPdf(file)
  if (meta.title != null) src.setTitle(meta.title)
  if (meta.author != null) src.setAuthor(meta.author)
  if (meta.subject != null) src.setSubject(meta.subject)
  if (meta.keywords != null) src.setKeywords(meta.keywords.split(',').map(k => k.trim()))
  return src.save()
}

export async function clearMetadata(file: ArrayBuffer): Promise<Uint8Array> {
  const src = await loadPdf(file)
  src.setTitle('')
  src.setAuthor('')
  src.setSubject('')
  src.setKeywords([])
  src.setCreator('PDFKit')
  src.setProducer('PDFKit')
  return src.save()
}

export async function addWatermark(
  file: ArrayBuffer,
  text: string,
  opacity = 0.18,
  fontSize = 48
): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const font = await src.embedFont(StandardFonts.HelveticaBold)
  for (const page of src.getPages()) {
    const { width, height } = page.getSize()
    page.drawText(text, {
      x: width / 2 - font.widthOfTextAtSize(text, fontSize) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.45),
      opacity,
      rotate: degrees(35)
    })
  }
  return src.save()
}

export async function addPageNumbers(
  file: ArrayBuffer,
  position: 'top' | 'bottom' = 'bottom'
): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const font = await src.embedFont(StandardFonts.Helvetica)
  const total = src.getPageCount()
  src.getPages().forEach((page, i) => {
    const { width, height } = page.getSize()
    const label = `${i + 1} / ${total}`
    page.drawText(label, {
      x: width / 2 - 16,
      y: position === 'top' ? height - 28 : 18,
      size: 10,
      font,
      color: rgb(0.25, 0.25, 0.25)
    })
  })
  return src.save()
}

export async function addHeaderFooter(
  file: ArrayBuffer,
  header: string,
  footer: string
): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const font = await src.embedFont(StandardFonts.Helvetica)
  for (const page of src.getPages()) {
    const { width, height } = page.getSize()
    if (header) page.drawText(header, { x: 36, y: height - 28, size: 10, font, color: rgb(0.3, 0.3, 0.3) })
    if (footer) page.drawText(footer, { x: 36, y: 18, size: 10, font, color: rgb(0.3, 0.3, 0.3) })
  }
  return src.save()
}

export async function addTextToPdf(
  file: ArrayBuffer,
  text: string,
  pageNumber: number,
  x: number,
  y: number,
  fontSize = 14
): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const font = await src.embedFont(StandardFonts.Helvetica)
  const page = src.getPage(Math.max(0, pageNumber - 1))
  page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) })
  return src.save()
}

export async function addImageToPdf(file: ArrayBuffer, image: ArrayBuffer, mime: string, pageNumber = 1): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const img = mime.includes('png') ? await src.embedPng(image) : await src.embedJpg(image)
  const page = src.getPage(Math.max(0, pageNumber - 1))
  const { width } = page.getSize()
  const scale = Math.min(1, (width * 0.4) / img.width)
  page.drawImage(img, { x: 40, y: 40, width: img.width * scale, height: img.height * scale })
  return src.save()
}

export async function highlightSearch(file: ArrayBuffer, query: string): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const pdf = await loadPdfDocument(file)
  const q = query.toLowerCase()
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1 })
    const pdfPage = src.getPage(i - 1)
    for (const item of content.items) {
      if (!('str' in item) || !item.str.toLowerCase().includes(q)) continue
      const tr = item.transform
      pdfPage.drawRectangle({
        x: tr[4],
        y: tr[5] - 2,
        width: Math.max(12, item.str.length * (item.height || 10) * 0.5),
        height: (item.height || 10) + 4,
        color: rgb(1, 0.92, 0.2),
        opacity: 0.35,
        borderWidth: 0
      })
    }
    void viewport
  }
  return src.save()
}

export async function redactSearch(file: ArrayBuffer, query: string): Promise<Uint8Array> {
  const src = await loadPdfDocument(file)
  const out = await PDFDocument.create()
  const q = query.toLowerCase()
  for (let i = 1; i <= src.numPages; i++) {
    const jpeg = await renderPageToJpeg(file, i, 1.4, 0.86)
    const image = await out.embedJpg(jpeg)
    const page = out.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
    const jsPage = await src.getPage(i)
    const content = await jsPage.getTextContent()
    const viewport = jsPage.getViewport({ scale: 1.4 })
    for (const item of content.items) {
      if (!('str' in item) || !item.str.toLowerCase().includes(q)) continue
      const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5])
      page.drawRectangle({
        x,
        y: page.getHeight() - y - 4,
        width: Math.max(20, item.str.length * 8),
        height: 16,
        color: rgb(0, 0, 0)
      })
    }
  }
  return out.save()
}

export async function createBlankPdf(pageCount = 1): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (let i = 0; i < pageCount; i++) doc.addPage(PageSizes.A4)
  return doc.save()
}

export async function createFormPdf(title: string, fields: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage(PageSizes.A4)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const form = doc.getForm()
  page.drawText(title || 'Form', { x: 50, y: 780, size: 18, font })
  fields.filter(Boolean).forEach((name, i) => {
    const y = 720 - i * 48
    page.drawText(name, { x: 50, y, size: 11, font })
    const field = form.createTextField(name.replace(/\s+/g, '_'))
    field.addToPage(page, { x: 50, y: y - 24, width: 480, height: 20 })
  })
  return doc.save()
}

export async function fillFormPdf(file: ArrayBuffer, values: Record<string, string>): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const form = src.getForm()
  for (const [key, value] of Object.entries(values)) {
    try {
      form.getTextField(key).setText(value)
    } catch {
      /* skip missing */
    }
  }
  return src.save()
}

export async function batesNumber(file: ArrayBuffer, prefix: string): Promise<Uint8Array> {
  const src = await loadPdf(file)
  const font = await src.embedFont(StandardFonts.Courier)
  src.getPages().forEach((page, i) => {
    const { width } = page.getSize()
    const label = `${prefix}${String(i + 1).padStart(6, '0')}`
    page.drawText(label, { x: width - 120, y: 16, size: 9, font, color: rgb(0.2, 0.2, 0.2) })
  })
  return src.save()
}

export async function scanPrivacy(file: ArrayBuffer): Promise<string> {
  const src = await loadPdf(file)
  const text = await extractPdfText(file)
  const findings: string[] = []
  const title = src.getTitle()
  const author = src.getAuthor()
  if (title) findings.push(`Title: ${title}`)
  if (author) findings.push(`Author: ${author}`)
  if (src.getSubject()) findings.push(`Subject: ${src.getSubject()}`)
  if (src.getKeywords()?.length) findings.push(`Keywords: ${src.getKeywords()?.join(', ')}`)
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []
  const phone = text.match(/\+?\d[\d\s()-]{7,}\d/g) ?? []
  if (email.length) findings.push(`Emails found: ${[...new Set(email)].join(', ')}`)
  if (phone.length) findings.push(`Phone-like numbers: ${[...new Set(phone)].slice(0, 8).join(', ')}`)
  try {
    const fields = src.getForm().getFields()
    if (fields.length) findings.push(`Interactive form fields: ${fields.length}`)
  } catch { /* none */ }
  if (!findings.length) findings.push('No obvious metadata or personal identifiers were detected.')
  return findings.join('\n')
}

export async function comparePdfs(a: ArrayBuffer, b: ArrayBuffer): Promise<string> {
  const textA = await extractPdfText(a)
  const textB = await extractPdfText(b)
  if (textA === textB) return 'The extracted text of both PDFs is identical.'
  return [
    'PDF comparison report (text extraction)',
    '',
    '--- Document A ---',
    textA.slice(0, 8000),
    '',
    '--- Document B ---',
    textB.slice(0, 8000)
  ].join('\n')
}

export async function pdfPageCount(file: ArrayBuffer): Promise<number> {
  const src = await loadPdf(file)
  return src.getPageCount()
}

export async function protectPdf(
  file: ArrayBuffer,
  userPassword: string,
  ownerPassword = '',
  allowPrinting = true,
  allowCopying = false
): Promise<Uint8Array> {
  if (!userPassword) throw new Error('Enter a password to protect this PDF')
  const { PDFDocument } = await import('@cantoo/pdf-lib')
  const doc = await PDFDocument.load(file)
  doc.encrypt({
    userPassword,
    ownerPassword: ownerPassword || userPassword,
    permissions: {
      printing: allowPrinting ? 'highResolution' : 'disable',
      copying: allowCopying,
      modifying: false,
      annotating: false,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false
    }
  })
  return doc.save()
}

export async function unlockPdf(file: ArrayBuffer, password: string): Promise<Uint8Array> {
  const { PDFDocument } = await import('@cantoo/pdf-lib')
  try {
    const doc = await PDFDocument.load(file, { password })
    return doc.save()
  } catch {
    const doc = await PDFDocument.load(file, { ignoreEncryption: true })
    return doc.save()
  }
}

export type { PDFPage }
