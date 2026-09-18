import type { ToolCategory } from '@/types'

export interface ToolCategoryMeta {
  id: ToolCategory
  label: string
  description: string
  icon: string
  color: string
  bgColor: string
}

export const TOOL_CATEGORIES: ToolCategoryMeta[] = [
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Merge, split, compress, repair and more PDF tools.',
    icon: 'picture_as_pdf',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.12)'
  },
  {
    id: 'convert',
    label: 'Convert',
    description: 'Convert between PDF and other formats.',
    icon: 'sync_alt',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.12)'
  },
  {
    id: 'edit',
    label: 'Edit',
    description: 'Add text, images, watermarks and more.',
    icon: 'edit',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.12)'
  },
  {
    id: 'ocr',
    label: 'OCR',
    description: 'Extract text from scans and images.',
    icon: 'document_scanner',
    color: '#22C55E',
    bgColor: 'rgba(34,197,94,0.12)'
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Compress, resize, convert and enhance images.',
    icon: 'image',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.12)'
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Protect, encrypt, redact and secure your PDFs.',
    icon: 'shield',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.12)'
  },
  {
    id: 'signature',
    label: 'Signature',
    description: 'Add and manage electronic signatures.',
    icon: 'draw',
    color: '#EC4899',
    bgColor: 'rgba(236,72,153,0.12)'
  },
  {
    id: 'document',
    label: 'Document',
    description: 'Work with Word, Excel, PowerPoint and more.',
    icon: 'description',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.12)'
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Generate invoices, receipts and business documents.',
    icon: 'work_outline',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.12)'
  },
  {
    id: 'ai',
    label: 'AI',
    description: 'Chat, summarize, analyze and more.',
    icon: 'auto_awesome',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.12)'
  }
]

export const SIDEBAR_CATEGORY_ORDER: Array<ToolCategory | 'all'> = [
  'all',
  'pdf',
  'convert',
  'edit',
  'ocr',
  'security',
  'image',
  'signature',
  'document',
  'business',
  'ai'
]

export const FILTER_CATEGORY_ORDER: Array<ToolCategory | 'all'> = [
  'all',
  'pdf',
  'convert',
  'edit',
  'security',
  'ocr',
  'image',
  'signature',
  'document',
  'business',
  'ai'
]

export const CATEGORY_GRID_ORDER: ToolCategory[] = [
  'pdf',
  'convert',
  'edit',
  'ocr',
  'image',
  'security',
  'signature',
  'document',
  'business',
  'ai'
]

export const FEATURED_TOOL_IDS = [
  'merge-pdf',
  'compress-pdf',
  'pdf-to-word',
  'ocr-pdf',
  'sign-pdf',
  'protect-pdf'
] as const

export const RECENTLY_ADDED_TOOL_IDS = [
  'epub-generator',
  'image-to-pdf',
  'remove-background',
  'contract-analysis'
] as const
