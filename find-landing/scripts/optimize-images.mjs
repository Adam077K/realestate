// One-off image optimizer for the static-export build (no Next optimizer available).
// Converts every referenced raster (png/jpg/jpeg) under public/images to a resized .webp
// sibling, preserving alpha for PNGs. Reference extensions are swapped to .webp afterwards
// and the heavy originals deleted. Run: node scripts/optimize-images.mjs
import sharp from 'sharp'
import { readdirSync, statSync, existsSync } from 'fs'
import { join, extname, dirname, basename } from 'path'

const ROOT = 'public/images'

// Max longest-edge per role (never upscale).
function maxEdgeFor(p) {
  if (p.includes('/logos/')) return 400
  if (p.includes('/clouds/')) return 1600
  if (/buyer-|chevron-|blog-|service-|testimonial|agent-|cta-/.test(p)) return 1200
  if (/hero-tower|hero-building/.test(p)) return 1280
  return 1280
}
function qualityFor(p) {
  if (p.includes('/logos/')) return 88
  return 82
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const files = walk(ROOT).filter((f) => /\.(png|jpe?g)$/i.test(f))
let beforeTotal = 0, afterTotal = 0
const results = []
for (const f of files) {
  const before = statSync(f).size
  beforeTotal += before
  const out = join(dirname(f), basename(f, extname(f)) + '.webp')
  const img = sharp(f)
  const meta = await img.metadata()
  const maxEdge = maxEdgeFor(f)
  const longest = Math.max(meta.width || 0, meta.height || 0)
  const pipeline = sharp(f).rotate()
  if (longest > maxEdge) {
    pipeline.resize({ width: meta.width >= meta.height ? maxEdge : null, height: meta.height > meta.width ? maxEdge : null, withoutEnlargement: true, fit: 'inside' })
  }
  await pipeline.webp({ quality: qualityFor(f), effort: 5 }).toFile(out)
  const after = statSync(out).size
  afterTotal += after
  results.push({ f: f.replace('public', ''), beforeKB: Math.round(before / 1024), afterKB: Math.round(after / 1024) })
}
results.sort((a, b) => b.beforeKB - a.beforeKB)
for (const r of results.slice(0, 30)) console.log(`${r.beforeKB.toString().padStart(5)}KB -> ${r.afterKB.toString().padStart(4)}KB  ${r.f}`)
console.log(`\nTOTAL raster: ${Math.round(beforeTotal / 1024 / 1024 * 10) / 10}MB -> ${Math.round(afterTotal / 1024 / 1024 * 10) / 10}MB webp (${results.length} files)`)
