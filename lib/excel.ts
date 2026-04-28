import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'

const EXCEL_DIR  = path.join(process.cwd(), 'data')
const EXCEL_PATH = path.join(EXCEL_DIR, 'orders.xlsx')

export interface OrderRow {
  orderId:         string
  verificationCode: string
  customerName:    string
  customerEmail:   string
  items:           string
  totalAmount:     number
  deliveryAddress: string
  status:          string
  placedAt:        string
}

export function appendOrderToExcel(row: OrderRow): void {
  try {
    if (!fs.existsSync(EXCEL_DIR)) fs.mkdirSync(EXCEL_DIR, { recursive: true })

    let wb: XLSX.WorkBook
    let ws: XLSX.WorkSheet
    let existingData: OrderRow[] = []

    if (fs.existsSync(EXCEL_PATH)) {
      wb = XLSX.readFile(EXCEL_PATH)
      ws = wb.Sheets['Orders']
      if (ws) {
        existingData = XLSX.utils.sheet_to_json<OrderRow>(ws)
      }
    } else {
      wb = XLSX.utils.book_new()
    }

    existingData.push(row)

    ws = XLSX.utils.json_to_sheet(existingData, {
      header: ['orderId','verificationCode','customerName','customerEmail','items','totalAmount','deliveryAddress','status','placedAt'],
    })

    // Style headers
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1')
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c })
      if (!ws[cellAddr]) continue
      ws[cellAddr].s = { font: { bold: true } }
    }

    if (wb.SheetNames.includes('Orders')) {
      wb.Sheets['Orders'] = ws
    } else {
      XLSX.utils.book_append_sheet(wb, ws, 'Orders')
    }

    XLSX.writeFile(wb, EXCEL_PATH)
  } catch {
    // Excel logging failure must never break the main order flow
  }
}

export function generateOrdersExcelBuffer(rows: OrderRow[]): Buffer {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ['orderId','verificationCode','customerName','customerEmail','items','totalAmount','deliveryAddress','status','placedAt'],
  })
  XLSX.utils.book_append_sheet(wb, ws, 'Orders')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
