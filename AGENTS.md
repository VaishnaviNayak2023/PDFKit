# PDFKit - Development Guide

## Project Overview
PDFKit is a privacy-first, offline-capable document platform built with Vue 3, Quasar Framework, TypeScript, and Node.js. All document processing is performed locally in the browser.

## Current Status
✅ **Foundation Complete**
- Vue 3 + Quasar + TypeScript project structure
- Dark theme configuration
- Router with core pages
- Pinia stores for state management
- Reusable upload components
- Reusable preview components
- PWA configuration
- Development server running at http://localhost:9000

## Completed Features

### Pages
- **HomePage**: Landing page with hero section, tool categories, and feature highlights
- **AllToolsPage**: Comprehensive tools page with sidebar navigation, search, categories, and tool cards
- **WorkspacePage**: Placeholder for future workspace functionality
- **PrivacyPage**: Privacy policy and architecture information
- **AboutPage**: About PDFKit and technology stack
- **FAQPage**: Frequently asked questions

### Components
- **Upload Components**:
  - `FileDropZone`: Drag-and-drop file upload zone
  - `FilePicker`: File selection button
  - `FileQueue`: File queue management with status tracking
  - `UploadProgress`: Progress indicator for file operations

- **Preview Components**:
  - `PDFPreview`: PDF document viewer with page navigation and zoom
  - `ImagePreview`: Image viewer with zoom and rotation
  - `DocumentPreview`: Document viewer for Word and text files

### Stores (Pinia)
- **appStore**: Application state (dark mode, offline status, sidebar)
- **documentsStore**: Document management (recent files, favorites)
- **workspaceStore**: Workspace tab management and split view

### Layouts
- **MainLayout**: Main application layout with header, footer, and navigation

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

## Project Structure

```
src/
├── assets/              # Static assets
├── boot/                # Quasar boot files
├── components/          # Reusable components
│   ├── common/         # Common components
│   ├── layout/         # Layout components
│   ├── navigation/     # Navigation components
│   ├── upload/         # Upload components ✅
│   ├── preview/        # Preview components ✅
│   ├── processing/     # Processing components
│   ├── dialogs/        # Dialog components
│   ├── pdf/           # PDF-specific components
│   ├── image/         # Image-specific components
│   ├── document/      # Document-specific components
│   ├── ocr/           # OCR components
│   ├── signature/     # Signature components
│   ├── security/      # Security components
│   ├── workspace/     # Workspace components
│   ├── dashboard/     # Dashboard components
│   ├── forms/         # Form components
│   ├── tables/        # Table components
│   └── shared/        # Shared utilities
├── composables/        # Vue composables
├── layouts/           # Page layouts ✅
├── pages/             # Page components ✅
├── router/            # Vue Router configuration ✅
├── services/          # Business logic services
│   ├── pdf/          # PDF processing services
│   ├── image/        # Image processing services
│   ├── document/     # Document processing services
│   ├── ocr/          # OCR services
│   ├── storage/      # Storage services
│   └── conversion/   # Conversion services
├── stores/            # Pinia stores ✅
├── types/             # TypeScript type definitions
├── workers/           # Web Workers for background processing
└── main.ts           # Application entry point
```

## Next Steps

### 1. Implement Tool Pages ✅ (In Progress)
Create individual pages for each tool category:
- PDF Essentials (merge, split, compress, repair)
- PDF Organization (reorder, rotate, crop)
- PDF Editing (add text, images, annotations)
- PDF Security (password protect, unlock)
- OCR & Scan (text extraction)
- Conversion tools
- Image tools
- Signature tools
- Business tools

### 2. Implement Processing Services ✅ (Complete)
Create services in `src/services/`:
- ✅ PDF processing using pdf-lib
- Image processing using canvas API
- ✅ OCR using Tesseract.js
- Document conversion using mammoth, docx, xlsx

### 3. Create Web Workers ✅ (Complete)
Implement background processing in `src/workers/`:
- ✅ PDF processing worker
- ✅ OCR worker
- Compression worker
- Conversion worker

### 4. Build Workspace Layout
Implement `WorkspaceLayout.vue` with:
- Tab system for multiple documents
- Split view for side-by-side comparison
- File explorer
- Recent files panel

### 5. Add Tool-Specific Components
Create components for each tool category in the respective directories.

### 6. Implement Local Storage
Add IndexedDB/OPFS integration for:
- Recent files persistence
- Favorites persistence
- Local document vault
- Settings persistence

### 7. Add PWA Features
- Service worker for offline caching
- Install prompt handling
- Offline detection and UI updates

### 8. Accessibility Improvements
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode

## Design Principles

### Component-First Architecture
- Keep pages thin - they should only compose components
- Business logic lives in components and services
- Reusable workflows in components, not pages

### CSS Policy
1. Use Quasar components first
2. Use Quasar utility classes
3. Use Quasar theme configuration
4. Custom CSS only when unavoidable

### Privacy First
- No file uploads to servers
- All processing local
- No hidden network requests
- No account required for basic features

### Performance Targets
- Lighthouse Performance ≥ 90
- Lighthouse Accessibility ≥ 90
- Lighthouse Best Practices ≥ 90
- Lighthouse PWA ≥ 90

## Technology Stack

### Frontend
- Vue 3
- TypeScript
- Quasar Framework
- Vue Router
- Pinia

### PDF Processing
- pdf-lib
- pdf.js
- MuPDF WASM (optional)
- PDFium WASM (optional)

### OCR
- Tesseract.js
- Web Workers

### Document Processing
- mammoth.js (Word)
- docx (Word creation)
- xlsx/SheetJS (Excel)
- jsPDF (PDF creation)

### Storage
- IndexedDB
- OPFS (Origin Private File System)
- File System Access API

### PWA
- vite-plugin-pwa
- Service Workers

## Notes

- The development server is currently running at http://localhost:9000
- Sass deprecation warnings are from Quasar and can be ignored
- The application uses a dark theme by default
- All processing is designed to be local-first for privacy
- AI features will be optional and clearly marked when implemented
