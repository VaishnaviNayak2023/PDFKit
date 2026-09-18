<template>
  <BaseToolPage
    title="GST Invoice Generator"
    description="Create GST-compliant tax invoices for Indian businesses"
    accepted-file-types=""
    action-label="Generate GST Invoice"
    success-message="GST Invoice Generated Successfully!"
    download-filename="gst-invoice.pdf"
    @files-selected="handleFilesSelected"
    @process-files="generateInvoice"
  >
    <template #upload-section>
      <div class="no-upload-needed">
        <q-icon name="request_quote" size="48px" color="primary" />
        <p>No file upload needed - fill in the GST invoice details below</p>
      </div>
    </template>

    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">GST Invoice Details</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="gst-info">
              <label class="field-label">GST Information</label>
              <q-input
                v-model="gstInvoice.gstNumber"
                label="Your GSTIN"
                filled
                dark
                color="primary"
                class="q-mb-md"
                hint="15-digit GST Identification Number"
              />
              <q-input
                v-model="gstInvoice.companyName"
                label="Company Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="gstInvoice.companyAddress"
                label="Company Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <div class="info-row">
                <q-input
                  v-model="gstInvoice.companyState"
                  label="State"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="gstInvoice.companyStateCode"
                  label="State Code"
                  filled
                  dark
                  color="primary"
                  hint="2-digit state code"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="client-info">
              <label class="field-label">Client Information</label>
              <q-input
                v-model="gstInvoice.clientName"
                label="Client Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="gstInvoice.clientAddress"
                label="Client Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="gstInvoice.clientGstNumber"
                label="Client GSTIN (optional)"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <div class="info-row">
                <q-input
                  v-model="gstInvoice.clientState"
                  label="Client State"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="gstInvoice.clientStateCode"
                  label="Client State Code"
                  filled
                  dark
                  color="primary"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="invoice-info">
              <label class="field-label">Invoice Information</label>
              <div class="info-row">
                <q-input
                  v-model="gstInvoice.invoiceNumber"
                  label="Invoice Number"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="gstInvoice.invoiceDate"
                  label="Invoice Date"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="gstInvoice.dueDate"
                  label="Due Date"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
              </div>
              <div class="supply-type q-mt-md">
                <label class="field-label">Supply Type</label>
                <q-btn-toggle
                  v-model="gstInvoice.supplyType"
                  toggle-color="primary"
                  :options="[
                    { label: 'Intra-State', value: 'intra' },
                    { label: 'Inter-State', value: 'inter' }
                  ]"
                  spread
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="line-items">
              <label class="field-label">Line Items</label>
              <div v-for="(item, index) in gstInvoice.items" :key="index" class="line-item">
                <q-input
                  v-model="item.description"
                  label="Description"
                  filled
                  dark
                  color="primary"
                  class="q-mb-sm"
                />
                <q-input
                  v-model="item.hsnCode"
                  label="HSN/SAC Code"
                  filled
                  dark
                  color="primary"
                  class="q-mb-sm"
                  hint="Harmonized System Nomenclature code"
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

            <div class="gst-totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹{{ calculateSubtotal().toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>CGST ({{ gstInvoice.cgstRate }}%):</span>
                <span>₹{{ calculateCGST().toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>SGST ({{ gstInvoice.sgstRate }}%):</span>
                <span>₹{{ calculateSGST().toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>IGST ({{ gstInvoice.igstRate }}%):</span>
                <span>₹{{ calculateIGST().toFixed(2) }}</span>
              </div>
              <div class="total-row highlight">
                <span>Total:</span>
                <span>₹{{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>

            <div class="bank-details q-mt-md">
              <label class="field-label">Bank Details</label>
              <q-input
                v-model="gstInvoice.bankName"
                label="Bank Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="gstInvoice.accountNumber"
                label="Account Number"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="gstInvoice.ifscCode"
                label="IFSC Code"
                filled
                dark
                color="primary"
                class="q-mb-md"
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
          <h3>GST Invoice Generated Successfully!</h3>
          <p>Total: ₹{{ calculateTotal().toFixed(2) }}</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download GST Invoice PDF"
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

const gstInvoice = ref({
  gstNumber: '',
  companyName: '',
  companyAddress: '',
  companyState: '',
  companyStateCode: '',
  clientName: '',
  clientAddress: '',
  clientGstNumber: '',
  clientState: '',
  clientStateCode: '',
  invoiceNumber: 'GST-001',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  supplyType: 'intra' as 'intra' | 'inter',
  cgstRate: 9,
  sgstRate: 9,
  igstRate: 18,
  items: [
    { description: 'Product/Service', hsnCode: '', quantity: 1, rate: 0 }
  ],
  bankName: '',
  accountNumber: '',
  ifscCode: ''
})

const generatedInvoice = ref<Blob | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected() {
  // No file selection needed for GST invoice generator
}

function addItem() {
  gstInvoice.value.items.push({ description: '', hsnCode: '', quantity: 1, rate: 0 })
}

function removeItem(index: number) {
  if (gstInvoice.value.items.length > 1) {
    gstInvoice.value.items.splice(index, 1)
  }
}

function calculateSubtotal(): number {
  return gstInvoice.value.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
}

function calculateCGST(): number {
  if (gstInvoice.value.supplyType === 'inter') return 0
  return calculateSubtotal() * (gstInvoice.value.cgstRate / 100)
}

function calculateSGST(): number {
  if (gstInvoice.value.supplyType === 'inter') return 0
  return calculateSubtotal() * (gstInvoice.value.sgstRate / 100)
}

function calculateIGST(): number {
  if (gstInvoice.value.supplyType === 'intra') return 0
  return calculateSubtotal() * (gstInvoice.value.igstRate / 100)
}

function calculateTotal(): number {
  return calculateSubtotal() + calculateCGST() + calculateSGST() + calculateIGST()
}

async function generateInvoice() {
  error.value = null
  generatedInvoice.value = null
  
  if (!gstInvoice.value.companyName || !gstInvoice.value.clientName) {
    error.value = 'Please fill in company and client names'
    return
  }

  if (!gstInvoice.value.gstNumber) {
    error.value = 'Please enter your GSTIN'
    return
  }

  try {
    const doc = new jsPDF()
    let y = 20
    
    // Header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('TAX INVOICE', 20, y)
    y += 8
    
    // Company details
    doc.setFontSize(12)
    doc.text(gstInvoice.value.companyName, 20, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`GSTIN: ${gstInvoice.value.gstNumber}`, 20, y)
    y += 6
    if (gstInvoice.value.companyAddress) {
      doc.text(gstInvoice.value.companyAddress, 20, y)
      y += 6
    }
    doc.text(`${gstInvoice.value.companyState} (${gstInvoice.value.companyStateCode})`, 20, y)
    y += 10
    
    // Invoice details
    doc.setFontSize(10)
    doc.text(`Invoice No: ${gstInvoice.value.invoiceNumber}`, 20, y)
    y += 6
    doc.text(`Date: ${gstInvoice.value.invoiceDate}`, 20, y)
    y += 6
    if (gstInvoice.value.dueDate) {
      doc.text(`Due Date: ${gstInvoice.value.dueDate}`, 20, y)
      y += 6
    }
    
    // Client details
    y += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(gstInvoice.value.clientName, 20, y)
    y += 6
    if (gstInvoice.value.clientAddress) {
      doc.text(gstInvoice.value.clientAddress, 20, y)
      y += 6
    }
    if (gstInvoice.value.clientGstNumber) {
      doc.text(`GSTIN: ${gstInvoice.value.clientGstNumber}`, 20, y)
      y += 6
    }
    doc.text(`${gstInvoice.value.clientState} (${gstInvoice.value.clientStateCode})`, 20, y)
    y += 10
    
    // Line items
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 20, y)
    doc.text('HSN/SAC', 80, y)
    doc.text('Qty', 120, y)
    doc.text('Rate', 140, y)
    doc.text('Amount', 170, y)
    y += 8
    
    doc.setFont('helvetica', 'normal')
    gstInvoice.value.items.forEach(item => {
      doc.text(item.description || 'Item', 20, y)
      doc.text(item.hsnCode || '-', 80, y)
      doc.text(String(item.quantity), 120, y)
      doc.text(`₹${item.rate.toFixed(2)}`, 140, y)
      doc.text(`₹${(item.quantity * item.rate).toFixed(2)}`, 170, y)
      y += 8
    })
    
    // GST totals
    y += 10
    doc.text(`Subtotal: ₹${calculateSubtotal().toFixed(2)}`, 130, y)
    y += 6
    if (gstInvoice.value.supplyType === 'intra') {
      doc.text(`CGST (${gstInvoice.value.cgstRate}%): ₹${calculateCGST().toFixed(2)}`, 130, y)
      y += 6
      doc.text(`SGST (${gstInvoice.value.sgstRate}%): ₹${calculateSGST().toFixed(2)}`, 130, y)
    } else {
      doc.text(`IGST (${gstInvoice.value.igstRate}%): ₹${calculateIGST().toFixed(2)}`, 130, y)
      y += 6
    }
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Total: ₹${calculateTotal().toFixed(2)}`, 130, y)
    
    // Bank details
    if (gstInvoice.value.bankName) {
      y += 20
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Bank Details:', 20, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.text(`Bank: ${gstInvoice.value.bankName}`, 20, y)
      y += 6
      doc.text(`A/C: ${gstInvoice.value.accountNumber}`, 20, y)
      y += 6
      doc.text(`IFSC: ${gstInvoice.value.ifscCode}`, 20, y)
    }
    
    const output = doc.output('arraybuffer')
    generatedInvoice.value = new Blob([output], { type: 'application/pdf' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate GST invoice'
  }
}

function downloadResult() {
  if (!generatedInvoice.value) return

  const url = URL.createObjectURL(generatedInvoice.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `gst-invoice-${gstInvoice.value.invoiceNumber}.pdf`
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
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.supply-type {
  margin-top: 16px;
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

.gst-totals {
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

.bank-details {
  margin-top: 16px;
}
</style>
