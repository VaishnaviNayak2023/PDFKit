import { PDFService } from '../services/pdf/pdfService'

export interface PDFWorkerMessage {
  type: 'merge' | 'split' | 'compress' | 'rotate' | 'protect' | 'unlock' | 'extract-text' | 'extract-images'
  id: string
  data: any
}

export interface PDFWorkerResponse {
  id: string
  type: string
  success: boolean
  result?: any
  error?: string
}

self.onmessage = async (event: MessageEvent<PDFWorkerMessage>) => {
  const { type, id, data } = event.data

  try {
    let result: any

    switch (type) {
      case 'merge':
        result = await PDFService.mergePDFs(data)
        break

      case 'split':
        result = await PDFService.splitPDF(data)
        break

      case 'compress':
        result = await PDFService.compressPDF(data)
        break

      case 'rotate':
        result = await PDFService.rotatePages(data.file, data.rotations)
        break

      case 'protect':
        result = await PDFService.protectPDF(data.file, data.password)
        break

      case 'unlock':
        result = await PDFService.unlockPDF(data.file, data.password)
        break

      case 'extract-text':
        result = await PDFService.extractText(data.file)
        break

      case 'extract-images':
        result = await PDFService.extractImages(data.file)
        break

      default:
        throw new Error(`Unknown worker type: ${type}`)
    }

    const response: PDFWorkerResponse = {
      id,
      type,
      success: true,
      result
    }

    self.postMessage(response)
  } catch (error) {
    const response: PDFWorkerResponse = {
      id,
      type,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    self.postMessage(response)
  }
}

export type PDFWorker = typeof self
