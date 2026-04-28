import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

export interface ReportData {
  generatedAt:   Date
  periodFrom:    Date | null
  periodTo:      Date
  totalOrders:   number
  totalRevenue:  number
  topProducts:   { name: string; qty: number; revenue: number }[]
  statusBreakdown: { status: string; count: number }[]
  dailySummary:  { date: string; orders: number; revenue: number }[]
}

export function generateResetReportPDF(data: ReportData): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const saffron = [245, 158, 11] as [number, number, number]
  const dark    = [41, 37, 36]   as [number, number, number]
  const muted   = [120, 113, 108] as [number, number, number]

  // Header bar
  doc.setFillColor(...saffron)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('HMP Masala', 14, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Business Data Report — Pre-Reset Summary', 14, 20)
  doc.text(`Generated: ${format(data.generatedAt, 'dd MMM yyyy, HH:mm')}`, 210 - 14, 20, { align: 'right' })

  // Report period
  doc.setTextColor(...dark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Report Period', 14, 36)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...muted)
  const from = data.periodFrom ? format(data.periodFrom, 'dd MMM yyyy') : 'Inception'
  const to   = format(data.periodTo, 'dd MMM yyyy')
  doc.text(`${from}  →  ${to}`, 14, 43)

  // Summary boxes
  const boxes = [
    { label: 'Total Orders',  value: String(data.totalOrders) },
    { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Avg Order Value', value: data.totalOrders > 0 ? `₹${(data.totalRevenue / data.totalOrders).toFixed(2)}` : '—' },
  ]
  const boxW = 58, boxH = 20, boxY = 50
  boxes.forEach((b, i) => {
    const x = 14 + i * (boxW + 4)
    doc.setFillColor(255, 251, 235)
    doc.roundedRect(x, boxY, boxW, boxH, 3, 3, 'F')
    doc.setTextColor(...saffron)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(b.value, x + boxW / 2, boxY + 11, { align: 'center' })
    doc.setTextColor(...muted)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(b.label, x + boxW / 2, boxY + 17, { align: 'center' })
  })

  let curY = 78

  // Orders by Status
  doc.setTextColor(...dark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Orders by Status', 14, curY)
  autoTable(doc, {
    startY: curY + 4,
    head:   [['Status', 'Count']],
    body:   data.statusBreakdown.map((s) => [s.status, s.count]),
    theme:  'striped',
    headStyles:  { fillColor: saffron, textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles:  { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  })
  curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  // Top Products
  doc.setTextColor(...dark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Top Products', 14, curY)
  autoTable(doc, {
    startY: curY + 4,
    head:   [['Product', 'Qty Sold', 'Revenue']],
    body:   data.topProducts.map((p) => [p.name, p.qty, `₹${p.revenue.toLocaleString('en-IN')}`]),
    theme:  'striped',
    headStyles:  { fillColor: saffron, textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles:  { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  })
  curY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  // Daily Summary (last 14 days)
  if (data.dailySummary.length > 0) {
    doc.setTextColor(...dark)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Daily Summary', 14, curY)
    autoTable(doc, {
      startY: curY + 4,
      head:   [['Date', 'Orders', 'Revenue']],
      body:   data.dailySummary.map((d) => [d.date, d.orders, `₹${d.revenue.toLocaleString('en-IN')}`]),
      theme:  'striped',
      headStyles:  { fillColor: saffron, textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles:  { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text(
      `HMP Masala — Confidential — Page ${i} of ${pageCount}`,
      105, 290, { align: 'center' }
    )
  }

  return Buffer.from(doc.output('arraybuffer'))
}
