// Generates PNG icons + favicon.ico for PWA from the SVG brand icon.
// Run: node scripts/gen-icons.mjs
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '../public')
const appDir    = join(__dirname, '../app')

// Source SVG — the clean 512×512 brand icon
const svgSrc = join(publicDir, 'icon-512(2).svg')
const svgBuf = readFileSync(svgSrc)

// 1. PNG icons for manifest + head metadata
const SIZES = [
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of SIZES) {
  await sharp(svgBuf)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, name))
  console.log(`✓ public/${name}  (${size}×${size})`)
}

// 2. favicon.ico (multi-size: 16, 32, 48)
const icoSizes = [16, 32, 48]
const pngBufs  = await Promise.all(
  icoSizes.map(s =>
    sharp(svgBuf).resize(s, s).png().toBuffer()
  )
)
const icoBuf = await pngToIco(pngBufs)
writeFileSync(join(appDir, 'favicon.ico'), icoBuf)
console.log('✓ app/favicon.ico  (16, 32, 48)')

console.log('\nAll icons generated.')
