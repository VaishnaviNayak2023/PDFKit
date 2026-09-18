import { OCRService } from '../services/ocr/ocrService'

export interface OCRWorkerMessage {
  type: 'recognize-image' | 'recognize-pdf' | 'batch-recognize' | 'get-languages' | 'download-language' | 'create-searchable-pdf'
  id: string
  data: any
}

export interface OCRWorkerResponse {
  id: string
  type: string
  success: boolean
  result?: any
  error?: string
}

self.onmessage = async (event: MessageEvent<OCRWorkerMessage>) => {
  const { type, id, data } = event.data

  try {
    let result: any

    switch (type) {
      case 'recognize-image':
        result = await OCRService.recognizeImage(data.file, data.options)
        break

      case 'recognize-pdf':
        result = await OCRService.recognizePDF(data.file, data.options)
        break

      case 'batch-recognize':
        result = await OCRService.batchRecognize(data.files, data.options)
        break

      case 'get-languages':
        result = await OCRService.getLanguages()
        break

      case 'download-language':
        await OCRService.downloadLanguageData(data.language)
        result = { success: true }
        break

      case 'create-searchable-pdf':
        result = await OCRService.createSearchablePDF(data.file, data.options)
        break

      default:
        throw new Error(`Unknown worker type: ${type}`)
    }

    const response: OCRWorkerResponse = {
      id,
      type,
      success: true,
      result
    }

    self.postMessage(response)
  } catch (error) {
    const response: OCRWorkerResponse = {
      id,
      type,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    self.postMessage(response)
  }
}

export type OCRWorker = typeof self
