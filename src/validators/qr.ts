/**
 * QR Code input validation
 */

import { CapacityError } from '../errors'
import type { ErrorCorrectionLevel } from '../encoders/qr/types'

/** Maximum data capacity per EC level (version 40, byte mode) */
const MAX_BYTE_CAPACITY: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
}

/** Validate QR code input */
export function validateQRInput(
  text: string,
  ecLevel: ErrorCorrectionLevel = 'M',
): { valid: boolean; error?: string } {
  if (text.length === 0) {
    return { valid: false, error: 'Text cannot be empty' }
  }

  const encoded = new TextEncoder().encode(text)
  const maxCapacity = MAX_BYTE_CAPACITY[ecLevel]

  if (encoded.length > maxCapacity) {
    return {
      valid: false,
      error: `Data too long for QR code with EC level ${ecLevel}. Maximum ${maxCapacity} bytes, got ${encoded.length}`,
    }
  }

  return { valid: true }
}
