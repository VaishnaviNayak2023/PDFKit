// ─── Tool Types ────────────────────────────────────────────────────────────────

export type ToolCategory =
  | 'pdf'
  | 'convert'
  | 'edit'
  | 'security'
  | 'ocr'
  | 'image'
  | 'signature'
  | 'document'
  | 'business'
  | 'ai'

export interface Tool {
  id: string
  name: string
  description: string
  longDescription?: string
  category: ToolCategory
  icon: string // material icon name
  color: string // hex color for icon background
  route: string
  tags: string[]
  isNew?: boolean
  isPopular?: boolean
  isFeatured?: boolean
  isComingSoon?: boolean
  usageCount?: number
  relatedTools?: string[] // tool ids
  acceptedFileTypes?: string[]
  outputFileTypes?: string[]
  maxFileSizeMB?: number
  supportsMultipleFiles?: boolean
}

// ─── File / Processing Types ────────────────────────────────────────────────────

export type ProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'error'
  | 'cancelled'

export interface ProcessingFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: ProcessingStatus
  progress: number // 0–100
  error?: string
  result?: ProcessingResult
}

export interface ProcessingResult {
  data: Uint8Array | Blob
  filename: string
  mimeType: string
  size: number
}

// ─── PDF Types ─────────────────────────────────────────────────────────────────

export interface PDFPage {
  index: number // 0-based
  width: number
  height: number
  rotation: number
  thumbnail?: string // data URL
  selected?: boolean
}

export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  pageCount?: number
  fileSize?: number
}

export interface PDFDocument {
  id: string
  file: File
  metadata: PDFMetadata
  pages: PDFPage[]
  isEncrypted: boolean
  isLocked: boolean
}

export type SplitMode = 'pages' | 'ranges' | 'size' | 'bookmarks'

export interface SplitRange {
  start: number // 1-based
  end: number // 1-based
  name?: string
}

export type CompressionQuality = 'maximum' | 'recommended' | 'less' | 'extreme'

export interface CompressionOptions {
  quality: CompressionQuality
  optimizeImages?: boolean
  removeMetadata?: boolean
  flattenAnnotations?: boolean
}

export interface MergeOptions {
  addBookmarks?: boolean
  preserveBookmarks?: boolean
}

export interface WatermarkOptions {
  type: 'text' | 'image'
  text?: string
  imageData?: Uint8Array
  opacity: number // 0–1
  rotation: number // degrees
  position: 'center' | 'tile' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  fontSize?: number
  color?: string
  pages?: 'all' | 'odd' | 'even' | number[]
}

export interface PageNumberOptions {
  position:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  startFrom: number
  prefix?: string
  suffix?: string
  fontSize?: number
  color?: string
  margin?: number
  pages?: 'all' | number[]
}

export interface PDFProtectOptions {
  userPassword?: string
  ownerPassword: string
  allowPrinting?: boolean
  allowCopying?: boolean
  allowEditing?: boolean
  allowAnnotating?: boolean
  allowFormFilling?: boolean
  encryption?: '128bit' | '256bit'
}

// ─── OCR Types ─────────────────────────────────────────────────────────────────

export interface OCRWord {
  text: string
  confidence: number
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

export interface OCRLine {
  text: string
  confidence: number
  words: OCRWord[]
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

export interface OCRPage {
  text: string
  confidence: number
  lines: OCRLine[]
  pageIndex: number
}

export interface OCRResult {
  text: string
  confidence: number
  pages: OCRPage[]
  language: string
  processingTime: number
}

export interface OCROptions {
  language: string // e.g. 'eng', 'deu', 'hin'
  outputType?: 'text' | 'hocr' | 'pdf'
  preserveLayout?: boolean
}

// ─── Conversion Types ──────────────────────────────────────────────────────────

export interface ConversionOptions {
  targetFormat: string
  quality?: number
  dpi?: number
  pageRange?: string
}

// ─── Image Types ───────────────────────────────────────────────────────────────

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageResizeOptions {
  width?: number
  height?: number
  keepAspectRatio?: boolean
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface ImageConvertOptions {
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif'
  quality?: number // 0–1
}

// ─── Signature Types ───────────────────────────────────────────────────────────

export type SignatureType = 'drawn' | 'typed' | 'uploaded'

export interface SignatureData {
  type: SignatureType
  imageData: string // base64 data URL
  width: number
  height: number
  name?: string
  createdAt: Date
}

export interface SignaturePlacement {
  pageIndex: number // 0-based
  x: number // fraction 0–1
  y: number // fraction 0–1
  width: number // fraction 0–1
  height: number // fraction 0–1
  rotation?: number
}

// ─── Workspace Types ───────────────────────────────────────────────────────────

export type WorkspaceLayout = 'single' | 'split-horizontal' | 'split-vertical'

export interface WorkspaceTab {
  id: string
  title: string
  file?: File
  documentId?: string
  toolId?: string
  isDirty: boolean
  isActive: boolean
  isPinned: boolean
  previewUrl?: string
  createdAt: Date
}

// ─── Vault Types ───────────────────────────────────────────────────────────────

export interface VaultMeta {
  name: string
  description?: string
  tags?: string[]
  collection?: string
  isFavorite?: boolean
}

export interface VaultItem {
  id: string
  name: string
  description?: string
  tags: string[]
  collection?: string
  isFavorite: boolean
  fileType: string
  mimeType: string
  size: number
  createdAt: Date
  updatedAt: Date
  thumbnailUrl?: string
}

// ─── Recent File Types ─────────────────────────────────────────────────────────

export interface RecentFile {
  id: string
  name: string
  type: string
  size: number
  toolId?: string
  toolName?: string
  action: 'opened' | 'edited' | 'generated'
  timestamp: Date
  previewUrl?: string
}

// ─── Business / Invoice Types ──────────────────────────────────────────────────

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  taxRate?: number // percentage
  discount?: number // percentage
}

export interface InvoiceParty {
  name: string
  address?: string
  city?: string
  state?: string
  country?: string
  zip?: string
  email?: string
  phone?: string
  website?: string
  logo?: string // base64 data URL
}

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  currency: string
  seller: InvoiceParty
  buyer: InvoiceParty
  lineItems: InvoiceLineItem[]
  notes?: string
  termsAndConditions?: string
  taxRate?: number // default tax %
  discountRate?: number // overall discount %
  template?: 'modern' | 'classic' | 'minimal'
}

export interface GSTInvoiceData extends InvoiceData {
  sellerGSTIN: string
  buyerGSTIN?: string
  placeOfSupply: string
  isIGST: boolean // true = interstate (IGST), false = intrastate (CGST+SGST)
  cgstRate?: number
  sgstRate?: number
  igstRate?: number
  hsnSacCode?: string
}

// ─── Notification Types ────────────────────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number // ms, 0 = persistent
  action?: { label: string; handler: () => void }
}
