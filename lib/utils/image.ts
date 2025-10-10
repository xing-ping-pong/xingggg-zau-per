export function optimizedSrc(originalPath: string, preferredWidth = 1024) {
  // Keep API stable:
  // - On server (Node) we can check filesystem to see if optimized files exist.
  // - On client we must NOT require('fs') or other Node modules (will break bundling).
  if (!originalPath || !originalPath.startsWith('/')) return originalPath

  // Server-side: use fs/path to pick an existing optimized file if present
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs')
      const path = require('path')
      const publicDir = path.join(process.cwd(), 'public')
      const optimizedDir = path.join(publicDir, 'optimized')

      if (!fs.existsSync(optimizedDir)) return originalPath

      const name = path.parse(originalPath).name
      const files = fs.readdirSync(optimizedDir)
      const candidates = files.filter((f: string) => f.startsWith(name) && (f.endsWith('.webp') || f.endsWith('.avif')))
      if (candidates.length === 0) return originalPath
      const exact = candidates.find((c: string) => c.includes(`-${preferredWidth}.`))
      const chosen = exact || candidates[0]
      return `/optimized/${chosen}`
    } catch (err) {
      // If something goes wrong on server, fall back to original path
      return originalPath
    }
  }

  // Client-side: avoid Node-only modules. Construct a likely optimized path using naming convention.
  // This will work when optimized files are present at /public/optimized/<name>-<width>.webp
  try {
    const parts = originalPath.split('/')
    const filename = parts[parts.length - 1]
    const nameOnly = filename.replace(/\.[^/.]+$/, '')
    // Use resolver to map small requested widths to available generated widths
    return resolveOptimizedVariant(originalPath, preferredWidth)
  } catch (e) {
    return originalPath
  }
}

/**
 * Resolve an optimized variant for a requested size.
 * Maps requested small widths (like 200) to the nearest available generated widths.
 */
export function resolveOptimizedVariant(originalPath: string, requestedWidth = 200) {
  if (!originalPath || !originalPath.startsWith('/')) return originalPath

  // Normalize name (strip extension, replace spaces)
  const filename = originalPath.split('/').pop() || originalPath
  const nameOnly = filename.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-').toLowerCase()

  // Available generated widths from the optimizer script
  const available = [480, 768, 1024, 1600]

  // Choose the smallest available width that is >= requestedWidth, otherwise the largest available
  const chosenWidth = available.find(w => w >= requestedWidth) ?? available[available.length - 1]

  // Prefer webp in client URLs
  return `/optimized/${nameOnly}-${chosenWidth}.webp`
}
