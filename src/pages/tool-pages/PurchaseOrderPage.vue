<template>
  <BaseToolPage
    title="Purchase Order"
    description="Create professional purchase orders for suppliers"
    accepted-file-types=""
    action-label="Generate PO"
    success-message="Purchase Order Generated Successfully!"
    download-filename="purchase-order.pdf"
    @files-selected="handleFilesSelected"
    @process-files="generatePO"
  >
    <template #upload-section>
      <div class="no-upload-needed">
        <q-icon name="shopping_cart" size="48px" color="primary" />
        <p>No file upload needed - fill in the PO details below</p>
      </div>
    </template>

    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Purchase Order Details</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="company-info">
              <label class="field-label">Your Company (Buyer)</label>
              <q-input
                v-model="po.buyerName"
                label="Company Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="po.buyerAddress"
                label="Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="po.buyerEmail"
                label="Email"
                type="email"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="supplier-info">
              <label class="field-label">Supplier (Vendor)</label>
              <q-input
                v-model="po.supplierName"
                label="Supplier Name"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="po.supplierAddress"
                label="Supplier Address"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              <q-input
                v-model="po.supplierContact"
                label="Contact Person"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="po-info">
              <label class="field-label">PO Information</label>
              <div class="info-row">
                <q-input
                  v-model="po.poNumber"
                  label="PO Number"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="po.poDate"
                  label="PO Date"
                  type="date"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model="po.deliveryDate"
                  label="Delivery Date"
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
              <div v-for="(item, index) in po.items" :key="index" class="line-item">
                <q-input
                  v-model="item.description"
                  label="Item Description"
                  filled
                  dark
                  color="primary"
                  class="q-mb-sm"
                />
                <q-input
                  v-model="item.sku"
                  label="SKU/Part Number"
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
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${{ calculateSubtotal().toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>Tax ({{ po.taxRate }}%):</span>
                <span>${{ calculateTax().toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>Shipping:</span>
                <span>${{ po.shipping.toFixed(2) }}</span>
              </div>
              <div class="total-row highlight">
                <span>Total:</span>
                <span>${{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>

            <div class="notes-section q-mt-md">
              <q-input
                v-model="po.notes"
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
      <div v-if="generatedPO" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Purchase Order Generated Successfully!</h3>
          <p>Total: ${{ calculateTotal().toFixed(2) }}</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download PO PDF"
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

const po = ref({
  buyerName: '',
  buyerAddress: '',
  buyerEmail: '',
  supplierName: '',
  supplierAddress: '',
  supplierContact: '',
  poNumber: 'PO-001',
  poDate: new Date().toISOString().split('T')[0],
  deliveryDate: '',
  items: [
    { description: '', sku: '', quantity: 1, unitPrice: 0 }
  ],
  taxRate: 10,
  shipping: 0,
  notes: 'Please confirm receipt of this order within 48 hours.'
})

const generatedPO = ref<Blob | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected() {
  // No file selection needed
}

function addItem() {
  po.value.items.push({ description: '', sku: '', quantity: 1, unitPrice: 0 })
}

function removeItem(index: number) {
  if (po.value.items.length > 1) {
    po.value.items.splice(index, 1)
  }
}

function calculateSubtotal(): number {
  return po.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
}

function calculateTax(): number {
  return calculateSubtotal() * (po.value.taxRate / 100)
}

function calculateTotal(): number {
  return calculateSubtotal() + calculateTax() + po.value.shipping
}

async function generatePO() {
  error.value = null
  generatedPO.value = null
  
  if (!po.value.buyerName || !po.value.supplierName) {
    error.value = 'Please fill in buyer and supplier names'
    return
  }

  try {
    const doc = new jsPDF()
    let y = 20
    
    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PURCHASE ORDER', 20, y)
    y += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`PO Number: ${po.value.poNumber}`, 20, y)
    y += 6
    doc.text(`Date: ${po.value.poDate}`, 20, y)
    y += 6
    if (po.value.deliveryDate) {
      doc.text(`Delivery Date: ${po.value.deliveryDate}`, 20, y)
      y += 6
    }
    
    // Buyer info
    y += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Buyer:', 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(po.value.buyerName, 20, y)
    y += 6
    if (po.value.buyerAddress) {
      doc.text(po.value.buyerAddress, 20, y)
      y += 6
    }
    if (po.value.buyerEmail) {
      doc.text(po.value.buyerEmail, 20, y)
      y += 6
    }
    
    // Supplier info
    y += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Supplier:', 120, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(po.value.supplierName, 120, y)
    y += 6
    if (po.value.supplierAddress) {
      doc.text(po.value.supplierAddress, 120, y)
      y += 6
    }
    if (po.value.supplierContact) {
      doc.text(po.value.supplierContact, 120, y)
      y += 6
    }
    
    // Items
    y += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 20, y)
    doc.text('SKU', 80, y)
    doc.text('Qty', 120, y)
    doc.text('Unit Price', 140, y)
    doc.text('Amount', 170, y)
    y += 8
    
    doc.setFont('helvetica', 'normal')
    po.value.items.forEach(item => {
      doc.text(item.description || 'Item', 20, y)
      doc.text(item.sku || '-', 80, y)
      doc.text(String(item.quantity), 120, y)
      doc.text(`$${item.unitPrice.toFixed(2)}`, 140, y)
      doc.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, 170, y)
      y += 8
    })
    
    // Totals
    y += 10
    doc.text(`Subtotal: $${calculateSubtotal().toFixed(2)}`, 130, y)
    y += 6
    doc.text(`Tax (${po.value.taxRate}%): $${calculateTax().toFixed(2)}`, 130, y)
    y += 6
    doc.text(`Shipping: $${po.value.shipping.toFixed(2)}`, 130, y)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Total: $${calculateTotal().toFixed(2)}`, 130, y)
    
    // Notes
    if (po.value.notes) {
      y += 20
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Notes / Terms:', 20, y)
      y += 6
      const lines = doc.splitTextToSize(po.value.notes, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, y)
        y += 6
      })
    }
    
    const output = doc.output('arraybuffer')
    generatedPO.value = new Blob([output], { type: 'application/pdf' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate purchase order'
  }
}

function downloadResult() {
  if (!generatedPO.value) return

  const url = URL.createObjectURL(generatedPO.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `po-${po.value.poNumber}.pdf`
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
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
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
