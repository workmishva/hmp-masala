export function generateOrderCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `HMP${digits}`
}

export function buildWhatsAppUrl(number: string, code: string): string {
  const text = encodeURIComponent(`HMP Masala Order Code: ${code} `)
  return `https://wa.me/${number}?text=${text}`
}
