/**
 * PDF417 SVG renderer
 */

export interface PDF417SVGOptions {
  width?: number
  height?: number
  color?: string
  background?: string
  margin?: number
}

/**
 * Render PDF417 barcode (array of rows, each row is array of bar/space widths)
 */
export function renderPDF417SVG(
  rows: number[][][],
  options: PDF417SVGOptions = {},
): string {
  const {
    width = 400,
    height = 200,
    color = '#000',
    background = '#fff',
    margin = 10,
  } = options

  const numRows = rows.length
  if (numRows === 0) return '<svg xmlns="http://www.w3.org/2000/svg"></svg>'

  const rowHeight = (height - margin * 2) / numRows
  const svgWidth = width
  const svgHeight = height

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">`,
  ]

  if (background !== 'transparent') {
    parts.push(`<rect width="100%" height="100%" fill="${background}"/>`)
  }

  for (let r = 0; r < numRows; r++) {
    const row = rows[r]!
    let x = margin
    const y = margin + r * rowHeight
    let isBar = true

    for (const widths of row) {
      for (const w of widths) {
        if (isBar) {
          parts.push(
            `<rect x="${x}" y="${y}" width="${w}" height="${rowHeight}" fill="${color}"/>`,
          )
        }
        x += w
        isBar = !isBar
      }
    }
  }

  parts.push('</svg>')
  return parts.join('')
}
