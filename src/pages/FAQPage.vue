<template>
  <q-page class="bg-dark">
    <div class="faq-container">
      <div class="faq-header">
        <h1 class="faq-title">Frequently Asked Questions</h1>
        <p class="faq-subtitle">Common questions about PDFKit</p>
      </div>

      <div class="faq-content">
        <q-list dark class="faq-list">
          <q-expansion-item
            v-for="faq in faqs"
            :key="faq.id"
            :label="faq.question"
            dark
            class="faq-item"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="help_outline" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ faq.question }}</q-item-label>
              </q-item-section>
            </template>

            <q-card dark flat bordered class="faq-answer-card">
              <q-card-section>
                {{ faq.answer }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FAQ {
  id: string
  question: string
  answer: string
}

const faqs = ref<FAQ[]>([
  {
    id: '1',
    question: 'Is PDFKit really free to use?',
    answer: 'Yes, PDFKit is completely free to use. All basic document processing tools are available at no cost. We believe privacy should be accessible to everyone.'
  },
  {
    id: '2',
    question: 'Are my files uploaded to any server?',
    answer: 'No, your files are never uploaded to our servers. All document processing happens locally on your device using JavaScript and WebAssembly. Your files stay private and secure on your computer.'
  },
  {
    id: '3',
    question: 'Do I need to create an account?',
    answer: 'No account is required to use PDFKit. You can start using all tools immediately without registration. We only offer optional account features for cloud synchronization if you choose to use them.'
  },
  {
    id: '4',
    question: 'Does PDFKit work offline?',
    answer: 'Yes, PDFKit is designed to work offline. Once loaded, all tools function without an internet connection. We use Progressive Web App technology to enable offline functionality.'
  },
  {
    id: '5',
    question: 'What file formats are supported?',
    answer: 'PDFKit supports PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), images (JPG, PNG, WebP, SVG), and many other formats. You can convert between most common document and image formats.'
  },
  {
    id: '6',
    question: 'Is OCR available offline?',
    answer: 'Yes, OCR (Optical Character Recognition) works offline using Tesseract.js. Language packs are cached locally after first download, allowing you to extract text from images and scanned documents without internet.'
  },
  {
    id: '7',
    question: 'Are there any file size limits?',
    answer: 'File size limits depend on your browser and device memory. Most modern browsers can handle files up to several hundred megabytes. Very large files may take longer to process.'
  },
  {
    id: '8',
    question: 'Can I use PDFKit on mobile devices?',
    answer: 'Yes, PDFKit is fully responsive and works on mobile devices, tablets, and desktop computers. The interface adapts to your screen size for optimal experience.'
  },
  {
    id: '9',
    question: 'What about AI features?',
    answer: 'AI features are optional and clearly marked. When you use AI tools, you\'ll be warned that document content may be sent to external AI services. You can always choose to use our local-only tools instead.'
  },
  {
    id: '10',
    question: 'Is PDFKit open source?',
    answer: 'Yes, PDFKit is open source. You can review our code, contribute improvements, and verify our privacy claims. We believe transparency is essential for privacy-focused software.'
  }
])
</script>

<style scoped>
.faq-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.faq-header {
  margin-bottom: 40px;
}

.faq-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
}

.faq-subtitle {
  font-size: 18px;
  color: #808080;
}

.faq-list {
  background: transparent;
}

.faq-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  margin-bottom: 16px;
  border-radius: 8px;
}

.faq-answer-card {
  background: #0f0f0f;
  border: none;
  border-top: 1px solid #2a2a2a;
}

.faq-answer-card .q-card-section {
  padding: 20px;
  color: #b0b0b0;
  line-height: 1.6;
}
</style>
