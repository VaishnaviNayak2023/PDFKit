<template>
  <q-page class="bg-dark">
    <div class="privacy-container">
      <div class="privacy-header">
        <h1 class="privacy-title">Privacy Policy</h1>
        <p class="privacy-subtitle">Your privacy is our top priority</p>
      </div>

      <div class="privacy-content">
        <q-card dark flat bordered class="privacy-card">
          <q-card-section>
            <h2 class="section-title">Privacy First Architecture</h2>
            <p class="section-text">
              PDFKit is built with a privacy-first architecture. All document processing happens locally on your device.
              Your files never leave your computer unless you explicitly choose to use cloud-based features.
            </p>

            <h3 class="subsection-title">What We Don't Do</h3>
            <ul class="feature-list">
              <li>No file uploads to our servers</li>
              <li>No server-side document processing</li>
              <li>No hidden network requests containing document content</li>
              <li>No account required for basic functionality</li>
              <li>No watermarking of your documents</li>
              <li>No document retention or storage</li>
              <li>No document analytics or tracking</li>
            </ul>

            <h3 class="subsection-title">Local Processing</h3>
            <p class="section-text">
              All PDF operations, image processing, OCR, and document conversions are performed using:
            </p>
            <ul class="feature-list">
              <li>JavaScript libraries running in your browser</li>
              <li>WebAssembly modules for performance</li>
              <li>Web Workers for background processing</li>
              <li>Browser APIs for file access and storage</li>
            </ul>

            <h3 class="subsection-title">Data Storage</h3>
            <p class="section-text">
              We use local storage technologies on your device:
            </p>
            <ul class="feature-list">
              <li>IndexedDB for recent files and settings</li>
              <li>OPFS (Origin Private File System) for document storage</li>
              <li>Service Worker cache for offline functionality</li>
            </ul>

            <h3 class="subsection-title">AI Features</h3>
            <p class="section-text">
              AI-powered features are optional and clearly marked. When you use AI features, you will be warned that
              extracted document content may be sent to external AI services. You can always choose to use our
              local-only tools instead.
            </p>

            <h3 class="subsection-title">Open Source</h3>
            <p class="section-text">
              PDFKit is open source, allowing you to verify our privacy claims and audit the code yourself.
              We believe transparency is essential for privacy.
            </p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Privacy page
</script>

<style scoped>
.privacy-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.privacy-header {
  margin-bottom: 40px;
}

.privacy-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
}

.privacy-subtitle {
  font-size: 18px;
  color: #808080;
}

.privacy-card {
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
  content: "✓";
  position: absolute;
  left: 0;
  color: #4a9eff;
  font-weight: bold;
}
</style>
