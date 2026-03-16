/**
 * rMQR (Rectangular Micro QR Code) encoder — ISO/IEC 23941
 * Rectangular QR code for constrained spaces (medical tubes, PCB, tickets)
 *
 * Features:
 * - 32 symbol sizes from R7x43 to R17x139
 * - Single finder pattern (top-left) + alignment patterns
 * - EC levels M and H only
 * - Numeric, alphanumeric, byte, kanji modes
 */

import { InvalidInputError, CapacityError } from "../errors";
import { encodeNumericData, encodeAlphanumericData, encodeByteData, pushBits } from "./qr/mode";
import { generateECCodewords } from "./qr/reed-solomon";

// rMQR symbol sizes: [rows, cols, dataCW_M, dataCW_H, ecCW_M, ecCW_H]
const RMQR_SIZES: [number, number, number, number, number, number][] = [
  [7, 43, 6, 4, 4, 6], // 0: R7x43
  [7, 59, 12, 8, 6, 10], // 1: R7x59
  [7, 77, 20, 14, 8, 14], // 2: R7x77
  [7, 99, 28, 20, 12, 20], // 3: R7x99
  [7, 139, 44, 32, 16, 28], // 4: R7x139
  [9, 43, 10, 6, 6, 10], // 5: R9x43
  [9, 59, 18, 12, 8, 14], // 6: R9x59
  [9, 77, 28, 20, 12, 20], // 7: R9x77
  [9, 99, 40, 28, 16, 28], // 8: R9x99
  [9, 139, 62, 44, 22, 40], // 9: R9x139
  [11, 27, 6, 4, 4, 6], // 10: R11x27
  [11, 43, 14, 10, 8, 12], // 11: R11x43
  [11, 59, 24, 16, 10, 18], // 12: R11x59
  [11, 77, 36, 26, 14, 24], // 13: R11x77
  [11, 99, 52, 36, 20, 36], // 14: R11x99
  [11, 139, 80, 56, 28, 52], // 15: R11x139
  [13, 27, 8, 6, 6, 8], // 16: R13x27
  [13, 43, 18, 12, 10, 16], // 17: R13x43
  [13, 59, 30, 22, 14, 22], // 18: R13x59
  [13, 77, 46, 32, 18, 32], // 19: R13x77
  [13, 99, 66, 46, 24, 44], // 20: R13x99
  [13, 139, 100, 72, 36, 64], // 21: R13x139
  [15, 43, 22, 16, 12, 18], // 22: R15x43
  [15, 59, 38, 26, 16, 28], // 23: R15x59
  [15, 77, 56, 40, 22, 38], // 24: R15x77
  [15, 99, 80, 56, 28, 52], // 25: R15x99
  [15, 139, 122, 88, 42, 76], // 26: R15x139
  [17, 43, 28, 20, 14, 22], // 27: R17x43
  [17, 59, 44, 32, 20, 32], // 28: R17x59
  [17, 77, 66, 48, 26, 44], // 29: R17x77
  [17, 99, 96, 68, 34, 62], // 30: R17x99
  [17, 139, 146, 104, 50, 92], // 31: R17x139
];

// rMQR mode indicators (3 bits each, per ISO/IEC 23941)
const RMQR_MODE_NUMERIC = 0b001;
const RMQR_MODE_ALPHANUMERIC = 0b010;
const RMQR_MODE_BYTE = 0b011;
// const RMQR_MODE_KANJI = 0b100;

/**
 * Character count indicator bit lengths per version index (ISO/IEC 23941 Table 3)
 * Each entry: [numeric, alphanumeric, byte, kanji]
 */
const RMQR_CCI_LENGTHS: [number, number, number, number][] = [
  [4, 3, 3, 2], // 0: R7x43
  [5, 5, 4, 3], // 1: R7x59
  [6, 5, 5, 4], // 2: R7x77
  [7, 6, 5, 5], // 3: R7x99
  [7, 6, 6, 5], // 4: R7x139
  [5, 5, 4, 3], // 5: R9x43
  [6, 5, 5, 4], // 6: R9x59
  [7, 6, 5, 5], // 7: R9x77
  [7, 6, 6, 5], // 8: R9x99
  [8, 7, 6, 6], // 9: R9x139
  [4, 4, 3, 2], // 10: R11x27
  [6, 5, 5, 4], // 11: R11x43
  [7, 6, 5, 5], // 12: R11x59
  [7, 6, 6, 5], // 13: R11x77
  [8, 7, 6, 6], // 14: R11x99
  [8, 7, 7, 6], // 15: R11x139
  [5, 5, 4, 3], // 16: R13x27
  [6, 6, 5, 5], // 17: R13x43
  [7, 6, 6, 5], // 18: R13x59
  [7, 7, 6, 6], // 19: R13x77
  [8, 7, 7, 6], // 20: R13x99
  [8, 8, 7, 7], // 21: R13x139
  [7, 6, 6, 5], // 22: R15x43
  [7, 7, 6, 5], // 23: R15x59
  [8, 7, 7, 6], // 24: R15x77
  [8, 7, 7, 6], // 25: R15x99
  [9, 8, 7, 7], // 26: R15x139
  [7, 6, 6, 5], // 27: R17x43
  [8, 7, 6, 6], // 28: R17x59
  [8, 7, 7, 6], // 29: R17x77
  [8, 8, 7, 6], // 30: R17x99
  [9, 8, 8, 7], // 31: R17x139
];

export interface RMQROptions {
  ecLevel?: "M" | "H";
  version?: number; // index into RMQR_SIZES (0-31)
}

/**
 * Encode data bits for a given version index using correct CCI lengths.
 * rMQR mode indicators are 3 bits (ISO/IEC 23941):
 *   Numeric=001, Alphanumeric=010, Byte=011, Kanji=100
 */
function encodeRMQRData(
  text: string,
  versionIdx: number,
  mode: "numeric" | "alphanumeric" | "byte",
): number[] {
  const cci = RMQR_CCI_LENGTHS[versionIdx]!;
  const bits: number[] = [];
  const data = new TextEncoder().encode(text);

  if (mode === "numeric") {
    pushBits(bits, RMQR_MODE_NUMERIC, 3);
    pushBits(bits, text.length, cci[0]);
    bits.push(...encodeNumericData(text));
  } else if (mode === "alphanumeric") {
    pushBits(bits, RMQR_MODE_ALPHANUMERIC, 3);
    pushBits(bits, text.length, cci[1]);
    bits.push(...encodeAlphanumericData(text));
  } else {
    pushBits(bits, RMQR_MODE_BYTE, 3);
    pushBits(bits, data.length, cci[2]);
    bits.push(...encodeByteData(data));
  }

  return bits;
}

/**
 * Encode text as rMQR (Rectangular Micro QR Code)
 * Returns a rectangular boolean matrix
 */
export function encodeRMQR(text: string, options: RMQROptions = {}): boolean[][] {
  if (text.length === 0) {
    throw new InvalidInputError("rMQR input must not be empty");
  }

  const ecLevel = options.ecLevel ?? "M";
  const isNum = /^\d+$/.test(text);
  const isAlpha = !isNum && /^[0-9A-Z $%*+\-./:]+$/.test(text);
  const mode: "numeric" | "alphanumeric" | "byte" = isNum
    ? "numeric"
    : isAlpha
      ? "alphanumeric"
      : "byte";

  // Select symbol size — CCI length depends on version, so iterate to find the
  // smallest version whose data capacity fits the encoded bit stream.
  let sizeIdx = -1;
  let bits: number[] = [];

  if (options.version !== undefined) {
    // User requested a specific version
    sizeIdx = options.version;
    bits = encodeRMQRData(text, sizeIdx, mode);
    const size = RMQR_SIZES[sizeIdx];
    if (!size) {
      throw new CapacityError("Invalid rMQR version index");
    }
    const dataCW = ecLevel === "M" ? size[2] : size[3];
    if (bits.length > dataCW * 8) {
      throw new CapacityError("Data too long for requested rMQR symbol size");
    }
  } else {
    for (let i = 0; i < RMQR_SIZES.length; i++) {
      const size = RMQR_SIZES[i]!;
      const dataCW = ecLevel === "M" ? size[2] : size[3];
      const candidateBits = encodeRMQRData(text, i, mode);
      if (candidateBits.length <= dataCW * 8) {
        sizeIdx = i;
        bits = candidateBits;
        break;
      }
    }
    if (sizeIdx === -1) {
      throw new CapacityError("Data too long for any rMQR symbol size");
    }
  }

  const size = RMQR_SIZES[sizeIdx]!;
  const [rows, cols, dataCW_M, dataCW_H, ecCW_M, ecCW_H] = size;
  const dataCW = ecLevel === "M" ? dataCW_M : dataCW_H;
  const ecCW = ecLevel === "M" ? ecCW_M : ecCW_H;

  // Pad bits to data capacity
  const totalDataBits = dataCW * 8;
  const termLen = Math.min(3, totalDataBits - bits.length);
  pushBits(bits, 0, termLen);
  while (bits.length % 8 !== 0) bits.push(0);
  let toggle = true;
  while (bits.length < totalDataBits) {
    pushBits(bits, toggle ? 236 : 17, 8);
    toggle = !toggle;
  }

  // Convert to bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8 && i + j < bits.length; j++) {
      byte = (byte << 1) | bits[i + j]!;
    }
    dataBytes.push(byte);
  }

  // EC
  const ecBytes = generateECCodewords(dataBytes, ecCW);
  const allBytes = [...dataBytes, ...ecBytes];

  // Build matrix
  const matrix: (boolean | null)[][] = Array.from({ length: rows }, () =>
    Array.from<boolean | null>({ length: cols }).fill(null),
  );

  // Finder pattern (7×7 at top-left)
  for (let r = 0; r < 7 && r < rows; r++) {
    for (let c = 0; c < 7 && c < cols; c++) {
      const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[r]![c] = isOuter || isInner;
    }
  }

  // Separator
  for (let i = 0; i < 8 && i < cols; i++) {
    if (7 < rows && matrix[7]![i] === null) matrix[7]![i] = false;
  }
  for (let i = 0; i < 8 && i < rows; i++) {
    if (7 < cols && matrix[i]![7] === null) matrix[i]![7] = false;
  }

  // Timing patterns
  for (let c = 8; c < cols; c++) {
    if (matrix[0]![c] === null) matrix[0]![c] = c % 2 === 0;
  }
  for (let r = 8; r < rows; r++) {
    if (matrix[r]![0] === null) matrix[r]![0] = r % 2 === 0;
  }

  // Corner finder (bottom-right 5×5)
  const cr = rows - 1;
  const cc = cols - 1;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = cr + r;
      const ccc = cc + c;
      if (rr >= 0 && rr < rows && ccc >= 0 && ccc < cols) {
        const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isCenter = r === 0 && c === 0;
        if (matrix[rr]![ccc] === null) {
          matrix[rr]![ccc] = isOuter || isCenter;
        }
      }
    }
  }

  // Place data
  const allBits: number[] = [];
  for (const byte of allBytes) {
    pushBits(allBits, byte, 8);
  }

  let bitIdx = 0;
  for (let c = cols - 1; c >= 1; c -= 2) {
    for (let r = 0; r < rows; r++) {
      for (const cc2 of [c, c - 1]) {
        if (cc2 >= 0 && matrix[r]![cc2] === null) {
          matrix[r]![cc2] = bitIdx < allBits.length ? allBits[bitIdx]! === 1 : false;
          bitIdx++;
        }
      }
    }
  }

  return matrix.map((row) => row.map((cell) => cell === true));
}
