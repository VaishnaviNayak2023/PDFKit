<template>
  <BaseToolPage
    title="Receipt Generator"
    description="Create professional receipts for payments and transactions"
    accepted-file-types=""
    action-label="Generate Receipt"
    success-message="Receipt Generated Successfully!"
    download-filename="receipt.pdf"
    @files-selected="handleFilesSelected"
    @process-files="generateReceipt"
  >
    <template #upload-section>
      <div class="no-upload-needed">
        <q-icon name="receipt" size="48px" color="primary" />
        <p>No file upload needed - fill in the receipt details below</p>
      </div>
    </template>

    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Receipt Details</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="company-info">
              <label class="field-label">Your Business</label>
              <q-input
                v-model="receipt.companyName"
                label="Business Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="receipt.companyAddress"
                label="Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="receipt.companyPhone"
                label="Phone"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="receipt-info">
              <label class="field-label">Receipt Information</label>
              <div class="info-row">
                <q-input
                  v-model="receipt.receiptNumber"
                  label="Receipt Number"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="receipt.receiptDate"
                  label="Date"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
              </div>
              <q-input
                v-model="receipt.receivedFrom"
                label="Received From"
                filled
                dark
                color="primary"
                class="q-mt-md"
              />
              <q-input
                v-model="receipt.paymentMethod"
                label="Payment Method"
                filled
                dark
                color="primary"
                class="q-mt-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="line-items">
              <label class="field-label">Items</label>
              <div v-for="(item, index) in receipt.items" :key="index" class="line-item">
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
                    v-model.number="item.unitPrice"
                    label="Unit Price"
                    type="number"
                    filled
                    dark
                    color="primary"
                    min="0"
                    step="0.01"
                  />
                  <q-input
                    :model-value="(item.quantity * item.unitPrice).toFixed(2)"
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
              <div class="total-row highlight">
                <span>Total Amount:</span>
                <span>${{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>

            <div class="notes-section q-mt-md">
              <q-input
                v-model="receipt.notes"
                label="Notes"
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
      <div v-if="generatedReceipt" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Receipt Generated Successfully!</h3>
          <p>Total: ${{ calculateTotal().toFixed(2) }}</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Receipt PDF"
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

const receipt = ref({
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  receiptNumber: 'RCP-001',
  receiptDate: new Date().toISOString().split('T')[0],
  receivedFrom: '',
  paymentMethod: 'Cash',
  items: [
    { description: 'Product/Service', quantity: 1, unitPrice: 0 }
  ],
  notes: 'Thank you for your payment!'
})

const generatedReceipt = ref<Blob | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected() {
  // No file selection needed
}

function addItem() {
  receipt.value.items.push({ description: '', quantity: 1, unitPrice: 0 })
}

function removeItem(index: number) {
  if (receipt.value.items.length > 1) {
    receipt.value.items.splice(index, 1)
  }
}

function calculateTotal(): number {
  return receipt.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
}

async function generateReceipt() {
  error.value = null
  generatedReceipt.value = null
  
  if (!receipt.value.companyName || !receipt.value.receivedFrom) {
    error.value = 'Please fill in business name and received from fields'
    return
  }

  try {
    const doc = new jsPDF()
    let y = 20
    
    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('RECEIPT', 20, y)
    y += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(receipt.value.companyName, 20, y)
    y += 6
    if (receipt.value.companyAddress) {
      doc.text(receipt.value.companyAddress, 20, y)
      y += 6
    }
    if (receipt.value.companyPhone) {
      doc.text(receipt.value.companyPhone, 20, y)
      y += 6
    }
    
    // Receipt details
    y += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Receipt: ${receipt.value.receiptNumber}`, 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${receipt.value.receiptDate}`, 20, y)
    y += 6
    doc.text(`Received From: ${receipt.value.receivedFrom}`, 20, y)
    y += 6
    doc.text(`Payment Method: ${receipt.value.paymentMethod}`, 20, y)
    
    // Items
    y += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 20, y)
    doc.text('Qty', 100, y)
    doc.text('Unit Price', 130, y)
    doc.text('Amount', 160, y)
    y += 8
    
    doc.setFont('helvetica', 'normal')
    receipt.value.items.forEach(item => {
      doc.text(item.description || 'Item', 20, y)
      doc.text(String(item.quantity), 100, y)
      doc.text(`$${item.unitPrice.toFixed(2)}`, 130, y)
      doc.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, 160, y)
      y += 8
    })
    
    // Total
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Total: $${calculateTotal().toFixed(2)}`, 130, y)
    
    // Notes
    if (receipt.value.notes) {
      y += 20
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Notes:', 20, y)
      y += 6
      const lines = doc.splitTextToSize(receipt.value.notes, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, y)
        y += 6
      })
    }
    
    const output = doc.output('arraybuffer')
    generatedReceipt.value = new Blob([output], { type: 'application/pdf' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate receipt'
  }
}

function downloadResult() {
  if (!generatedReceipt.value) return

  const url = URL.createObjectURL(generatedReceipt.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${receipt.value.receiptNumber}.pdf`
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
