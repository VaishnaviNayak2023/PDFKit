import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/HomePage.vue')
        },
        {
          path: 'tools',
          name: 'tools',
          component: () => import('@/pages/AllToolsPage.vue')
        },
        {
          path: 'workspace',
          name: 'workspace',
          component: () => import('@/pages/WorkspacePage.vue')
        },
        {
          path: 'privacy',
          name: 'privacy',
          component: () => import('@/pages/PrivacyPage.vue')
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/pages/AboutPage.vue')
        },
        {
          path: 'pricing',
          name: 'pricing',
          component: () => import('@/pages/PricingPage.vue')
        },
        {
          path: 'faq',
          name: 'faq',
          component: () => import('@/pages/FAQPage.vue')
        },
        {
          path: 'tools/merge-pdf',
          name: 'merge-pdf',
          component: () => import('@/pages/tool-pages/MergePDFPage.vue')
        },
        // PDF Essentials
        {
          path: 'tools/pdf/split-pdf',
          name: 'split-pdf',
          component: () => import('@/pages/tool-pages/SplitPDFPage.vue')
        },
        {
          path: 'tools/pdf/compress-pdf',
          name: 'compress-pdf',
          component: () => import('@/pages/tool-pages/CompressPDFPage.vue')
        },
        {
          path: 'tools/pdf/rotate-pages',
          name: 'rotate-pages',
          component: () => import('@/pages/tool-pages/RotatePagesPage.vue')
        },
        {
          path: 'tools/pdf/repair-pdf',
          name: 'repair-pdf',
          component: () => import('@/pages/tool-pages/RepairPDFPage.vue')
        },
        {
          path: 'tools/pdf/compare-pdf',
          name: 'compare-pdf',
          component: () => import('@/pages/tool-pages/ComparePDFPage.vue')
        },
        {
          path: 'tools/pdf/create-pdf',
          name: 'create-pdf',
          component: () => import('@/pages/tool-pages/CreatePDFPage.vue')
        },
        // PDF Organization
        {
          path: 'tools/pdf/organize-pdf',
          name: 'organize-pdf',
          component: () => import('@/pages/tool-pages/OrganizePDFPage.vue')
        },
        {
          path: 'tools/pdf/reorder-pages',
          name: 'reorder-pages',
          component: () => import('@/pages/tool-pages/ReorderPagesPage.vue')
        },
        {
          path: 'tools/pdf/delete-pages',
          name: 'delete-pages',
          component: () => import('@/pages/tool-pages/DeletePagesPage.vue')
        },
        {
          path: 'tools/pdf/extract-pages',
          name: 'extract-pages',
          component: () => import('@/pages/tool-pages/ExtractPagesPage.vue')
        },
        // PDF Editing
        {
          path: 'tools/edit/watermark-pdf',
          name: 'watermark-pdf',
          component: () => import('@/pages/tool-pages/WatermarkPDFPage.vue')
        },
        {
          path: 'tools/edit/add-page-numbers',
          name: 'add-page-numbers',
          component: () => import('@/pages/tool-pages/AddPageNumbersPage.vue')
        },
        {
          path: 'tools/edit/metadata-editor',
          name: 'metadata-editor',
          component: () => import('@/pages/tool-pages/MetadataEditorPage.vue')
        },
        // Security
        {
          path: 'tools/security/protect-pdf',
          name: 'protect-pdf',
          component: () => import('@/pages/tool-pages/ProtectPDFPage.vue')
        },
        {
          path: 'tools/security/unlock-pdf',
          name: 'unlock-pdf',
          component: () => import('@/pages/tool-pages/UnlockPDFPage.vue')
        },
        {
          path: 'tools/security/redact-pdf',
          name: 'redact-pdf',
          component: () => import('@/pages/tool-pages/RedactPDFPage.vue')
        },
        {
          path: 'tools/security/metadata-cleaner',
          name: 'metadata-cleaner',
          component: () => import('@/pages/tool-pages/MetadataCleanerPage.vue')
        },
        // OCR
        {
          path: 'tools/ocr/ocr-pdf',
          name: 'ocr-pdf',
          component: () => import('@/pages/tool-pages/OCRPDFPage.vue')
        },
        {
          path: 'tools/ocr/ocr-images',
          name: 'ocr-images',
          component: () => import('@/pages/tool-pages/OCRImagesPage.vue')
        },
        {
          path: 'tools/ocr/searchable-pdf',
          name: 'searchable-pdf',
          component: () => import('@/pages/tool-pages/SearchablePDFPage.vue')
        },
        {
          path: 'tools/ocr/batch-ocr',
          name: 'batch-ocr',
          component: () => import('@/pages/tool-pages/BatchOCRPage.vue')
        },
        {
          path: 'tools/ocr/text-extraction',
          name: 'text-extraction',
          component: () => import('@/pages/tool-pages/TextExtractionPage.vue')
        },
        // Conversion
        {
          path: 'tools/convert/pdf-to-word',
          name: 'pdf-to-word',
          component: () => import('@/pages/tool-pages/PDFToWordPage.vue')
        },
        {
          path: 'tools/convert/pdf-to-excel',
          name: 'pdf-to-excel',
          component: () => import('@/pages/tool-pages/PDFToExcelPage.vue')
        },
        {
          path: 'tools/convert/pdf-to-jpg',
          name: 'pdf-to-jpg',
          component: () => import('@/pages/tool-pages/PDFToJPGPage.vue')
        },
        {
          path: 'tools/convert/pdf-to-png',
          name: 'pdf-to-png',
          component: () => import('@/pages/tool-pages/PDFToPNGPage.vue')
        },
        {
          path: 'tools/convert/word-to-pdf',
          name: 'word-to-pdf',
          component: () => import('@/pages/tool-pages/WordToPDFPage.vue')
        },
        {
          path: 'tools/convert/image-to-pdf',
          name: 'image-to-pdf',
          component: () => import('@/pages/tool-pages/ImageToPDFPage.vue')
        },
        {
          path: 'tools/convert/markdown-to-pdf',
          name: 'markdown-to-pdf',
          component: () => import('@/pages/tool-pages/MarkdownToPDFPage.vue')
        },
        {
          path: 'tools/convert/txt-to-pdf',
          name: 'txt-to-pdf',
          component: () => import('@/pages/tool-pages/TXTToPDFPage.vue')
        },
        {
          path: 'tools/convert/html-to-pdf',
          name: 'html-to-pdf',
          component: () => import('@/pages/tool-pages/HTMLToPDFPage.vue')
        },
        {
          path: 'tools/convert/pdf-to-txt',
          name: 'pdf-to-txt',
          component: () => import('@/pages/tool-pages/PDFToTXTPage.vue')
        },
        // Image
        {
          path: 'tools/image/compress-images',
          name: 'compress-images',
          component: () => import('@/pages/tool-pages/CompressImagesPage.vue')
        },
        {
          path: 'tools/image/convert-images',
          name: 'convert-images',
          component: () => import('@/pages/tool-pages/ConvertImagesPage.vue')
        },
        {
          path: 'tools/image/resize-images',
          name: 'resize-images',
          component: () => import('@/pages/tool-pages/ResizeImagesPage.vue')
        },
        // Signature
        {
          path: 'tools/signature/sign-pdf',
          name: 'sign-pdf',
          component: () => import('@/pages/tool-pages/SignPDFPage.vue')
        },
        // Document
        {
          path: 'tools/document/epub-generator',
          name: 'epub-generator',
          component: () => import('@/pages/tool-pages/EPUBGeneratorPage.vue')
        },
        {
          path: 'tools/document/combine-word',
          name: 'combine-word',
          component: () => import('@/pages/tool-pages/CombineWordPage.vue')
        },
        {
          path: 'tools/document/split-excel',
          name: 'split-excel',
          component: () => import('@/pages/tool-pages/SplitExcelPage.vue')
        },
        {
          path: 'tools/document/extract-powerpoint',
          name: 'extract-powerpoint',
          component: () => import('@/pages/tool-pages/ExtractPowerPointPage.vue')
        },
        {
          path: 'tools/document/html-document',
          name: 'html-document',
          component: () => import('@/pages/tool-pages/HTMLDocumentPage.vue')
        },
        {
          path: 'tools/document/markdown-document',
          name: 'markdown-document',
          component: () => import('@/pages/tool-pages/MarkdownDocumentPage.vue')
        },
        {
          path: 'tools/document/odt-to-word',
          name: 'odt-to-word',
          component: () => import('@/pages/tool-pages/ODTToWordPage.vue')
        },
        {
          path: 'tools/document/document-templates',
          name: 'document-templates',
          component: () => import('@/pages/tool-pages/DocumentTemplatesPage.vue')
        },
        // Business
        {
          path: 'tools/business/invoice-generator',
          name: 'invoice-generator',
          component: () => import('@/pages/tool-pages/InvoiceGeneratorPage.vue')
        },
        {
          path: 'tools/business/gst-invoice',
          name: 'gst-invoice',
          component: () => import('@/pages/tool-pages/GSTInvoicePage.vue')
        },
        {
          path: 'tools/business/receipt-generator',
          name: 'receipt-generator',
          component: () => import('@/pages/tool-pages/ReceiptGeneratorPage.vue')
        },
        {
          path: 'tools/business/thermal-receipt',
          name: 'thermal-receipt',
          component: () => import('@/pages/tool-pages/ThermalReceiptPage.vue')
        },
        {
          path: 'tools/business/purchase-order',
          name: 'purchase-order',
          component: () => import('@/pages/tool-pages/PurchaseOrderPage.vue')
        },
        {
          path: 'tools/business/quote-generator',
          name: 'quote-generator',
          component: () => import('@/pages/tool-pages/QuoteGeneratorPage.vue')
        },
        {
          path: 'tools/business/business-letter',
          name: 'business-letter',
          component: () => import('@/pages/tool-pages/BusinessLetterPage.vue')
        },
        // AI
        {
          path: 'tools/ai/chat-with-pdf',
          name: 'chat-with-pdf',
          component: () => import('@/pages/tool-pages/ChatWithPDFPage.vue')
        },
        {
          path: 'tools/ai/summarize-pdf',
          name: 'summarize-pdf',
          component: () => import('@/pages/tool-pages/SummarizePDFPage.vue')
        },
        {
          path: 'tools/ai/resume-analysis',
          name: 'resume-analysis',
          component: () => import('@/pages/tool-pages/ResumeAnalysisPage.vue')
        },
        {
          path: 'tools/ai/contract-analysis',
          name: 'contract-analysis',
          component: () => import('@/pages/tool-pages/ContractAnalysisPage.vue')
        },
        {
          path: 'tools/ai/flashcard-generator',
          name: 'flashcard-generator',
          component: () => import('@/pages/tool-pages/FlashcardGeneratorPage.vue')
        },
        {
          path: 'tools/ai/translate-pdf',
          name: 'translate-pdf',
          component: () => import('@/pages/tool-pages/TranslatePDFPage.vue')
        }
      ]
    }
  ]
})

export default router
