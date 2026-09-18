# PDFKit

Privacy-first, offline-capable document platform for PDF and document processing.

## About PDFKit

PDFKit is a modern web application that provides a comprehensive suite of document tools entirely in the browser. Unlike other online document processors, PDFKit never uploads your files to a server - all processing happens locally on your device, ensuring complete privacy and security.

### Key Features

- **50+ Document Tools** - Merge, split, compress, convert, and manipulate PDFs and other documents
- **Privacy-First** - All processing is local, files never leave your device
- **Offline Capable** - Works without an internet connection once loaded
- **Modern UI** - Built with Vue 3 and Quasar Framework for a sleek, responsive experience
- **AI-Ready** - Foundation for AI-powered features with clear disclosure

## Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **UI Framework**: Quasar Framework
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **PDF Processing**: pdf-lib, pdf.js
- **OCR**: Tesseract.js
- **Document Conversion**: docx, xlsx, mammoth, jsPDF
- **Image Processing**: Canvas API
- **PWA**: vite-plugin-pwa

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Clone the Repository

```bash
git clone https://github.com/VaishnaviNayak2023/PDFKit.git
cd PDFTools
```

### Install Dependencies

```bash
npm install
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Tool Categories

### PDF Essentials
- Merge PDF - Combine multiple PDFs into one
- Split PDF - Split PDF by page ranges
- Compress PDF - Reduce file size
- Rotate Pages - Rotate PDF pages
- Repair PDF - Fix corrupted PDFs
- Compare PDF - Compare two PDFs side by side
- Create PDF - Create PDF from scratch

### PDF Organization
- Organize PDF - Reorder and organize pages
- Reorder Pages - Drag-and-drop page reordering
- Delete Pages - Remove specific pages
- Extract Pages - Extract pages to new PDFs

### PDF Editing
- Watermark PDF - Add text or image watermarks
- Add Page Numbers - Number your pages
- Metadata Editor - Edit PDF metadata

### Security
- Protect PDF - Password protect PDFs
- Unlock PDF - Remove password protection
- Redact PDF - Permanently redact sensitive content
- Metadata Cleaner - Remove hidden metadata

### OCR
- OCR PDF - Extract text from scanned PDFs
- OCR Images - Extract text from images
- Searchable PDF - Make PDFs text-searchable
- Batch OCR - Process multiple documents
- Text Extraction - Extract all text from PDFs

### Conversion
- PDF to Word - Convert PDF to DOCX
- PDF to Excel - Convert PDF to XLSX
- PDF to JPG/PNG - Convert PDF pages to images
- Word to PDF - Convert DOCX to PDF
- Image to PDF - Convert images to PDF
- Markdown to PDF - Convert Markdown to PDF
- TXT to PDF - Convert text files to PDF
- HTML to PDF - Convert HTML to PDF
- PDF to TXT - Extract text from PDF

### Image Tools
- Compress Images - Reduce image file size
- Convert Images - Convert between image formats
- Resize Images - Resize images to custom dimensions

### Signature
- Sign PDF - Add electronic signatures to PDFs

### Document Tools
- EPUB Generator - Create ebooks from text/Markdown/HTML
- Combine Word - Merge multiple Word documents
- Split Excel - Split Excel workbooks
- Extract PowerPoint - Extract slides and content
- HTML Document - Preview and export HTML files
- Markdown Document - Edit and export Markdown
- ODT to Word - Convert OpenDocument to Word
- Document Templates - Start from reusable templates

### Business Tools
- Invoice Generator - Create professional invoices
- GST Invoice - Create GST-compliant invoices
- Receipt Generator - Generate payment receipts
- Thermal Receipt - Generate thermal printer receipts
- Purchase Order - Create purchase orders
- Quote Generator - Create price quotes
- Business Letter - Create formal business letters

### AI Tools (Requires Integration)
- Chat with PDF - AI-powered Q&A with documents
- Summarize PDF - Get intelligent document summaries
- Resume Analysis - AI resume review and suggestions
- Contract Analysis - Extract key terms from contracts
- Flashcard Generator - Create study flashcards from PDFs
- Translate PDF - Translate documents to any language

## Privacy & Security

PDFKit is designed with privacy as a core principle:

- **Local Processing**: All document processing happens in your browser
- **No Server Uploads**: Your files are never sent to any server
- **No Account Required**: Use all features without signing up
- **Offline First**: Works without internet connection after initial load
- **AI Disclosure**: AI features clearly warn before transmitting data

## Project Structure

```
src/
├── assets/              # Static assets
├── components/          # Reusable components
│   ├── common/         # Common UI components
│   ├── layout/         # Layout components
│   ├── navigation/     # Navigation components
│   ├── upload/         # File upload components
│   ├── preview/        # Document preview components
│   ├── processing/     # Processing status components
│   └── tools/          # Tool-specific components
├── composables/        # Vue composables
├── config/             # Configuration files
│   └── tools/          # Tool registry and categories
├── layouts/            # Page layouts
├── pages/              # Page components
│   └── tool-pages/     # Individual tool pages
├── router/             # Vue Router configuration
├── services/           # Business logic services
│   ├── pdf/           # PDF processing
│   ├── image/         # Image processing
│   ├── ocr/            # OCR services
│   ├── conversion/    # Document conversion
│   ├── signature/     # Digital signatures
│   └── storage/       # Local storage services
├── stores/             # Pinia state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── workers/            # Web Workers for background processing
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Keep pages thin - they should only compose components
- Business logic lives in services, composables, or workers
- Use Quasar components and utility classes before custom CSS
- Ensure all document processing is local-only
- Test locally before committing

## License

This project is licensed under the MIT License.

## Credits

Built with:
- Vue 3 and Quasar Framework
- pdf-lib for PDF manipulation
- Tesseract.js for OCR
- docx and xlsx for document processing
- jsPDF for PDF generation
- The open-source community

## Support

For issues, questions, or suggestions, please open an issue on GitHub repository.

---

**Note**: PDFKit is currently in active development. Some advanced features may still be in development or require additional configuration.
