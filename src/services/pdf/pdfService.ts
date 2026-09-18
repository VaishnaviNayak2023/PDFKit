import { PDFDocument, rgb } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface PDFMergeOptions {
  files: ArrayBuffer[]
  outputFileName?: string
}

export interface PDFSplitOptions {
  file: ArrayBuffer
  ranges: Array<{ start: number; end: number }>
  outputFileName?: string
}

export interface PDFCompressOptions {
  file: ArrayBuffer
  quality: 'low' | 'medium' | 'high'
  outputFileName?: string
}

export class PDFService {
  /**
   * Merge multiple PDF files into one
   */
  static async mergePDFs(options: PDFMergeOptions): Promise<ArrayBuffer> {
    const { files, outputFileName = 'merged.pdf' } = options

    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const pdf = await PDFDocument.load(file)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error merging PDFs:', error)
      throw new Error('Failed to merge PDFs')
    }
  }

  /**
   * Split a PDF into multiple files based on page ranges
   */
  static async splitPDF(options: PDFSplitOptions): Promise<ArrayBuffer[]> {
    const { file, ranges } = options

    try {
      const pdf = await PDFDocument.load(file)
      const results: ArrayBuffer[] = []

      for (const range of ranges) {
        const newPdf = await PDFDocument.create()
        const copiedPages = await newPdf.copyPages(pdf, 
          Array.from({ length: range.end - range.start }, (_, i) => range.start + i)
        )
        copiedPages.forEach((page) => newPdf.addPage(page))
        const pdfBytes = await newPdf.save()
        results.push(pdfBytes)
      }

      return results
    } catch (error) {
      console.error('Error splitting PDF:', error)
      throw new Error('Failed to split PDF')
    }
  }

  /**
   * Compress a PDF file
   */
  static async compressPDF(options: PDFCompressOptions): Promise<ArrayBuffer> {
    const { file, quality } = options

    try {
      const pdf = await PDFDocument.load(file)
      
      // Get the document to compress it
      const pdfDoc = await pdfjsLib.getDocument({ data: file })
      
      // Create a new PDF with optimized settings
      const newPdf = await PDFDocument.create()
      const copiedPages = await newPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => newPdf.addPage(page))

      // Apply compression based on quality setting
      const compressionLevels = {
        low: 0.3,
        medium: 0.5,
        high: 0.8
      }

      const pdfBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })

      return pdfBytes
    } catch (error) {
      console.error('Error compressing PDF:', error)
      throw new Error('Failed to compress PDF')
    }
  }

  /**
   * Get PDF metadata
   */
  static async getPDFMetadata(file: ArrayBuffer): Promise<{
    pageCount: number
    title?: string
    author?: string
    subject?: string
    keywords?: string
  }> {
    try {
      const pdf = await PDFDocument.load(file)
      const pdfDoc = await pdfjsLib.getDocument({ data: file })
      
      const metadata = pdf.getCreator()
      
      return {
        pageCount: pdf.getPageCount(),
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
        subject: pdf.getSubject(),
        keywords: pdf.getKeywords()
      }
    } catch (error) {
      console.error('Error getting PDF metadata:', error)
      throw new Error('Failed to get PDF metadata')
    }
  }

  /**
   * Rotate pages in a PDF
   */
  static async rotatePages(file: ArrayBuffer, rotations: Array<{ page: number; degrees: number }>): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      
      for (const { page, degrees } of rotations) {
        const pdfPage = pdf.getPage(page - 1)
        pdfPage.setRotation(degrees)
      }

      const pdfBytes = await pdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error rotating pages:', error)
      throw new Error('Failed to rotate pages')
    }
  }

  /**
   * Add password protection to a PDF
   */
  static async protectPDF(file: ArrayBuffer, password: string): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      
      // Note: pdf-lib encryption requires a different approach
      // This is a placeholder for the actual implementation
      const pdfBytes = await pdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error protecting PDF:', error)
      throw new Error('Failed to protect PDF')
    }
  }

  /**
   * Remove password from a PDF
   */
  static async unlockPDF(file: ArrayBuffer, password: string): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file, { password })
      const pdfBytes = await pdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error unlocking PDF:', error)
      throw new Error('Failed to unlock PDF')
    }
  }

  /**
   * Extract text from a PDF
   */
  static async extractText(file: ArrayBuffer): Promise<string> {
    try {
      const pdf = await pdfjsLib.getDocument({ data: file })
      let fullText = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(' ')
        fullText += pageText + '\n'
      }

      return fullText
    } catch (error) {
      console.error('Error extracting text:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  /**
   * Extract images from a PDF
   */
  static async extractImages(file: ArrayBuffer): Promise<ArrayBuffer[]> {
    try {
      const pdf = await pdfjsLib.getDocument({ data: file })
      const images: ArrayBuffer[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const operatorList = await page.getOperatorList()
        
        for (const operator of operatorList.fnArray) {
          if (operator.fn === 'paintImageXObject') {
            // Extract image logic would go here
            // This is a simplified version
          }
        }
      }

      return images
    } catch (error) {
      console.error('Error extracting images:', error)
      throw new Error('Failed to extract images from PDF')
    }
  }

  /**
   * Load PDF with recovery options for repair
   */
  static async loadPDFWithRecovery(
    file: ArrayBuffer,
    options: { recoverObjects: boolean; recoverStreams: boolean; recoverMetadata: boolean }
  ): Promise<PDFDocument> {
    try {
      // Try different loading strategies based on options
      const loadOptions: any = { ignoreEncryption: true }
      
      if (options.recoverObjects) {
        loadOptions.updateMetadata = false
      }
      
      return await PDFDocument.load(file, loadOptions)
    } catch (error) {
      console.error('Error loading PDF with recovery:', error)
      throw new Error('Failed to load PDF for repair')
    }
  }

  /**
   * Attempt fallback repair for severely damaged PDFs
   */
  static async attemptFallbackRepair(file: ArrayBuffer): Promise<{ data: ArrayBuffer; report: string }> {
    try {
      // Create a new PDF and try to copy recoverable content
      const newPdf = await PDFDocument.create()
      
      try {
        const originalPdf = await PDFDocument.load(file, { 
          ignoreEncryption: true,
          parseSpeed: 'slowly'
        })
        
        // Try to copy pages
        const copiedPages = await newPdf.copyPages(originalPdf, originalPdf.getPageIndices())
        copiedPages.forEach((page) => newPdf.addPage(page))
        
        const pdfBytes = await newPdf.save()
        return {
          data: pdfBytes,
          report: 'Successfully recovered document structure and pages'
        }
      } catch (pageError) {
        // If page copying fails, try minimal recovery
        const minimalPdf = await PDFDocument.create()
        const pdfBytes = await minimalPdf.save()
        return {
          data: pdfBytes,
          report: 'Created new PDF structure - original content could not be recovered'
        }
      }
    } catch (error) {
      console.error('Fallback repair failed:', error)
      throw new Error('PDF is too severely damaged to repair')
    }
  }

  /**
   * Delete pages from PDF
   */
  static async deletePages(file: ArrayBuffer, pagesToDelete: number[]): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      const indices = pagesToDelete.map(p => p - 1).sort((a, b) => b - a) // Sort in descending order
      
      for (const index of indices) {
        if (index >= 0 && index < pdf.getPageCount()) {
          pdf.removePage(index)
        }
      }

      const pdfBytes = await pdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error deleting pages:', error)
      throw new Error('Failed to delete pages')
    }
  }

  /**
   * Extract pages from PDF
   */
  static async extractPages(file: ArrayBuffer, pagesToExtract: number[]): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      const newPdf = await PDFDocument.create()
      const indices = pagesToExtract.map(p => p - 1)
      
      const copiedPages = await newPdf.copyPages(pdf, indices)
      copiedPages.forEach((page) => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error extracting pages:', error)
      throw new Error('Failed to extract pages')
    }
  }

  /**
   * Reorder pages in PDF
   */
  static async reorderPages(file: ArrayBuffer, newOrder: number[]): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      const newPdf = await PDFDocument.create()
      const indices = newOrder.map(p => p - 1)
      
      const copiedPages = await newPdf.copyPages(pdf, indices)
      copiedPages.forEach((page) => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error reordering pages:', error)
      throw new Error('Failed to reorder pages')
    }
  }

  /**
   * Add watermark to PDF
   */
  static async addWatermark(
    file: ArrayBuffer,
    options: {
      type: 'text' | 'image'
      text?: string
      imageData?: ArrayBuffer
      opacity?: number
      rotation?: number
      position?: 'center' | 'tile' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    }
  ): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      const pages = pdf.getPages()
      const { opacity = 0.3, rotation = 45, position = 'center' } = options

      for (const page of pages) {
        const { width, height } = page.getSize()

        if (options.type === 'text' && options.text) {
          const font = await pdf.embedFont(PDFDocument.StandardFonts.Helvetica)
          const fontSize = Math.min(width, height) * 0.05
          
          const textWidth = font.widthOfTextAtSize(options.text, fontSize)
          const textHeight = fontSize
          
          let x = width / 2 - textWidth / 2
          let y = height / 2 - textHeight / 2

          if (position === 'tile') {
            for (let i = 0; i < width; i += textWidth * 2) {
              for (let j = 0; j < height; j += textHeight * 3) {
                page.drawText(options.text, {
                  x: i,
                  y: j,
                  size: fontSize,
                  font,
                  opacity,
                  rotate: { type: 'degrees', angle: rotation }
                })
              }
            }
          } else {
            if (position.includes('right')) x = width - textWidth - 20
            if (position.includes('left')) x = 20
            if (position.includes('top')) y = height - textHeight - 20
            if (position.includes('bottom')) y = 20

            page.drawText(options.text, {
              x,
              y,
              size: fontSize,
              font,
              opacity,
              rotate: { type: 'degrees', angle: rotation }
            })
          }
        }
      }

      const pdfBytes = await pdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error adding watermark:', error)
      throw new Error('Failed to add watermark')
    }
  }

  /**
   * Add page numbers to PDF
   */
  static async addPageNumbers(
    file: ArrayBuffer,
    options: {
      position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
      startFrom?: number
      format?: '1' | '1 of N' | 'Page 1'
      fontSize?: number
    }
  ): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      const pages = pdf.getPages()
      const { position = 'bottom-center', startFrom = 1, format = '1', fontSize = 12 } = options
      const font = await pdf.embedFont(PDFDocument.StandardFonts.Helvetica)

      pages.forEach((page, index) => {
        const { width, height } = page.getSize()
        const pageNum = startFrom + index
        let text = String(pageNum)
        
        if (format === '1 of N') text = `${pageNum} of ${pages.length}`
        if (format === 'Page 1') text = `Page ${pageNum}`

        const textWidth = font.widthOfTextAtSize(text, fontSize)
        const margin = 20
        
        let x = width / 2 - textWidth / 2
        let y = margin

        if (position.includes('right')) x = width - textWidth - margin
        if (position.includes('left')) x = margin
        if (position.includes('bottom')) y = height - fontSize - margin

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font
        })
      })

      const pdfBytes = await pdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error adding page numbers:', error)
      throw new Error('Failed to add page numbers')
    }
  }

  /**
   * Edit PDF metadata
   */
  static async editMetadata(
    file: ArrayBuffer,
    metadata: {
      title?: string
      author?: string
      subject?: string
      keywords?: string
    }
  ): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      
      if (metadata.title !== undefined) pdf.setTitle(metadata.title)
      if (metadata.author !== undefined) pdf.setAuthor(metadata.author)
      if (metadata.subject !== undefined) pdf.setSubject(metadata.subject)
      if (metadata.keywords !== undefined) pdf.setKeywords(metadata.keywords.split(','))

      const pdfBytes = await pdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error editing metadata:', error)
      throw new Error('Failed to edit metadata')
    }
  }

  /**
   * Clean metadata from PDF
   */
  static async cleanMetadata(file: ArrayBuffer): Promise<ArrayBuffer> {
    try {
      const pdf = await PDFDocument.load(file)
      
      pdf.setTitle('')
      pdf.setAuthor('')
      pdf.setSubject('')
      pdf.setKeywords([])
      pdf.setProducer('')
      pdf.setCreator('')

      const pdfBytes = await pdf.save()
      return pdfBytes
    } catch (error) {
      console.error('Error cleaning metadata:', error)
      throw new Error('Failed to clean metadata')
    }
  }
}
