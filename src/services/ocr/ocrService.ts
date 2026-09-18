import Tesseract from 'tesseract.js'

export interface OCROptions {
  language?: string
  preserveInterwordSpaces?: boolean
  tesseractPath?: string
}

export interface OCRResult {
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    bbox: [number, number, number, number]
  }>
}

export class OCRService {
  /**
   * Perform OCR on an image file
   */
  static async recognizeImage(file: File | ArrayBuffer, options: OCROptions = {}): Promise<OCRResult> {
    const {
      language = 'eng',
      preserveInterwordSpaces = false,
      tesseractPath
    } = options

    try {
      const result = await Tesseract.recognize(
        file,
        language,
        {
          preserve_interword_spaces: preserveInterwordSpaces,
          ...(tesseractPath && { tesseractPath })
        }
      )

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words.map((word: any) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        }))
      }
    } catch (error) {
      console.error('OCR recognition error:', error)
      throw new Error('Failed to perform OCR on image')
    }
  }

  /**
   * Perform OCR on a PDF file
   */
  static async recognizePDF(file: ArrayBuffer, options: OCROptions = {}): Promise<OCRResult[]> {
    const { language = 'eng' } = options

    try {
      // This would require converting PDF pages to images first
      // For now, we'll provide a placeholder implementation
      const result = await Tesseract.recognize(file, language)
      
      return [{
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words.map((word: any) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        }))
      }]
    } catch (error) {
      console.error('PDF OCR error:', error)
      throw new Error('Failed to perform OCR on PDF')
    }
  }

  /**
   * Perform batch OCR on multiple files
   */
  static async batchRecognize(files: (File | ArrayBuffer)[], options: OCROptions = {}): Promise<OCRResult[]> {
    const results: OCRResult[] = []

    for (const file of files) {
      try {
        const result = await this.recognizeImage(file, options)
        results.push(result)
      } catch (error) {
        console.error('Error processing file:', error)
        // Continue with other files even if one fails
      }
    }

    return results
  }

  /**
   * Get available OCR languages
   */
  static async getLanguages(): Promise<string[]> {
    try {
      const languages = await Tesseract.getLanguages()
      return languages
    } catch (error) {
      console.error('Error getting languages:', error)
      return ['eng', 'spa', 'fra', 'deu', 'ita', 'por'] // Default fallback
    }
  }

  /**
   * Download OCR language data for offline use
   */
  static async downloadLanguageData(language: string): Promise<void> {
    try {
      await Tesseract.loadLanguage(language)
    } catch (error) {
      console.error('Error downloading language data:', error)
      throw new Error(`Failed to download language data for ${language}`)
    }
  }

  /**
   * Create a searchable PDF from an image
   */
  static async createSearchablePDF(imageFile: File | ArrayBuffer, options: OCROptions = {}): Promise<ArrayBuffer> {
    try {
      // This would require combining OCR with PDF creation
      // For now, return the original file as a placeholder
      if (imageFile instanceof ArrayBuffer) {
        return imageFile
      }
      
      const arrayBuffer = await imageFile.arrayBuffer()
      return arrayBuffer
    } catch (error) {
      console.error('Error creating searchable PDF:', error)
      throw new Error('Failed to create searchable PDF')
    }
  }
}
