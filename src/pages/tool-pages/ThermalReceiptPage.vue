<template>
  <BaseToolPage
    title="Thermal Receipt"
    description="Generate thermal printer-style receipts"
    accepted-file-types=""
    action-label="Generate Receipt"
    success-message="Thermal Receipt Generated Successfully!"
    download-filename="thermal-receipt.pdf"
    @files-selected="handleFilesSelected"
    @process-files="generateReceipt"
  >
    <template #upload-section>
      <div class="no-upload-needed">
        <q-icon name="receipt_long" size="48px" color="primary" />
        <p>No file upload needed - fill in the receipt details below</p>
      </div>
    </template>

    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Thermal Receipt Details</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="company-info">
              <label class="field-label">Business Header</label>
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
              <label class="field-label">Receipt Info</label>
              <div class="info-row">
                <q-input
                  v-model="receipt.receiptNumber"
                  label="Receipt #"
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
                <q-input
                  v-model="receipt.receiptTime"
                  label="Time"
                  type="time"
                  filled
                  dark
                  color="primary"
                />
              </div>
              <q-input
                v-model="receipt.cashier"
                label="Cashier"
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
                  label="Item"
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
                    label="Price"
                    type="number"
                    filled
                    dark
                    color="primary"
                    min="0"
                    step="0.01"
                  />
                  <q-input
                    :model-value="(item.quantity * item.unitPrice).toFixed(2)"
                    label="Total"
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
                <span>Tax ({{ receipt.taxRate }}%):</span>
                <span>${{ calculateTax().toFixed(2) }}</span>
              </div>
              <div class="total-row highlight">
                <span>TOTAL:</span>
                <span>${{ calculateTotal().toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>Cash:</span>
                <span>${{ receipt.cashGiven.toFixed(2) }}</span>
              </div>
              <div class="total-row highlight">
                <span>CHANGE:</span>
                <span>${{ calculateChange().toFixed(2) }}</span>
              </div>
            </div>

            <div class="footer-section q-mt-md">
              <q-input
                v-model="receipt.footer"
                label="Footer Message"
                filled
                dark
                color="primary"
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
          <h3>Thermal Receipt Generated Successfully!</h3>
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
  receiptNumber: '001',
  receiptDate: new Date().toISOString().split('T')[0],
  receiptTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
  cashier: '',
  items: [
    { description: 'Item', quantity: 1, unitPrice: 0 }
  ],
  taxRate: 8,
  cashGiven: 0,
  footer: 'Thank you for your business!'
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

function calculateSubtotal(): number {
  return receipt.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
}

function calculateTax(): number {
  return calculateSubtotal() * (receipt.value.taxRate / 100)
}

function calculateTotal(): number {
  return calculateSubtotal() + calculateTax()
}

function calculateChange(): number {
  return receipt.value.cashGiven - calculateTotal()
}

async function generateReceipt() {
  error.value = null
  generatedReceipt.value = null
  
  if (!receipt.value.companyName) {
    error.value = 'Please fill in business name'
    return
  }

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    })
    
    let y = 10
    const width = 80
    const margin = 5
    
    // Header
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(receipt.value.companyName, width / 2, y, { align: 'center' })
    y += 5
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    if (receipt.value.companyAddress) {
      doc.text(receipt.value.companyAddress, width / 2, y, { align: 'center' })
      y += 4
    }
    if (receipt.value.companyPhone) {
      doc.text(receipt.value.companyPhone, width / 2, y, { align: 'center' })
      y += 4
    }
    
    // Divider
    y += 3
    doc.setLineWidth(0.1)
    doc.line(margin, y, width - margin, y)
    y += 5
    
    // Receipt info
    doc.setFontSize(8)
    doc.text(`Receipt #: ${receipt.value.receiptNumber}`, margin, y)
    y += 4
    doc.text(`Date: ${receipt.value.receiptDate} ${receipt.value.receiptTime}`, margin, y)
    y += 4
    if (receipt.value.cashier) {
      doc.text(`Cashier: ${receipt.value.cashier}`, margin, y)
      y += 4
    }
    
    // Divider
    y += 2
    doc.line(margin, y, width - margin, y)
    y += 5
    
    // Items
    doc.setFont('helvetica', 'bold')
    doc.text('ITEM', margin, y)
    doc.text('QTY', margin + 35, y)
    doc.text('PRICE', margin + 45, y)
    doc.text('TOTAL', margin + 58, y)
    y += 4
    
    doc.setFont('helvetica', 'normal')
    receipt.value.items.forEach(item => {
      const desc = (item.description || 'Item').substring(0, 15)
      doc.text(desc, margin, y)
      doc.text(String(item.quantity), margin + 35, y)
      doc.text(`$${item.unitPrice.toFixed(2)}`, margin + 45, y)
      doc.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, margin + 58, y)
      y += 4
    })
    
    // Divider
    y += 2
    doc.line(margin, y, width - margin, y)
    y += 5
    
    // Totals
    doc.text(`Subtotal: $${calculateSubtotal().toFixed(2)}`, margin, y)
    y += 4
    doc.text(`Tax (${receipt.value.taxRate}%): $${calculateTax().toFixed(2)}`, margin, y)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`TOTAL: $${calculateTotal().toFixed(2)}`, margin, y)
    y += 6
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Cash: $${receipt.value.cashGiven.toFixed(2)}`, margin, y)
    y += 4
    doc.text(`Change: $${calculateChange().toFixed(2)}`, margin, y)
    
    // Footer
    y += 8
    doc.line(margin, y, width - margin, y)
    y += 5
    if (receipt.value.footer) {
      doc.text(receipt.value.footer, width / 2, y, { align: 'center' })
    }
    
    const output = doc.output('arraybuffer')
    generatedReceipt.value = new Blob([output], { type: 'application/pdf' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate thermal receipt'
  }
}

function downloadResult() {
  if (!generatedReceipt.value) return

  const url = URL.createObjectURL(generatedReceipt.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `thermal-receipt-${receipt.value.receiptNumber}.pdf`
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
  font-size: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  padding-top: 12px;
}
</style>
