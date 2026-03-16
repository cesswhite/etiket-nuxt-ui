/**
 * 1D Barcode SVG renderer (enhanced)
 */

import type { BarcodeSVGOptions } from './types'

/**
 * Render 1D barcode bars as SVG string
 */
export function renderBarcodeSVG(
  bars: number[],
  options: BarcodeSVGOptions = {},
): string {
  const {
    height = 80,
    barWidth = 2,
    color = '#000',
    background = '#fff',
    showText = false,
    text = '',
    fontSize = 14,
    fontFamily = 'monospace',
    margin = 10,
    textAlign = 'center',
    bearerBars = false,
    bearerBarWidth = 4,
  } = options

  // Calculate total width from bar widths
  let totalUnits = 0
  for (const w of bars) totalUnits += w

  const barcodeWidth = totalUnits * barWidth
  const svgWidth = barcodeWidth + margin * 2
  const textHeight = showText ? fontSize + 8 : 0
  const bearerHeight = bearerBars ? bearerBarWidth * 2 : 0
  const svgHeight = height + margin * 2 + textHeight + bearerHeight

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">`,
  ]

  if (background !== 'transparent') {
    parts.push(`<rect width="100%" height="100%" fill="${background}"/>`)
  }

  const barTop = margin + (bearerBars ? bearerBarWidth : 0)
  const barHeight = height

  // Bearer bars (top and bottom, for ITF-14)
  if (bearerBars) {
    parts.push(
      `<rect x="${margin}" y="${margin}" width="${barcodeWidth}" height="${bearerBarWidth}" fill="${color}"/>`,
    )
    parts.push(
      `<rect x="${margin}" y="${barTop + barHeight}" width="${barcodeWidth}" height="${bearerBarWidth}" fill="${color}"/>`,
    )
    // Side bearer bars
    parts.push(
      `<rect x="${margin}" y="${margin}" width="${bearerBarWidth}" height="${barHeight + bearerHeight}" fill="${color}"/>`,
    )
    parts.push(
      `<rect x="${margin + barcodeWidth - bearerBarWidth}" y="${margin}" width="${bearerBarWidth}" height="${barHeight + bearerHeight}" fill="${color}"/>`,
    )
  }

  // Draw bars
  let x = margin
  let isBar = true
  for (const w of bars) {
    const barPixelWidth = w * barWidth
    if (isBar) {
      parts.push(
        `<rect x="${x}" y="${barTop}" width="${barPixelWidth}" height="${barHeight}" fill="${color}"/>`,
      )
    }
    x += barPixelWidth
    isBar = !isBar
  }

  // Text below barcode
  if (showText && text) {
    const textY = barTop + barHeight + (bearerBars ? bearerBarWidth : 0) + fontSize + 4
    let textX: number
    let anchor: string

    switch (textAlign) {
      case 'left':
        textX = margin
        anchor = 'start'
        break
      case 'right':
        textX = svgWidth - margin
        anchor = 'end'
        break
      default:
        textX = svgWidth / 2
        anchor = 'middle'
    }

    parts.push(
      `<text x="${textX}" y="${textY}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}">${escapeXml(text)}</text>`,
    )
  }

  parts.push('</svg>')
  return parts.join('')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
