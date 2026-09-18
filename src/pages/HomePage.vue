<template>
  <q-page class="bg-dark">
    <!-- Header -->
    <header class="header">
      <div class="header-container">
        <div class="header-left">
          <div class="logo">PDFKit</div>
        </div>
        <nav class="header-nav">
          <a href="#" class="nav-link">Home</a>
          <a href="#" class="nav-link">Tools</a>
          <a href="#" class="nav-link">Workspace</a>
          <a href="#" class="nav-link">Pricing</a>
          <a href="#" class="nav-link">Resources</a>
          <a href="#" class="nav-link">About</a>
        </nav>
        <div class="header-right">
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" placeholder="Search tools..." />
          </div>
          <button class="sign-in-btn">Sign In</button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-background">
        <div class="cosmic-bg"></div>
      </div>
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">THE DIGITAL FRONTIER</h1>
          <p class="hero-subtitle">
            Your all-in-one PDF and document solution. Private. Secure. Powerful. Works offline.
          </p>
          <div class="hero-features">
            <div class="hero-feature">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div>
                <div class="feature-title">100% Private</div>
                <div class="feature-desc">Your files never leave your device</div>
              </div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6h-1a6 6 0 0 0-12 0v1"></path>
                  <path d="M18 9a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6v-3a6 6 0 0 1 6-6h12"></path>
                  <line x1="12" y1="15" x2="12" y2="15"></line>
                </svg>
              </div>
              <div>
                <div class="feature-title">Offline First</div>
                <div class="feature-desc">All tools work without internet</div>
              </div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 14 20 14 13 2"></polygon>
                </svg>
              </div>
              <div>
                <div class="feature-title">Lightning Fast</div>
                <div class="feature-desc">Process documents instantly</div>
              </div>
            </div>
            <div class="hero-feature">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                  <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>
                  <path d="M12 12v10a10 10 0 0 1-10-10h10z"></path>
                </svg>
              </div>
              <div>
                <div class="feature-title">AI Ready</div>
                <div class="feature-desc">Optional AI tools when you need them</div>
              </div>
            </div>
          </div>
          <div class="hero-buttons">
            <button class="btn btn-primary">Explore All Tools</button>
            <button class="btn btn-secondary">Watch Overview</button>
          </div>
        </div>
        <div class="hero-image">
          <div class="hero-image-wrapper">
            <div class="hero-visual">
              <div class="visual-placeholder">
                <div class="person-silhouette"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-stats">
        <div class="hero-stats-container">
          <div class="hero-stat">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">1M+</div>
              <div class="stat-label">Happy Users</div>
            </div>
          </div>
          <div class="hero-stat">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">70+</div>
              <div class="stat-label">Powerful Tools</div>
            </div>
          </div>
          <div class="hero-stat">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">100%</div>
              <div class="stat-label">Local Processing</div>
            </div>
          </div>
          <div class="hero-stat">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">100%</div>
              <div class="stat-label">Offline Works Everywhere</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tools Section -->
    <section class="tools">
      <div class="section-container">
        <div class="section-header">
          <div class="section-label">POWERFUL TOOLS</div>
          <h2 class="section-title">Everything You Need</h2>
          <a href="#" class="view-all">View All Tools <q-icon name="arrow_forward" size="16px" /></a>
        </div>
        <div class="tools-grid">
          <div class="tool-card" v-for="tool in tools" :key="tool.id">
            <div class="tool-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="getToolIcon(tool.icon)"></svg>
            </div>
            <h3 class="tool-title">{{ tool.title }}</h3>
            <p class="tool-desc">{{ tool.desc }}</p>
            <div class="tool-count">{{ tool.count }} tools</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Future Section -->
    <section class="future">
      <div class="section-container">
        <div class="future-content">
          <div class="future-text">
            <div class="section-label">BUILT FOR THE FUTURE</div>
            <h2 class="future-title">Limitless Possibilities With PDFKit</h2>
            <p class="future-desc">
              PDFKit is more than just a tool. It's a complete workspace to manage, edit and secure your documents with next-gen technology.
            </p>
            <a href="#" class="btn-link">Learn More <q-icon name="arrow_forward" size="16px" /></a>
          </div>
          <div class="future-image">
            <div class="future-image-wrapper">
              <div class="future-placeholder"></div>
            </div>
          </div>
          <div class="future-features">
            <div class="future-feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>
                <path d="M12 12v10a10 10 0 0 1-10-10h10z"></path>
              </svg>
              <div>
                <div class="future-feature-title">Innovation</div>
                <div class="future-feature-desc">Cutting-edge technology</div>
              </div>
            </div>
            <div class="future-feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <div>
                <div class="future-feature-title">Security</div>
                <div class="future-feature-desc">Enterprise-grade privacy</div>
              </div>
            </div>
            <div class="future-feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <div>
                <div class="future-feature-title">Experience</div>
                <div class="future-feature-desc">Intuitive and fast workflow</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="section-container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">1M+</div>
            <div class="stat-label">Happy Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">100%</div>
            <div class="stat-label">Private & Secure</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">50+</div>
            <div class="stat-label">Powerful Tools</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">100%</div>
            <div class="stat-label">Offline Works Everywhere</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials">
      <div class="section-container">
        <div class="section-header">
          <div class="section-label">TESTIMONIALS</div>
          <h2 class="section-title">Voices of the Future</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="testimonial in testimonials" :key="testimonial.id">
            <p class="testimonial-text">"{{ testimonial.text }}"</p>
            <div class="testimonial-author">
              <div class="author-name">{{ testimonial.name }}</div>
              <div class="author-role">{{ testimonial.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="section-container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to explore the future of document management?</h2>
          <p class="cta-subtitle">Join millions of users who trust PDFKit.</p>
          <button class="btn btn-primary">Get Started Now <q-icon name="arrow_forward" size="16px" /></button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-logo">PDFKit</div>
            <p class="footer-copyright">© 2025 PDFKit. All rights reserved.</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h4 class="footer-title">Product</h4>
              <a href="#" class="footer-link">Tools</a>
              <a href="#" class="footer-link">Pricing</a>
              <a href="#" class="footer-link">What's New</a>
            </div>
            <div class="footer-column">
              <h4 class="footer-title">Resources</h4>
              <a href="#" class="footer-link">Blog</a>
              <a href="#" class="footer-link">Guides</a>
              <a href="#" class="footer-link">Help Center</a>
            </div>
            <div class="footer-column">
              <h4 class="footer-title">Company</h4>
              <a href="#" class="footer-link">About Us</a>
              <a href="#" class="footer-link">Privacy Policy</a>
              <a href="#" class="footer-link">Terms of Service</a>
            </div>
          </div>
          <div class="footer-social">
            <a href="#" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tools = ref([
  { 
    id: 1, 
    title: 'PDF Essentials', 
    desc: 'Merge, split, compress, convert', 
    count: 12, 
    icon: 'pdf'
  },
  { 
    id: 2, 
    title: 'Convert to PDF', 
    desc: 'Word, Excel, PPT, Images', 
    count: 14, 
    icon: 'upload'
  },
  { 
    id: 3, 
    title: 'Convert from PDF', 
    desc: 'Word, Excel, JPG, PNG', 
    count: 13, 
    icon: 'download'
  },
  { 
    id: 4, 
    title: 'Organize PDF', 
    desc: 'Reorder, rotate, delete, extract', 
    count: 11, 
    icon: 'organize'
  },
  { 
    id: 5, 
    title: 'Edit PDF', 
    desc: 'Edit text, watermark, images, shapes', 
    count: 14, 
    icon: 'edit'
  },
  { 
    id: 6, 
    title: 'PDF Security', 
    desc: 'Protect, unlock, redact, sign', 
    count: 9, 
    icon: 'security'
  },
  { 
    id: 7, 
    title: 'OCR & Scan', 
    desc: 'OCR PDF, images, searchable PDFs', 
    count: 8, 
    icon: 'ocr'
  },
  { 
    id: 8, 
    title: 'More Tools', 
    desc: 'Images, signatures, forms', 
    count: 20, 
    icon: 'more'
  }
])

const getToolIcon = (iconType: string) => {
  const icons: Record<string, string> = {
    pdf: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>`,
    upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>`,
    download: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>`,
    organize: `<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>`,
    edit: `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 1 1-4 1-4 1 9.5-9.5z"></path><line x1="15" y1="6" x2="18" y2="9"></line>`,
    security: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`,
    ocr: `<path d="M15 3h6v6"></path><path d="M10 14L21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline>`,
    more: `<circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>`
  }
  return icons[iconType] || icons.pdf
}

const testimonials = ref([
  { 
    id: 1, 
    text: 'PDFKit has completely transformed the way I work with documents. Fast, private and incredibly powerful.', 
    name: 'James Rozaki', 
    role: 'Product Designer' 
  },
  { 
    id: 2, 
    text: 'The offline capabilities are unmatched. I can work on sensitive files anywhere without worrying about security.', 
    name: 'Samantha Leonardo', 
    role: 'Security Analyst' 
  },
  { 
    id: 3, 
    text: 'An essential tool in our daily workflow. PDFKit is now a core part of our productivity stack.', 
    name: 'Mark Trevor', 
    role: 'CTO, Neovision' 
  }
])
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left .logo {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #4a9eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #999;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
}

.search-bar svg {
  color: #666;
}

.search-bar input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  width: 180px;
}

.search-bar input::placeholder {
  color: #666;
}

.sign-in-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.sign-in-btn:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

/* Hero */
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0a0a;
  padding-top: 64px;
  position: relative;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.cosmic-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at 70% 30%, rgba(74, 158, 255, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 30% 70%, rgba(155, 89, 182, 0.1) 0%, transparent 50%);
  animation: cosmic-pulse 8s ease-in-out infinite;
}

@keyframes cosmic-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.hero-title {
  font-size: 72px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -3px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 20px;
  color: #a0a0a0;
  line-height: 1.6;
  max-width: 550px;
}

.hero-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.hero-feature {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.hero-feature:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.feature-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.hero-buttons {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4a9eff 0%, #3a8eef 100%);
  color: #fff;
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(74, 158, 255, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image-wrapper {
  width: 100%;
  max-width: 550px;
  aspect-ratio: 1;
  position: relative;
}

.hero-visual {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(155, 89, 182, 0.1) 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.person-silhouette {
  width: 80%;
  height: 80%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 50%;
  position: relative;
}

.person-silhouette::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 40%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
}

.person-silhouette::after {
  content: '';
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 50%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px 20px 0 0;
}

.hero-stats {
  padding: 40px 0;
  position: relative;
  z-index: 1;
}

.hero-stats-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.hero-stat {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.hero-stat:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #4a9eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

/* Section Container */
.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Tools */
.tools {
  padding: 100px 0;
  background: #0f0f0f;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #4a9eff;
  text-transform: uppercase;
}

.section-title {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.view-all {
  color: #4a9eff;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.tool-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s;
}

.tool-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}

.tool-icon {
  color: #4a9eff;
  margin-bottom: 16px;
}

.tool-icon svg {
  width: 40px;
  height: 40px;
}

.tool-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.tool-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.4;
}

.tool-count {
  font-size: 12px;
  color: #4a9eff;
  font-weight: 600;
}

/* Future */
.future {
  padding: 100px 0;
  background: #0a0a0a;
}

.future-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.future-text {
  grid-column: 1 / -1;
  max-width: 600px;
}

.future-title {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}

.future-desc {
  font-size: 16px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 24px;
}

.btn-link {
  color: #4a9eff;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.future-image {
  grid-column: 2;
  display: flex;
  justify-content: center;
}

.future-image-wrapper {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
}

.future-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(74, 158, 255, 0.1) 100%);
  border-radius: 16px;
}

.future-features {
  grid-column: 3;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.future-feature {
  display: flex;
  align-items: center;
  gap: 12px;
}

.future-feature svg {
  color: #4a9eff;
}

.future-feature-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.future-feature-desc {
  font-size: 13px;
  color: #666;
}

/* Stats */
.stats {
  padding: 80px 0;
  background: #0f0f0f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #4a9eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

/* Testimonials */
.testimonials {
  padding: 100px 0;
  background: #0a0a0a;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
}

.testimonial-text {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 16px;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.author-role {
  font-size: 12px;
  color: #666;
}

/* CTA */
.cta {
  padding: 80px 0;
  background: #0f0f0f;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}

.cta-subtitle {
  font-size: 16px;
  color: #888;
  margin-bottom: 32px;
}

/* Footer */
.footer {
  padding: 60px 0 40px;
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 60px;
}

.footer-brand {
  flex-shrink: 0;
}

.footer-logo {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #4a9eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.footer-copyright {
  font-size: 12px;
  color: #444;
}

.footer-links {
  display: flex;
  gap: 60px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.footer-link {
  color: #666;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #4a9eff;
}

.footer-social {
  display: flex;
  gap: 16px;
}

.social-link {
  color: #666;
  transition: color 0.3s;
}

.social-link:hover {
  color: #4a9eff;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-nav {
    display: none;
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 60px 24px 40px;
  }

  .hero-content {
    text-align: center;
  }

  .hero-features {
    grid-template-columns: 1fr;
    align-items: center;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .future-content {
    grid-template-columns: 1fr;
  }

  .future-text {
    grid-column: 1;
    text-align: center;
  }

  .future-image {
    grid-column: 1;
    order: -1;
  }

  .future-features {
    grid-column: 1;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .footer-top {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .footer-links {
    flex-direction: column;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 48px;
    letter-spacing: -1px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .section-title {
    font-size: 32px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats-container {
    grid-template-columns: 1fr;
  }

  .future-features {
    flex-direction: column;
  }

  .hero-buttons {
    flex-direction: column;
  }
}
</style>
