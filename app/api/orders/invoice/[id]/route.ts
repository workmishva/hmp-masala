export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { format } from 'date-fns'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import User from '@/models/User'

// Colour palette (matches brand)
type RGB = [number, number, number]
const SAFFRON: RGB = [245, 158, 11]
const DARK:    RGB = [41,  37,  36]
const MUTED:   RGB = [120, 113, 108]
const WHITE:   RGB = [255, 255, 255]
const CREAM:   RGB = [255, 251, 235]
const BORDER:  RGB = [231, 229, 228]

// jsPDF doesn't support the rupee Unicode glyph (U+20B9) in built-in fonts
function rs(n: number): string {
  return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function generateInvoicePDF(order: {
  verificationCode: string
  createdAt:        Date
  items:            { name: string; price: number; qty: number; weight?: string }[]
  totalAmount:      number
  deliveryAddress:  string
}, customerName: string, logoBase64: string | null): Buffer {

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: false })
  const pageW = 210

  // ── HEADER BAND ────────────────────────────────────────────────────────────
  doc.setFillColor(...SAFFRON)
  doc.rect(0, 0, pageW, 38, 'F')

  // Logo
  let textStartX = 14
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 12, 6, 26, 26)
      textStartX = 42
    } catch {
      // If logo embed fails, skip it silently
    }
  }

  // Brand name
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('HMP MASALA', textStartX, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Pure Spices. Family Recipe.', textStartX, 25)

  // "INVOICE" label pinned to right
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('INVOICE', pageW - 14, 22, { align: 'right' })

  // ── ORDER META ─────────────────────────────────────────────────────────────
  let y = 50

  // Two-column info block
  const leftCol  = 14
  const rightCol = pageW / 2 + 6

  const labelStyle = () => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
  }
  const valueStyle = () => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...DARK)
  }

  // Left: Customer
  labelStyle(); doc.text('BILL TO', leftCol, y)
  y += 5
  valueStyle(); doc.text(customerName, leftCol, y)

  // Right: Order details
  const metaY = 50
  labelStyle(); doc.text('ORDER CODE', rightCol, metaY)
  valueStyle(); doc.text(order.verificationCode, rightCol, metaY + 5)

  labelStyle(); doc.text('DATE', rightCol + 50, metaY)
  valueStyle(); doc.text(format(new Date(order.createdAt), 'dd MMM yyyy'), rightCol + 50, metaY + 5)

  y = metaY + 18

  // Thin divider
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.4)
  doc.line(14, y, pageW - 14, y)

  y += 8

  // ── ITEMS TABLE ────────────────────────────────────────────────────────────
  const tableBody = order.items.map((item) => [
    item.name,
    item.weight ?? '—',
    rs(item.price),
    String(item.qty),
    rs(item.price * item.qty),
  ])

  autoTable(doc, {
    startY:  y,
    head:    [['Product Name', 'Weight', 'Unit Price', 'Qty', 'Total']],
    body:    tableBody,
    theme:   'striped',
    headStyles: {
      fillColor:   SAFFRON,
      textColor:   WHITE,
      fontSize:    9,
      fontStyle:   'bold',
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize:    9,
      cellPadding: 4,
      textColor:   DARK,
    },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'right',  cellWidth: 32 },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'right',  cellWidth: 32 },
    },
    margin: { left: 14, right: 14 },
  })

  const tableBottom = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

  // ── TOTALS BLOCK ────────────────────────────────────────────────────────────
  const totalItems = order.items.reduce((s, i) => s + i.qty, 0)
  const summaryX   = pageW - 14 - 72
  let   sy         = tableBottom + 8

  doc.setFillColor(...CREAM)
  doc.roundedRect(summaryX, sy - 3, 72, 24, 3, 3, 'F')
  doc.setDrawColor(...SAFFRON)
  doc.setLineWidth(0.5)
  doc.roundedRect(summaryX, sy - 3, 72, 24, 3, 3, 'S')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Total Items:', summaryX + 4, sy + 4)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text(String(totalItems), summaryX + 68, sy + 4, { align: 'right' })

  sy += 9
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Grand Total:', summaryX + 4, sy + 4)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...SAFFRON)
  doc.text(rs(order.totalAmount), summaryX + 68, sy + 4, { align: 'right' })

  // ── DELIVERY ADDRESS ────────────────────────────────────────────────────────
  let addrY = tableBottom + 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('DELIVERY ADDRESS', 14, addrY)

  addrY += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...DARK)
  const wrappedAddr = doc.splitTextToSize(order.deliveryAddress, summaryX - 20)
  doc.text(wrappedAddr, 14, addrY)

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  const footerY = 280
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.3)
  doc.line(14, footerY, pageW - 14, footerY)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Thank you for shopping with HMP Masala! — Pure Spices. Family Recipe.', pageW / 2, footerY + 6, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('mishvapanchani17@gmail.com', pageW / 2, footerY + 12, { align: 'center' })

  return Buffer.from(doc.output('arraybuffer'))
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await connectDB()

    const query: Record<string, unknown> = { _id: id, isVerified: true }
    // Non-admin users can only download their own invoices
    if (session.user.role !== 'admin') {
      query.userId = session.user.id
    }

    const order = await Order.findOne(query).lean()
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Fetch customer name
    const user = await User.findById(order.userId).select('name').lean()
    const customerName = (user as { name?: string } | null)?.name ?? 'Customer'

    // Embed logo as base64 (server-side file read)
    let logoBase64: string | null = null
    try {
      const logoPath = join(process.cwd(), 'public', 'icon-192.png')
      logoBase64 = readFileSync(logoPath).toString('base64')
    } catch {
      // Logo missing — generate invoice without it
    }

    const pdfBuffer = generateInvoicePDF(
      {
        verificationCode: order.verificationCode,
        createdAt:        order.createdAt,
        items:            order.items as { name: string; price: number; qty: number; weight?: string }[],
        totalAmount:      order.totalAmount,
        deliveryAddress:  order.deliveryAddress,
      },
      customerName,
      logoBase64,
    )

    const filename = `HMP-Invoice-${order.verificationCode}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(pdfBuffer.length),
        'Cache-Control':       'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
