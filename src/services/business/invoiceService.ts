import type { InvoiceData, GSTInvoiceData, InvoiceLineItem } from '@/types'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function calcLineSubtotal(item: InvoiceLineItem): number {
  return item.quantity * item.unitPrice * (1 - (item.discount ?? 0) / 100)
}

// ─── Invoice Generator ────────────────────────────────────────────────────────

export async function generateInvoice(data: InvoiceData): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const margin = 15
  let y = margin

  // Header background
  doc.setFillColor(17, 17, 17)
  doc.rect(0, 0, 210, 48, 'F')

  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(data.seller.name, margin, y + 10)

  // Invoice label
  doc.setFontSize(26)
  doc.setTextColor(99, 102, 241)
  doc.text('INVOICE', 210 - margin, y + 10, { align: 'right' })

  // Invoice details
  doc.setFontSize(8.5)
  doc.setTextColor(156, 163, 175)
  doc.text(`Invoice #: ${data.invoiceNumber}`, 210 - margin, y + 18, { align: 'right' })
  doc.text(`Date: ${data.invoiceDate}`, 210 - margin, y + 24, { align: 'right' })
  if (data.dueDate) {
    doc.text(`Due: ${data.dueDate}`, 210 - margin, y + 30, { align: 'right' })
  }

  if (data.seller.address) {
    doc.setTextColor(200, 200, 200)
    doc.setFontSize(8)
    doc.text(data.seller.address, margin, y + 18)
    if (data.seller.city) doc.text(data.seller.city, margin, y + 23)
    if (data.seller.email) doc.text(data.seller.email, margin, y + 28)
  }

  y = 54

  // FROM / BILL TO
  doc.setTextColor(107, 114, 128)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('FROM', margin, y)
  doc.text('BILL TO', 110, y)

  y += 5
  doc.setTextColor(17, 17, 17)
  doc.setFontSize(10)
  doc.text(data.seller.name, margin, y)
  doc.text(data.buyer.name, 110, y)

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(75, 85, 99)

  const sellerLines = [data.seller.address, data.seller.city, data.seller.email, data.seller.phone].filter(Boolean) as string[]
  const buyerLines = [data.buyer.address, data.buyer.city, data.buyer.email, data.buyer.phone].filter(Boolean) as string[]
  const maxLines = Math.max(sellerLines.length, buyerLines.length)

  for (let i = 0; i < maxLines; i++) {
    if (sellerLines[i]) doc.text(sellerLines[i], margin, y)
    if (buyerLines[i]) doc.text(buyerLines[i], 110, y)
    y += 5
  }

  y += 8

  // Line items header
  doc.setFillColor(246, 247, 250)
  doc.rect(margin, y, 180, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(17, 17, 17)
  doc.text('Description', margin + 2, y + 5.5)
  doc.text('Qty', 120, y + 5.5, { align: 'right' })
  doc.text('Rate', 145, y + 5.5, { align: 'right' })
  doc.text('Tax%', 162, y + 5.5, { align: 'right' })
  doc.text('Amount', 195, y + 5.5, { align: 'right' })
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(55, 65, 81)

  let subtotal = 0
  let totalTax = 0

  for (const item of data.lineItems) {
    if (y > 255) {
      doc.addPage()
      y = 20
    }

    const lineSubtotal = calcLineSubtotal(item)
    const effectiveTaxRate = item.taxRate ?? data.taxRate ?? 0
    const lineTax = lineSubtotal * (effectiveTaxRate / 100)
    const lineTotal = lineSubtotal + lineTax
    subtotal += lineSubtotal
    totalTax += lineTax

    doc.setDrawColor(229, 231, 235)
    doc.line(margin, y + 7, 195, y + 7)

    const desc = doc.splitTextToSize(item.description, 60)
    doc.text(desc, margin + 2, y + 5)
    doc.text(String(item.quantity), 120, y + 5, { align: 'right' })
    doc.text(formatCurrency(item.unitPrice, data.currency), 145, y + 5, { align: 'right' })
    doc.text(`${effectiveTaxRate}%`, 162, y + 5, { align: 'right' })
    doc.text(formatCurrency(lineTotal, data.currency), 195, y + 5, { align: 'right' })
    y += Math.max(8, desc.length * 5)
  }

  y += 6

  // Totals section
  const tX = 135
  const totalDiscount = subtotal * ((data.discountRate ?? 0) / 100)
  const grandTotal = subtotal - totalDiscount + totalTax

  const addTotalRow = (label: string, amount: number, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(9)
    doc.setTextColor(bold ? 17 : 107, bold ? 17 : 114, bold ? 17 : 128)
    doc.text(label, tX, y)
    doc.text(formatCurrency(amount, data.currency), 195, y, { align: 'right' })
    y += 6
  }

  addTotalRow('Subtotal:', subtotal)
  if (totalDiscount > 0) addTotalRow(`Discount (${data.discountRate}%):`, -totalDiscount)
  if (totalTax > 0) addTotalRow('Total Tax:', totalTax)

  // Grand total row
  doc.setFillColor(99, 102, 241)
  doc.roundedRect(tX - 2, y - 1, 62, 9, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL DUE:', tX, y + 5.5)
  doc.text(formatCurrency(grandTotal, data.currency), 195, y + 5.5, { align: 'right' })
  y += 15

  // Notes
  if (data.notes) {
    doc.setDrawColor(229, 231, 235)
    doc.line(margin, y, 195, y)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('NOTES', margin, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    const noteLines = doc.splitTextToSize(data.notes, 180)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 4.5
  }

  if (data.termsAndConditions) {
    y += 3
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('TERMS & CONDITIONS', margin, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    const tncLines = doc.splitTextToSize(data.termsAndConditions, 180)
    doc.text(tncLines, margin, y)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text('Thank you for your business!', 105, 287, { align: 'center' })
  doc.text(`Generated by PDFKit — ${new Date().toLocaleDateString()}`, 105, 291, { align: 'center' })

  const output = doc.output('arraybuffer')
  return new Uint8Array(output as ArrayBuffer)
}

// ─── GST Invoice Generator ────────────────────────────────────────────────────

export async function generateGSTInvoice(data: GSTInvoiceData): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const margin = 12
  let y = margin

  // Header
  doc.setFillColor(17, 17, 17)
  doc.rect(0, 0, 210, 52, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('TAX INVOICE', 105, y + 10, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(156, 163, 175)
  doc.text('(Original for Recipient)', 105, y + 16, { align: 'center' })

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(data.seller.name, margin, y + 25)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 200)
  doc.text(`GSTIN: ${data.sellerGSTIN}`, margin, y + 31)
  if (data.seller.address) doc.text(data.seller.address, margin, y + 36)
  if (data.seller.phone) doc.text(`Tel: ${data.seller.phone}`, margin, y + 41)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8.5)
  doc.text(`Invoice No: ${data.invoiceNumber}`, 210 - margin, y + 25, { align: 'right' })
  doc.text(`Date: ${data.invoiceDate}`, 210 - margin, y + 31, { align: 'right' })
  doc.text(`Place of Supply: ${data.placeOfSupply}`, 210 - margin, y + 37, { align: 'right' })
  if (data.dueDate) doc.text(`Due Date: ${data.dueDate}`, 210 - margin, y + 43, { align: 'right' })

  y = 57

  // Buyer section
  doc.setDrawColor(229, 231, 235)
  doc.rect(margin, y, 180, 28)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(107, 114, 128)
  doc.text('BILL TO / SHIP TO', margin + 2, y + 5)
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(17, 17, 17)
  doc.text(data.buyer.name, margin + 2, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(75, 85, 99)
  if (data.buyer.address) { doc.text(data.buyer.address, margin + 2, y); y += 4 }
  if (data.buyer.city) { doc.text(data.buyer.city, margin + 2, y); y += 4 }
  if (data.buyerGSTIN) { doc.text(`GSTIN: ${data.buyerGSTIN}`, margin + 2, y); y += 4 }

  y += 6

  // Items table
  const hasCGSTSGST = !data.isIGST

  // Table columns
  const cols = hasCGSTSGST
    ? { desc: 55, hsn: 15, qty: 10, rate: 18, taxable: 20, cgst: 18, sgst: 18, total: 22 }
    : { desc: 60, hsn: 15, qty: 12, rate: 20, taxable: 22, igst: 25, total: 26 }

  const tableW = 186

  // Header row
  doc.setFillColor(246, 247, 250)
  doc.rect(margin, y, tableW, 9, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(17, 17, 17)

  let cx = margin + 1
  doc.text('#', cx, y + 6)
  cx += 5
  doc.text('Description', cx, y + 6)
  cx += cols.desc
  doc.text('HSN/SAC', cx, y + 6)
  cx += cols.hsn
  doc.text('Qty', cx, y + 6, { align: 'right' })
  cx += cols.qty
  doc.text('Rate', cx, y + 6, { align: 'right' })
  cx += cols.rate
  doc.text('Taxable', cx, y + 6, { align: 'right' })
  cx += cols.taxable

  if (hasCGSTSGST) {
    doc.text(`CGST ${data.cgstRate ?? 9}%`, cx, y + 6, { align: 'right' })
    cx += cols.cgst
    doc.text(`SGST ${data.sgstRate ?? 9}%`, cx, y + 6, { align: 'right' })
    cx += cols.sgst
  } else {
    doc.text(`IGST ${data.igstRate ?? 18}%`, cx, y + 6, { align: 'right' })
    cx += (cols as any).igst
  }
  doc.text('Total', 210 - margin - 2, y + 6, { align: 'right' })

  y += 9

  doc.setFont('helvetica', 'normal')
  let taxableTotal = 0
  let cgstTotal = 0
  let sgstTotal = 0
  let igstTotal = 0

  data.lineItems.forEach((item, rowIdx) => {
    if (y > 250) { doc.addPage(); y = 20 }

    const taxableAmt = item.quantity * item.unitPrice * (1 - (item.discount ?? 0) / 100)
    const cgstAmt = hasCGSTSGST ? taxableAmt * ((data.cgstRate ?? 9) / 100) : 0
    const sgstAmt = hasCGSTSGST ? taxableAmt * ((data.sgstRate ?? 9) / 100) : 0
    const igstAmt = !hasCGSTSGST ? taxableAmt * ((data.igstRate ?? 18) / 100) : 0
    const rowTotal = taxableAmt + cgstAmt + sgstAmt + igstAmt

    taxableTotal += taxableAmt
    cgstTotal += cgstAmt
    sgstTotal += sgstAmt
    igstTotal += igstAmt

    doc.setDrawColor(240, 240, 240)
    doc.line(margin, y + 7, 210 - margin + 6, y + 7)

    cx = margin + 1
    doc.setFontSize(7.5)
    doc.setTextColor(55, 65, 81)
    doc.text(String(rowIdx + 1), cx, y + 5)
    cx += 5
    const descLines = doc.splitTextToSize(item.description, cols.desc - 2)
    doc.text(descLines, cx, y + 5)
    cx += cols.desc
    doc.text(data.hsnSacCode ?? '-', cx, y + 5)
    cx += cols.hsn
    doc.text(String(item.quantity), cx, y + 5, { align: 'right' })
    cx += cols.qty
    doc.text(item.unitPrice.toFixed(2), cx, y + 5, { align: 'right' })
    cx += cols.rate
    doc.text(taxableAmt.toFixed(2), cx, y + 5, { align: 'right' })
    cx += cols.taxable

    if (hasCGSTSGST) {
      doc.text(cgstAmt.toFixed(2), cx, y + 5, { align: 'right' })
      cx += cols.cgst
      doc.text(sgstAmt.toFixed(2), cx, y + 5, { align: 'right' })
    } else {
      doc.text(igstAmt.toFixed(2), cx, y + 5, { align: 'right' })
    }
    doc.text(rowTotal.toFixed(2), 210 - margin - 2, y + 5, { align: 'right' })

    y += Math.max(8, descLines.length * 4.5)
  })

  y += 4

  // Tax summary
  const grandTotal = taxableTotal + cgstTotal + sgstTotal + igstTotal

  doc.setDrawColor(220, 220, 220)
  doc.line(margin, y, 210 - margin + 6, y)
  y += 4

  const tX = 125
  const addRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(bold ? 17 : 107, bold ? 17 : 114, bold ? 17 : 128)
    doc.text(label, tX, y)
    doc.text(value, 210 - margin - 2, y, { align: 'right' })
    y += 6
  }

  addRow('Taxable Amount:', `₹ ${taxableTotal.toFixed(2)}`)

  if (hasCGSTSGST) {
    addRow(`CGST @ ${data.cgstRate ?? 9}%:`, `₹ ${cgstTotal.toFixed(2)}`)
    addRow(`SGST @ ${data.sgstRate ?? 9}%:`, `₹ ${sgstTotal.toFixed(2)}`)
  } else {
    addRow(`IGST @ ${data.igstRate ?? 18}%:`, `₹ ${igstTotal.toFixed(2)}`)
  }

  // Grand total
  doc.setFillColor(99, 102, 241)
  doc.roundedRect(tX - 2, y - 1, 87, 9, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Grand Total:', tX, y + 5.5)
  doc.text(`₹ ${grandTotal.toFixed(2)}`, 210 - margin - 2, y + 5.5, { align: 'right' })
  y += 15

  // Notes
  if (data.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('NOTES', margin, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    const noteLines = doc.splitTextToSize(data.notes, 180)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 4 + 6
  }

  // Declaration
  y = Math.max(y, 255)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text('Declaration: We declare that this invoice shows the actual price of the goods/services described', margin, y)
  doc.text('and that all particulars are true and correct.', margin, y + 4)

  // Signature block
  doc.line(140, 270, 197, 270)
  doc.setFontSize(8)
  doc.text(`For ${data.seller.name}`, 168, 275, { align: 'center' })
  doc.text('Authorised Signatory', 168, 279, { align: 'center' })

  // Footer
  doc.setFontSize(7.5)
  doc.setTextColor(156, 163, 175)
  doc.text('This is a computer generated invoice — PDFKit', 105, 287, { align: 'center' })

  const output = doc.output('arraybuffer')
  return new Uint8Array(output as ArrayBuffer)
}

// ─── Receipt Generator ────────────────────────────────────────────────────────

export async function generateReceipt(data: Partial<InvoiceData>): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 160] })

  const margin = 5
  let y = margin + 2

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(data.seller?.name ?? 'Business', 40, y, { align: 'center' })
  y += 6

  if (data.seller?.address) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(data.seller.address, 40, y, { align: 'center' })
    y += 4
  }

  doc.setFontSize(9)
  doc.text('RECEIPT', 40, y, { align: 'center' })
  y += 4
  doc.text(`#${data.invoiceNumber ?? '001'}`, 40, y, { align: 'center' })
  y += 4
  doc.text(data.invoiceDate ?? new Date().toLocaleDateString(), 40, y, { align: 'center' })
  y += 6

  doc.line(margin, y, 75, y)
  y += 4

  doc.setFontSize(8)
  for (const item of (data.lineItems ?? [])) {
    const total = item.quantity * item.unitPrice
    doc.text(item.description.slice(0, 28), margin, y)
    doc.text(total.toFixed(2), 75, y, { align: 'right' })
    if (item.quantity !== 1) {
      y += 3.5
      doc.setTextColor(107, 114, 128)
      doc.text(`  ${item.quantity} × ${item.unitPrice.toFixed(2)}`, margin, y)
      doc.setTextColor(17, 17, 17)
    }
    y += 5
  }

  y += 2
  doc.line(margin, y, 75, y)
  y += 5

  const grand = (data.lineItems ?? []).reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL', margin, y)
  doc.text(grand.toFixed(2), 75, y, { align: 'right' })
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Thank you for your business!', 40, y, { align: 'center' })

  const output = doc.output('arraybuffer')
  return new Uint8Array(output as ArrayBuffer)
}
