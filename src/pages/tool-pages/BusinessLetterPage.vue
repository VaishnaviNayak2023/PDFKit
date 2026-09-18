<template>
  <BaseToolPage
    title="Business Letter"
    description="Create professional business letters in PDF format"
    accepted-file-types=""
    action-label="Generate Letter"
    success-message="Business Letter Generated Successfully!"
    download-filename="business-letter.pdf"
    @files-selected="handleFilesSelected"
    @process-files="generateLetter"
  >
    <template #upload-section>
      <div class="no-upload-needed">
        <q-icon name="mail" size="48px" color="primary" />
        <p>No file upload needed - fill in the letter details below</p>
      </div>
    </template>

    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Business Letter Details</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="sender-info">
              <label class="field-label">Sender Information</label>
              <q-input
                v-model="letter.senderName"
                label="Your Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="letter.senderTitle"
                label="Title/Position"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="letter.senderCompany"
                label="Company Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="letter.senderAddress"
                label="Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <div class="info-row">
                <q-input
                  v-model="letter.senderCity"
                  label="City"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="letter.senderState"
                  label="State"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="letter.senderZip"
                  label="ZIP"
                  filled
                  dark
                  color="primary"
                />
              </div>
              <q-input
                v-model="letter.senderEmail"
                label="Email"
                type="email"
                filled
                dark
                color="primary"
                class="q-mt-md"
              />
              <q-input
                v-model="letter.senderPhone"
                label="Phone"
                filled
                dark
                color="primary"
                class="q-mt-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="recipient-info">
              <label class="field-label">Recipient Information</label>
              <q-input
                v-model="letter.recipientName"
                label="Recipient Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="letter.recipientTitle"
                label="Title/Position"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="letter.recipientCompany"
                label="Company Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="letter.recipientAddress"
                label="Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <div class="info-row">
                <q-input
                  v-model="letter.recipientCity"
                  label="City"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="letter.recipientState"
                  label="State"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="letter.recipientZip"
                  label="ZIP"
                  filled
                  dark
                  color="primary"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="letter-content">
              <label class="field-label">Letter Content</label>
              <div class="info-row">
                <q-input
                  v-model="letter.date"
                  label="Date"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="letter.reference"
                  label="Reference (optional)"
                  filled
                  dark
                  color="primary"
                />
              </div>
              
              <q-input
                v-model="letter.subject"
                label="Subject"
                filled
                dark
                color="primary"
                class="q-mt-md"
              />
              
              <q-input
                v-model="letter.salutation"
                label="Salutation"
                filled
                dark
                color="primary"
                class="q-mt-md"
                hint="e.g., Dear Mr. Smith,"
              />
              
              <q-input
                v-model="letter.body"
                label="Letter Body"
                type="textarea"
                filled
                dark
                color="primary"
                rows="12"
                class="q-mt-md"
                hint="Write your letter content here. Use double line breaks for new paragraphs."
              />
              
              <q-input
                v-model="letter.closing"
                label="Closing"
                filled
                dark
                color="primary"
                class="q-mt-md"
                hint="e.g., Sincerely,"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="generatedLetter" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Business Letter Generated Successfully!</h3>
        </div>
        
        <q-btn
          color="primary"
          label="Download Letter PDF"
          @click="downloadResult"
          size="lg"
        >
          <template v-slot:after>
            <q-icon name="download" />
          </template>
        </q-btn>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { jsPDF } from 'jspdf'

const letter = ref({
  senderName: '',
  senderTitle: '',
  senderCompany: '',
  senderAddress: '',
  senderCity: '',
  senderState: '',
  senderZip: '',
  senderEmail: '',
  senderPhone: '',
  recipientName: '',
  recipientTitle: '',
  recipientCompany: '',
  recipientAddress: '',
  recipientCity: '',
  recipientState: '',
  recipientZip: '',
  date: new Date().toISOString().split('T')[0],
  reference: '',
  subject: '',
  salutation: 'Dear',
  body: '',
  closing: 'Sincerely'
})

const generatedLetter = ref<Blob | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected() {
  // No file selection needed
}

async function generateLetter() {
  error.value = null
  generatedLetter.value = null
  
  if (!letter.value.senderName || !letter.value.recipientName) {
    error.value = 'Please fill in sender and recipient names'
    return
  }

  if (!letter.value.body.trim()) {
    error.value = 'Please write the letter body'
    return
  }

  try {
    const doc = new jsPDF()
    let y = 30
    const margin = 20
    const maxWidth = 170
    
    // Sender header
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(letter.value.senderName, margin, y)
    y += 6
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (letter.value.senderTitle) {
      doc.text(letter.value.senderTitle, margin, y)
      y += 5
    }
    if (letter.value.senderCompany) {
      doc.text(letter.value.senderCompany, margin, y)
      y += 5
    }
    if (letter.value.senderAddress) {
      doc.text(letter.value.senderAddress, margin, y)
      y += 5
    }
    const senderLocation = [letter.value.senderCity, letter.value.senderState, letter.value.senderZip].filter(Boolean).join(', ')
    if (senderLocation) {
      doc.text(senderLocation, margin, y)
      y += 5
    }
    if (letter.value.senderEmail) {
      doc.text(letter.value.senderEmail, margin, y)
      y += 5
    }
    if (letter.value.senderPhone) {
      doc.text(letter.value.senderPhone, margin, y)
      y += 5
    }
    
    // Date and reference (right aligned)
    y = 30
    doc.setFontSize(10)
    doc.text(letter.value.date, 190, y, { align: 'right' })
    y += 6
    if (letter.value.reference) {
      doc.text(`Re: ${letter.value.reference}`, 190, y, { align: 'right' })
    }
    
    // Recipient
    y += 20
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(letter.value.recipientName, margin, y)
    y += 6
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (letter.value.recipientTitle) {
      doc.text(letter.value.recipientTitle, margin, y)
      y += 5
    }
    if (letter.value.recipientCompany) {
      doc.text(letter.value.recipientCompany, margin, y)
      y += 5
    }
    if (letter.value.recipientAddress) {
      doc.text(letter.value.recipientAddress, margin, y)
      y += 5
    }
    const recipientLocation = [letter.value.recipientCity, letter.value.recipientState, letter.value.recipientZip].filter(Boolean).join(', ')
    if (recipientLocation) {
      doc.text(recipientLocation, margin, y)
      y += 5
    }
    
    // Salutation
    y += 15
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`${letter.value.salutation},`, margin, y)
    y += 10
    
    // Subject
    if (letter.value.subject) {
      doc.setFont('helvetica', 'bold')
      doc.text(`Subject: ${letter.value.subject}`, margin, y)
      y += 10
      doc.setFont('helvetica', 'normal')
    }
    
    // Body (with paragraph support)
    const paragraphs = letter.value.body.split('\n\n')
    paragraphs.forEach(paragraph => {
      const lines = doc.splitTextToSize(paragraph, maxWidth)
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage()
          y = 30
        }
        doc.text(line, margin, y)
        y += 6
      })
      y += 6 // Extra space between paragraphs
    })
    
    // Closing
    y += 10
    doc.text(letter.value.closing + ',', margin, y)
    y += 15
    
    // Signature line
    doc.text(letter.value.senderName, margin, y)
    y += 5
    if (letter.value.senderTitle) {
      doc.text(letter.value.senderTitle, margin, y)
    }
    
    const output = doc.output('arraybuffer')
    generatedLetter.value = new Blob([output], { type: 'application/pdf' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate business letter'
  }
}

function downloadResult() {
  if (!generatedLetter.value) return

  const url = URL.createObjectURL(generatedLetter.value)
  const a = document.createElement('a')
  a.href = url
  a.download = 'business-letter.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.no-upload-needed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #606060;
}

.settings-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
</style>
