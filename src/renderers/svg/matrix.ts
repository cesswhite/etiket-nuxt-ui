/**
 * Generic 2D matrix SVG renderer
 * Used for Data Matrix, Aztec, and other 2D codes
 */

export interface MatrixSVGOptions {
  size?: number
  color?: string
  background?: string
  margin?: number // in modules
}

/**
 * Render a 2D boolean matrix as SVG
 */
export function renderMatrixSVG(
  matrix: boolean[][],
  options: MatrixSVGOptions = {},
): string {
  const {
    size = 200,
    color = '#000',
    background = '#fff',
    margin = 2,
  } = options

  const moduleCount = matrix.length
  const totalModules = moduleCount + margin * 2
  const moduleSize = size / totalModules

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
  ]

  if (background !== 'transparent') {
    parts.push(`<rect width="100%" height="100%" fill="${background}"/>`)
  }

  // Draw modules as a single path
  const pathParts: string[] = []
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r]![c]) {
        const x = (c + margin) * moduleSize
        const y = (r + margin) * moduleSize
        pathParts.push(`M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}z`)
      }
    }
  }

  if (pathParts.length > 0) {
    parts.push(`<path d="${pathParts.join('')}" fill="${color}"/>`)
  }

  parts.push('</svg>')
  return parts.join('')
}
