<template>
  <BaseToolPage
    title="Invoice Generator"
    description="Create professional invoices and download as PDF"
    accepted-file-types=""
    action-label="Generate Invoice"
    success-message="Invoice Generated Successfully!"
    download-filename="invoice.pdf"
    @files-selected="handleFilesSelected"
    @process-files="generateInvoice"
  >
    <template #upload-section>
      <div class="no-upload-needed">
        <q-icon name="receipt" size="48px" color="primary" />
        <p>No file upload needed - fill in the invoice details below</p>
      </div>
    </template>

    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Invoice Details</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="company-info">
              <label class="field-label">Your Company</label>
              <q-input
                v-model="invoice.companyName"
                label="Company Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="invoice.companyAddress"
                label="Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="invoice.companyEmail"
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
                v-model="invoice.clientName"
                label="Client Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="invoice.clientAddress"
                label="Client Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="invoice-info">
              <label class="field-label">Invoice Information</label>
              <div class="info-row">
                <q-input
                  v-model="invoice.invoiceNumber"
                  label="Invoice Number"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="invoice.invoiceDate"
                  label="Invoice Date"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="invoice.dueDate"
                  label="Due Date"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="line-items">
              <label class="field-label">Line Items</label>
              <div v-for="(item, index) in invoice.items" :key="index" class="line-item">
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
                <span>Tax ({{ invoice.taxRate }}%):</span>
                <span>${{ calculateTax().toFixed(2) }}</span>
              </div>
              <div class="total-row highlight">
                <span>Total:</span>
                <span>${{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>

            <div class="notes-section q-mt-md">
              <q-input
                v-model="invoice.notes"
                label="Notes / Terms"
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
      <div v-if="generatedInvoice" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Invoice Generated Successfully!</h3>
          <p>Total: ${{ calculateTotal().toFixed(2) }}</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Invoice PDF"
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

const invoice = ref({
  companyName: '',
  companyAddress: '',
  companyEmail: '',
  clientName: '',
  clientAddress: '',
  invoiceNumber: 'INV-001',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  taxRate: 10,
  items: [
    { description: 'Product/Service', quantity: 1, rate: 0 }
  ],
  notes: 'Payment due within 30 days. Thank you for your business!'
})

const generatedInvoice = ref<Blob | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected() {
  // No file selection needed for invoice generator
}

function addItem() {
  invoice.value.items.push({ description: '', quantity: 1, rate: 0 })
}

function removeItem(index: number) {
  if (invoice.value.items.length > 1) {
    invoice.value.items.splice(index, 1)
  }
}

function calculateSubtotal(): number {
  return invoice.value.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
}

function calculateTax(): number {
  return calculateSubtotal() * (invoice.value.taxRate / 100)
}

function calculateTotal(): number {
  return calculateSubtotal() + calculateTax()
}

async function generateInvoice() {
  error.value = null
  generatedInvoice.value = null
  
  if (!invoice.value.companyName || !invoice.value.clientName) {
    error.value = 'Please fill in company and client names'
    return
  }

  try {
    const doc = new jsPDF()
    let y = 20
    
    // Company header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(invoice.value.companyName, 20, y)
    y += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (invoice.value.companyAddress) {
      doc.text(invoice.value.companyAddress, 20, y)
      y += 6
    }
    if (invoice.value.companyEmail) {
      doc.text(invoice.value.companyEmail, 20, y)
      y += 6
    }
    
    // Invoice details
    y += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Invoice: ${invoice.value.invoiceNumber}`, 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${invoice.value.invoiceDate}`, 20, y)
    y += 6
    if (invoice.value.dueDate) {
      doc.text(`Due: ${invoice.value.dueDate}`, 20, y)
      y += 6
    }
    
    // Client info
    y += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(invoice.value.clientName, 20, y)
    y += 6
    if (invoice.value.clientAddress) {
      doc.text(invoice.value.clientAddress, 20, y)
      y += 6
    }
    
    // Line items
    y += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 20, y)
    doc.text('Qty', 100, y)
    doc.text('Rate', 130, y)
    doc.text('Amount', 160, y)
    y += 8
    
    doc.setFont('helvetica', 'normal')
    invoice.value.items.forEach(item => {
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
    doc.text(`Tax (${invoice.value.taxRate}%): $${calculateTax().toFixed(2)}`, 130, y)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Total: $${calculateTotal().toFixed(2)}`, 130, y)
    
    // Notes
    if (invoice.value.notes) {
      y += 20
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Notes:', 20, y)
      y += 6
      const lines = doc.splitTextToSize(invoice.value.notes, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, y)
        y += 6
      })
    }
    
    const output = doc.output('arraybuffer')
    generatedInvoice.value = new Blob([output], { type: 'application/pdf' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate invoice'
  }
}

function downloadResult() {
  if (!generatedInvoice.value) return

  const url = URL.createObjectURL(generatedInvoice.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${invoice.value.invoiceNumber}.pdf`
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
