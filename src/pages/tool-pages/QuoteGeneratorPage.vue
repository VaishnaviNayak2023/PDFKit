<template>
  <BaseToolPage
    title="Quote Generator"
    description="Create professional price quotes for clients"
    accepted-file-types=""
    action-label="Generate Quote"
    success-message="Quote Generated Successfully!"
    download-filename="quote.pdf"
    @files-selected="handleFilesSelected"
    @process-files="generateQuote"
  >
    <template #upload-section>
      <div class="no-upload-needed">
        <q-icon name="format_quote" size="48px" color="primary" />
        <p>No file upload needed - fill in the quote details below</p>
      </div>
    </template>

    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Quote Details</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="company-info">
              <label class="field-label">Your Company</label>
              <q-input
                v-model="quote.companyName"
                label="Company Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="quote.companyAddress"
                label="Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="quote.companyEmail"
                label="Email"
                type="email"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="client-info">
              <label class="field-label">Client Information</label>
              <q-input
                v-model="quote.clientName"
                label="Client Name / Company"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="quote.clientAddress"
                label="Client Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="quote-info">
              <label class="field-label">Quote Information</label>
              <div class="info-row">
                <q-input
                  v-model="quote.quoteNumber"
                  label="Quote Number"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="quote.quoteDate"
                  label="Quote Date"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="quote.validUntil"
                  label="Valid Until"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="line-items">
              <label class="field-label">Quote Items</label>
              <div v-for="(item, index) in quote.items" :key="index" class="line-item">
                <q-input
                  v-model="item.description"
                  label="Description"
                  filled
                  dark
                  color="primary"
                  class="q-mb-sm"
                />
                <div class="item-row">
                  <q-input
                    v-model.number="item.quantity"
                    label="Qty"
                    type="number"
                    filled
                    dark
                    color="primary"
                    min="1"
                  />
                  <q-input
                    v-model.number="item.rate"
                    label="Rate"
                    type="number"
                    filled
                    dark
                    color="primary"
                    min="0"
                    step="0.01"
                  />
                  <q-input
                    :model-value="(item.quantity * item.rate).toFixed(2)"
                    label="Amount"
                    filled
                    dark
                    color="primary"
                    readonly
                  />
                  <q-btn
                    flat
                    icon="delete"
                    @click="removeItem(index)"
                    color="negative"
                    size="md"
                  />
                </div>
              </div>
              
              <q-btn
                flat
                label="Add Item"
                @click="addItem"
                color="primary"
                class="q-mt-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${{ calculateSubtotal().toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>Discount ({{ quote.discountPercent }}%):</span>
                <span>-${{ calculateDiscount().toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>Tax ({{ quote.taxRate }}%):</span>
                <span>${{ calculateTax().toFixed(2) }}</span>
              </div>
              <div class="total-row highlight">
                <span>Total:</span>
                <span>${{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>

            <div class="notes-section q-mt-md">
              <q-input
                v-model="quote.notes"
                label="Terms & Conditions"
                type="textarea"
                filled
                dark
                color="primary"
                rows="3"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="generatedQuote" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Quote Generated Successfully!</h3>
          <p>Total: ${{ calculateTotal().toFixed(2) }}</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Quote PDF"
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

const quote = ref({
  companyName: '',
  companyAddress: '',
  companyEmail: '',
  clientName: '',
  clientAddress: '',
  quoteNumber: 'QT-001',
  quoteDate: new Date().toISOString().split('T')[0],
  validUntil: '',
  items: [
    { description: 'Product/Service', quantity: 1, rate: 0 }
  ],
  discountPercent: 0,
  taxRate: 10,
  notes: 'This quote is valid for 30 days. Payment terms: Net 30.'
})

const generatedQuote = ref<Blob | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected() {
  // No file selection needed
}

function addItem() {
  quote.value.items.push({ description: '', quantity: 1, rate: 0 })
}

function removeItem(index: number) {
  if (quote.value.items.length > 1) {
    quote.value.items.splice(index, 1)
  }
}

function calculateSubtotal(): number {
  return quote.value.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
}

function calculateDiscount(): number {
  return calculateSubtotal() * (quote.value.discountPercent / 100)
}

function calculateTax(): number {
  return (calculateSubtotal() - calculateDiscount()) * (quote.value.taxRate / 100)
}

function calculateTotal(): number {
  return calculateSubtotal() - calculateDiscount() + calculateTax()
}

async function generateQuote() {
  error.value = null
  generatedQuote.value = null
  
  if (!quote.value.companyName || !quote.value.clientName) {
    error.value = 'Please fill in company and client names'
    return
  }

  try {
    const doc = new jsPDF()
    let y = 20
    
    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PRICE QUOTE', 20, y)
    y += 10
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(quote.value.companyName, 20, y)
    y += 6
    if (quote.value.companyAddress) {
      doc.text(quote.value.companyAddress, 20, y)
      y += 6
    }
    if (quote.value.companyEmail) {
      doc.text(quote.value.companyEmail, 20, y)
      y += 6
    }
    
    // Quote details
    y += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Quote: ${quote.value.quoteNumber}`, 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${quote.value.quoteDate}`, 20, y)
    y += 6
    if (quote.value.validUntil) {
      doc.text(`Valid Until: ${quote.value.validUntil}`, 20, y)
      y += 6
    }
    
    // Client info
    y += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Quote For:', 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(quote.value.clientName, 20, y)
    y += 6
    if (quote.value.clientAddress) {
      doc.text(quote.value.clientAddress, 20, y)
      y += 6
    }
    
    // Items
    y += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 20, y)
    doc.text('Qty', 100, y)
    doc.text('Rate', 130, y)
    doc.text('Amount', 160, y)
    y += 8
    
    doc.setFont('helvetica', 'normal')
    quote.value.items.forEach(item => {
      doc.text(item.description || 'Item', 20, y)
      doc.text(String(item.quantity), 100, y)
      doc.text(`$${item.rate.toFixed(2)}`, 130, y)
      doc.text(`$${(item.quantity * item.rate).toFixed(2)}`, 160, y)
      y += 8
    })
    
    // Totals
    y += 10
    doc.text(`Subtotal: $${calculateSubtotal().toFixed(2)}`, 130, y)
    y += 6
    if (quote.value.discountPercent > 0) {
      doc.text(`Discount (${quote.value.discountPercent}%): -$${calculateDiscount().toFixed(2)}`, 130, y)
      y += 6
    }
    doc.text(`Tax (${quote.value.taxRate}%): $${calculateTax().toFixed(2)}`, 130, y)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Total: $${calculateTotal().toFixed(2)}`, 130, y)
    
    // Notes
    if (quote.value.notes) {
      y += 20
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Terms & Conditions:', 20, y)
      y += 6
      const lines = doc.splitTextToSize(quote.value.notes, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, y)
        y += 6
      })
    }
    
    const output = doc.output('arraybuffer')
    generatedQuote.value = new Blob([output], { type: 'application/pdf' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate quote'
  }
}

function downloadResult() {
  if (!generatedQuote.value) return

  const url = URL.createObjectURL(generatedQuote.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `quote-${quote.value.quoteNumber}.pdf`
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

.line-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  margin-bottom: 12px;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 8px;
  align-items: end;
}

.totals {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #a0a0a0;
}

.total-row.highlight {
  color: #ffffff;
  font-weight: 600;
  font-size: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  padding-top: 12px;
}
</style>
