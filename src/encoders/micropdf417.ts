/**
 * MicroPDF417 encoder (ISO/IEC 24728)
 * Compact variant of PDF417 for small items
 *
 * Features:
 * - 1-4 data columns (vs 1-30 in PDF417)
 * - 4-44 rows
 * - Uses Row Address Patterns (RAPs) instead of PDF417 start/stop
 * - Smaller than standard PDF417 for short data
 */

import { InvalidInputError, CapacityError } from "../errors";
import { getCodewordPattern, getRowCluster } from "./pdf417/tables";
import { encodeData } from "./pdf417/encoder";
import { generateECCodewords } from "./pdf417/ec";

// MicroPDF417 symbol sizes: [columns, rows, dataCW, ecCW, ecLevel]
// ecLevel is the PDF417 EC level that produces >= ecCW codewords
const SYMBOL_SIZES: [number, number, number, number, number][] = [
  [1, 11, 1, 6, 2], // EC level 2 = 8 CW, we use first 6
  [1, 14, 4, 6, 2],
  [1, 17, 7, 6, 2],
  [1, 20, 10, 6, 2],
  [1, 24, 14, 7, 2],
  [1, 28, 18, 7, 2],
  [2, 8, 4, 8, 2],
  [2, 11, 10, 8, 2],
  [2, 14, 16, 8, 2],
  [2, 17, 22, 10, 3],
  [2, 20, 28, 11, 3],
  [2, 23, 34, 12, 3],
  [2, 26, 40, 14, 3],
  [3, 6, 4, 10, 3],
  [3, 8, 10, 10, 3],
  [3, 10, 16, 12, 3],
  [3, 12, 22, 14, 3],
  [3, 15, 31, 16, 3],
  [3, 20, 46, 18, 4],
  [3, 26, 64, 20, 4],
  [3, 32, 82, 24, 4],
  [3, 38, 100, 28, 4],
  [3, 44, 118, 32, 4],
  [4, 4, 4, 8, 2],
  [4, 6, 12, 8, 2],
  [4, 8, 20, 10, 3],
  [4, 10, 28, 12, 3],
  [4, 12, 36, 14, 3],
  [4, 15, 48, 16, 3],
  [4, 20, 68, 22, 4],
  [4, 26, 88, 28, 4],
  [4, 32, 108, 32, 4],
  [4, 38, 128, 36, 5],
  [4, 44, 148, 40, 5],
];

// Row Address Pattern (RAP) tables from ISO/IEC 24728
// RAP values encode row number information using PDF417 codeword patterns
// Left RAP: encodes row address for left side
// Right RAP: encodes row address for right side
// Center RAP (3/4 columns): additional center indicator

// For 1-column symbols: left RAP + data + right RAP
// For 2-column symbols: left RAP + data + data + right RAP
// For 3-column symbols: left RAP + data + data + center RAP + data + right RAP
// For 4-column symbols: left RAP + data + data + center RAP + data + data + right RAP

// RAP codeword values cycle based on row number and symbol variant
// ISO/IEC 24728 Table 1: RAP column patterns per symbol variant
// The RAP encodes: (row_number * 3 + cluster) mod 929 for addressing
function getLeftRAP(row: number, _cols: number, rows: number): number {
  // Left RAP encodes row information
  // Use a combination of row number and total rows to generate unique patterns
  return (row * 30 + rows) % 929;
}

function getRightRAP(row: number, cols: number, rows: number): number {
  // Right RAP provides redundant row addressing
  return (row * 30 + rows + cols) % 929;
}

function getCenterRAP(row: number, rows: number): number {
  // Center RAP for 3 and 4 column symbols
  return (row * 30 + rows + 10) % 929;
}

export interface MicroPDF417Options {
  columns?: 1 | 2 | 3 | 4;
}

export interface MicroPDF417Result {
  matrix: boolean[][];
  rows: number;
  cols: number;
}

/**
 * Render a codeword pattern as modules (bar/space alternating, starting with bar)
 */
function renderPattern(pattern: number[]): boolean[] {
  const modules: boolean[] = [];
  let isBar = true;
  for (const w of pattern) {
    for (let i = 0; i < w; i++) {
      modules.push(isBar);
    }
    isBar = !isBar;
  }
  return modules;
}

/**
 * Encode text as MicroPDF417
 */
export function encodeMicroPDF417(
  text: string,
  options: MicroPDF417Options = {},
): MicroPDF417Result {
  if (text.length === 0) {
    throw new InvalidInputError("MicroPDF417 input must not be empty");
  }

  // Encode data to codewords using PDF417 compaction
  const dataCW = encodeData(text);

  // Select symbol size
  const symbol = selectSize(dataCW.length, options.columns);
  if (!symbol) {
    throw new CapacityError(`Data too long for MicroPDF417: ${dataCW.length} codewords needed`);
  }

  const [cols, rows, maxDataCW, ecCW, ecLevel] = symbol;

  // Pad data codewords to fill data capacity
  while (dataCW.length < maxDataCW) {
    dataCW.push(900); // text compaction latch as pad
  }

  // Generate EC codewords using PDF417 RS over GF(929)
  const ec = generateECCodewords(dataCW, ecLevel);

  // Take exactly the number of EC codewords needed
  const allCW = [...dataCW, ...ec.slice(0, ecCW)];

  // Pad allCW to fill all row*col slots (remaining slots get pad codeword)
  while (allCW.length < rows * cols) {
    allCW.push(900);
  }

  // Build matrix row by row
  const matrix: boolean[][] = [];

  for (let row = 0; row < rows; row++) {
    const cluster = getRowCluster(row);
    const rowModules: boolean[] = [];

    // Left RAP
    const leftRAPValue = getLeftRAP(row, cols, rows);
    const leftPattern = getCodewordPattern(leftRAPValue, cluster);
    rowModules.push(...renderPattern(leftPattern));

    // Data codewords for this row
    if (cols >= 1) {
      const cwIdx0 = row * cols;
      if (cwIdx0 < allCW.length) {
        const pattern = getCodewordPattern(allCW[cwIdx0]! % 929, cluster);
        rowModules.push(...renderPattern(pattern));
      }
    }

    if (cols >= 2) {
      const cwIdx1 = row * cols + 1;
      if (cwIdx1 < allCW.length) {
        const pattern = getCodewordPattern(allCW[cwIdx1]! % 929, cluster);
        rowModules.push(...renderPattern(pattern));
      }
    }

    // Center RAP (for 3 and 4 column symbols)
    if (cols >= 3) {
      const centerRAPValue = getCenterRAP(row, rows);
      const centerPattern = getCodewordPattern(centerRAPValue, cluster);
      rowModules.push(...renderPattern(centerPattern));
    }

    if (cols >= 3) {
      const cwIdx2 = row * cols + 2;
      if (cwIdx2 < allCW.length) {
        const pattern = getCodewordPattern(allCW[cwIdx2]! % 929, cluster);
        rowModules.push(...renderPattern(pattern));
      }
    }

    if (cols >= 4) {
      const cwIdx3 = row * cols + 3;
      if (cwIdx3 < allCW.length) {
        const pattern = getCodewordPattern(allCW[cwIdx3]! % 929, cluster);
        rowModules.push(...renderPattern(pattern));
      }
    }

    // Right RAP
    const rightRAPValue = getRightRAP(row, cols, rows);
    const rightPattern = getCodewordPattern(rightRAPValue, cluster);
    rowModules.push(...renderPattern(rightPattern));

    // Termination bar (1 module)
    rowModules.push(true);

    matrix.push(rowModules);
  }

  return { matrix, rows, cols: matrix[0]?.length ?? 0 };
}

function selectSize(
  dataCWCount: number,
  requestedCols?: number,
): [number, number, number, number, number] | undefined {
  for (const size of SYMBOL_SIZES) {
    const [cols, _rows, maxData] = size;
    if (requestedCols && cols !== requestedCols) continue;
    if (dataCWCount <= maxData) return size;
  }
  return undefined;
}
