// One-off: key out the near-white background of the building cutout JPEG → transparent PNG.
// Uses the project's sharp. Feathers the alpha across a brightness band to avoid a hard halo
// against the sky gradient. Interior window highlights are rarely all-channels > 244, so a
// tight threshold avoids punching holes inside the building.
import sharp from 'sharp'

const SRC = process.argv[2]
const OUT = process.argv[3]
if (!SRC || !OUT) {
  console.error('usage: node cutout-building.mjs <src.jpg> <out.png>')
  process.exit(1)
}

const HARD = 246 // >= this on all channels → fully transparent
const SOFT = 232 // between SOFT..HARD → ramp alpha (feather edge)

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
let cleared = 0
for (let i = 0; i < data.length; i += channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2]
  const lo = Math.min(r, g, b)
  // Only treat as background if it is also near-neutral (white), not a warm/bright window.
  const neutral = Math.max(r, g, b) - lo < 14
  if (neutral && lo >= HARD) {
    data[i + 3] = 0
    cleared++
  } else if (neutral && lo >= SOFT) {
    const t = (lo - SOFT) / (HARD - SOFT) // 0..1
    data[i + 3] = Math.round(255 * (1 - t))
  }
}

await sharp(data, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(OUT)

console.log(`wrote ${OUT} — ${width}x${height}, cleared ${cleared} bg px (${((cleared / (width * height)) * 100).toFixed(1)}%)`)
