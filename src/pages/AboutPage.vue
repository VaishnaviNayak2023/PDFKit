<template>
  <q-page class="bg-dark">
    <div class="about-container">
      <div class="about-header">
        <h1 class="about-title">About PDFKit</h1>
        <p class="about-subtitle">The privacy-first document platform for the modern web</p>
      </div>

      <div class="about-content">
        <q-card dark flat bordered class="about-card">
          <q-card-section>
            <h2 class="section-title">Our Mission</h2>
            <p class="section-text">
              PDFKit was built with a simple mission: to provide powerful document tools that respect your privacy.
              We believe that you shouldn't have to choose between functionality and privacy.
            </p>

            <h3 class="subsection-title">Why PDFKit?</h3>
            <ul class="feature-list">
              <li><strong>Privacy First:</strong> Your files never leave your device</li>
              <li><strong>Offline Ready:</strong> Works without internet connection</li>
              <li><strong>No Account Required:</strong> Start using immediately</li>
              <li><strong>Open Source:</strong> Transparent and auditable code</li>
              <li><strong>Modern Technology:</strong> Built with Vue 3, Quasar, and WebAssembly</li>
              <li><strong>70+ Tools:</strong> Comprehensive document processing suite</li>
            </ul>

            <h3 class="subsection-title">Technology Stack</h3>
            <p class="section-text">
              PDFKit is built using modern web technologies:
            </p>
            <ul class="feature-list">
              <li>Vue 3 - Progressive JavaScript framework</li>
              <li>Quasar Framework - UI component library</li>
              <li>TypeScript - Type-safe development</li>
              <li>pdf-lib - PDF manipulation library</li>
              <li>Tesseract.js - OCR engine</li>
              <li>WebAssembly - High-performance processing</li>
            </ul>

            <h3 class="subsection-title">Open Source</h3>
            <p class="section-text">
              PDFKit is open source software. You can review our code, contribute improvements, and run your own instance.
              We believe in transparency and community-driven development.
            </p>

            <h3 class="subsection-title">Contact</h3>
            <p class="section-text">
              Have questions or feedback? We'd love to hear from you. Reach out through our GitHub repository or community forums.
            </p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// About page
</script>

<style scoped>
.about-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.about-header {
  margin-bottom: 40px;
}

.about-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
}

.about-subtitle {
  font-size: 18px;
  color: #808080;
}

.about-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
}

.section-text {
  font-size: 16px;
  color: #b0b0b0;
  line-height: 1.6;
  margin-bottom: 24px;
}

.subsection-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  margin-top: 32px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin-bottom: 24px;
}

.feature-list li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: #b0b0b0;
}

.feature-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #4a9eff;
  font-weight: bold;
}
</style>
