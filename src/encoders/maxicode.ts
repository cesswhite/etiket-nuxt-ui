/**
 * MaxiCode encoder (ISO/IEC 16023)
 * Fixed-size 2D barcode used on UPS shipping labels
 *
 * Structure:
 * - 33 rows × 30 columns hexagonal grid (884 modules, 864 data bits)
 * - Central bullseye finder pattern
 * - 6 encoding modes (2/3 for structured carrier, 4/5/6 for general)
 * - Reed-Solomon error correction over GF(64)
 */

import { InvalidInputError } from "../errors";

const ROWS = 33;
const COLS = 30;

// ---------------------------------------------------------------------------
// GF(64) arithmetic — primitive polynomial x^6 + x + 1 (0x43)
// ---------------------------------------------------------------------------

const GF64_SIZE = 64;
const GF64_MAX = 63; // order of the multiplicative group

const GF64_EXP = new Uint8Array(128);
const GF64_LOG = new Uint8Array(64);

(function initGF64() {
  let x = 1;
  for (let i = 0; i < GF64_MAX; i++) {
    GF64_EXP[i] = x;
    GF64_LOG[x] = i;
    x = x << 1;
    if (x >= GF64_SIZE) x ^= 0x43;
  }
  // Extend exp table for modular arithmetic convenience
  for (let i = GF64_MAX; i < 128; i++) {
    GF64_EXP[i] = GF64_EXP[i - GF64_MAX]!;
  }
})();

/** Multiply two GF(64) elements using log/antilog tables */
function gf64Mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF64_EXP[(GF64_LOG[a]! + GF64_LOG[b]!) % GF64_MAX]!;
}

/**
 * Reed-Solomon error correction over GF(64).
 * Generator polynomial: product of (x - alpha^i) for i = 1..ecCount
 */
function maxicodeEC(data: number[], ecCount: number): number[] {
  // Build generator polynomial g(x) = (x - a^1)(x - a^2)...(x - a^ecCount)
  const gen = Array.from<number>({ length: ecCount + 1 }).fill(0);
  gen[0] = 1;

  for (let i = 1; i <= ecCount; i++) {
    for (let j = gen.length - 1; j >= 1; j--) {
      gen[j] = gen[j - 1]! ^ gf64Mul(gen[j]!, GF64_EXP[i]!);
    }
    gen[0] = gf64Mul(gen[0]!, GF64_EXP[i]!);
  }

  // Polynomial long division
  const result = Array.from<number>({ length: ecCount }).fill(0);
  for (const cw of data) {
    const lead = (cw ^ result[0]!) & GF64_MAX;
    for (let j = 0; j < ecCount - 1; j++) {
      result[j] = result[j + 1]! ^ gf64Mul(lead, gen[j + 1]!);
    }
    result[ecCount - 1] = gf64Mul(lead, gen[ecCount]!);
  }

  return result;
}

// ---------------------------------------------------------------------------
// MaxiCode character encoding
// ---------------------------------------------------------------------------

// MaxiCode character set (Mode 4: Standard Code Set A — printable ASCII)
function encodeMode4(text: string): number[] {
  const codewords: number[] = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) {
      codewords.push(0); // replace non-printable with space
    } else {
      codewords.push(code - 32); // offset to 0-based
    }
  }
  return codewords;
}

// ---------------------------------------------------------------------------
// Mode 2/3: Structured Carrier Message (UPS shipping)
// ---------------------------------------------------------------------------

/**
 * Build the 10 primary-message codewords for modes 2 and 3.
 *
 * Primary message layout (all codewords are 6-bit, GF(64)):
 *   CW0:  mode indicator (2 or 3)
 *   Mode 2 (numeric US postal code):
 *     Pack 9-digit postal code as a 30-bit integer → CW1..CW5 (5 codewords, 6 bits each)
 *   Mode 3 (alphanumeric international postal code):
 *     6 characters, each encoded as 6-bit value → CW1..CW6
 *   Country code (10 bits) → 2 codewords
 *   Service class (10 bits) → 2 codewords
 *
 * Total primary data = 10 codewords
 */
function buildPrimary(
  postalCode: string,
  countryCode: number,
  serviceClass: number,
  mode: 2 | 3,
): number[] {
  const primary: number[] = [];

  // CW0: mode indicator
  primary.push(mode);

  if (mode === 2) {
    // Numeric postal code: 9 digits packed as a 30-bit integer
    const postal = postalCode.replace(/\D/g, "").padEnd(9, "0").substring(0, 9);
    const postalNum = Number.parseInt(postal, 10);
    // 30 bits → 5 codewords of 6 bits each (MSB first)
    primary.push((postalNum >> 24) & 0x3f);
    primary.push((postalNum >> 18) & 0x3f);
    primary.push((postalNum >> 12) & 0x3f);
    primary.push((postalNum >> 6) & 0x3f);
    primary.push(postalNum & 0x3f);
  } else {
    // International alphanumeric postal code: 6 characters
    const postal = postalCode.padEnd(6, " ").substring(0, 6);
    for (const ch of postal) {
      primary.push(ch.charCodeAt(0) & 0x3f);
    }
  }

  // Country code (3-digit ISO, max 999 → 10 bits → 2 codewords)
  primary.push((countryCode >> 6) & 0x3f);
  primary.push(countryCode & 0x3f);

  // Service class (3 digits → 10 bits → 2 codewords)
  primary.push((serviceClass >> 6) & 0x3f);
  primary.push(serviceClass & 0x3f);

  return primary;
}

// ---------------------------------------------------------------------------
// Bullseye finder pattern (ISO/IEC 16023)
// ---------------------------------------------------------------------------

/**
 * The bullseye is composed of 3 concentric dark rings with 2 light rings
 * between them, centered in the symbol grid.
 *
 * Center of the bullseye: row 16, col 14 (for odd rows) / between 14-15
 * (for even rows, which are offset by half a module).
 *
 * We define the finder pattern using explicit coordinate lists derived from
 * the standard's geometry. The pattern extends from approximately
 * rows 13–19, cols 11–18.
 */

// Each entry: [row, col, isDark]
// Built from concentric rings: ring 0 (center) = dark, ring 1 = light,
// ring 2 = dark, ring 3 = light, ring 4 = dark (outermost)
const BULLSEYE: [number, number, boolean][] = [];

function initBullseye(): void {
  const CY = 16;
  const CX = 14; // center column for odd rows; even rows offset by +0.5

  for (let r = 10; r <= 22; r++) {
    for (let c = 10; c <= 19; c++) {
      // Compute distance in hex-grid units
      // Even rows are shifted +0.5 in x
      const xOff = r % 2 === 0 ? 0.5 : 0;
      const dx = c + xOff - CX;
      const dy = (r - CY) * 0.8660254; // sqrt(3)/2 for hex vertical spacing
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 3.6) {
        // Determine ring (0=center, 1, 2, 3, 4 from inside out)
        let dark: boolean;
        if (dist <= 0.6)
          dark = true; // ring 0: center dot
        else if (dist <= 1.35)
          dark = false; // ring 1: light
        else if (dist <= 2.1)
          dark = true; // ring 2: dark
        else if (dist <= 2.85)
          dark = false; // ring 3: light
        else dark = true; // ring 4: dark (outermost)
        BULLSEYE.push([r, c, dark]);
      }
    }
  }
}

initBullseye();

/** Set of (row * COLS + col) indices occupied by the bullseye */
const FINDER_SET = new Set<number>();
for (const [r, c] of BULLSEYE) {
  FINDER_SET.add(r * COLS + c);
}

// ---------------------------------------------------------------------------
// Module placement sequence
// ---------------------------------------------------------------------------

/**
 * Build the data module placement sequence.
 *
 * MaxiCode places 864 data bits (144 codewords × 6 bits) in specific
 * module positions, excluding the bullseye finder pattern. The placement
 * follows a column-pair traversal from right to left with alternating
 * row direction.
 */
function buildPlacementSequence(): number[] {
  const sequence: number[] = [];
  const used = new Set(FINDER_SET);

  let goingUp = false;
  for (let colPair = COLS - 1; colPair >= 0; colPair -= 2) {
    const c1 = colPair;
    const c0 = colPair - 1;

    if (goingUp) {
      for (let r = ROWS - 1; r >= 0; r--) {
        if (c1 >= 0 && !used.has(r * COLS + c1)) {
          sequence.push(r * COLS + c1);
          used.add(r * COLS + c1);
        }
        if (c0 >= 0 && !used.has(r * COLS + c0)) {
          sequence.push(r * COLS + c0);
          used.add(r * COLS + c0);
        }
      }
    } else {
      for (let r = 0; r < ROWS; r++) {
        if (c1 >= 0 && !used.has(r * COLS + c1)) {
          sequence.push(r * COLS + c1);
          used.add(r * COLS + c1);
        }
        if (c0 >= 0 && !used.has(r * COLS + c0)) {
          sequence.push(r * COLS + c0);
          used.add(r * COLS + c0);
        }
      }
    }
    goingUp = !goingUp;
  }

  return sequence;
}

const PLACEMENT_SEQUENCE = buildPlacementSequence();

// ---------------------------------------------------------------------------
// Bullseye placement into matrix
// ---------------------------------------------------------------------------

function placeBullseye(matrix: boolean[][]): void {
  for (const [r, c, dark] of BULLSEYE) {
    matrix[r]![c] = dark;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface MaxiCodeOptions {
  /** Encoding mode: 2 (US structured), 3 (intl structured), 4 (standard), 5 (full ECC), 6 (reader programming) */
  mode?: 2 | 3 | 4 | 5 | 6;
  /** Postal code (modes 2/3) */
  postalCode?: string;
  /** ISO country code number (modes 2/3) */
  countryCode?: number;
  /** Service class (modes 2/3, e.g. 840 for UPS) */
  serviceClass?: number;
}

/**
 * Encode text as MaxiCode
 * Returns a 33×30 boolean matrix (hexagonal grid representation)
 */
export function encodeMaxiCode(text: string, options: MaxiCodeOptions = {}): boolean[][] {
  if (text.length === 0) {
    throw new InvalidInputError("MaxiCode input must not be empty");
  }

  const mode = options.mode ?? 4;
  let primaryData: number[];
  let secondaryRaw: number[];

  if (mode === 2 || mode === 3) {
    // Primary message: 10 codewords from structured header
    primaryData = buildPrimary(
      options.postalCode ?? "",
      options.countryCode ?? 840,
      options.serviceClass ?? 1,
      mode,
    );
    // Secondary message: the text payload
    secondaryRaw = encodeMode4(text);
  } else {
    // Modes 4/5/6: primary is mode + first 9 data chars,
    // secondary is the remainder
    const allData = [mode, ...encodeMode4(text)];
    primaryData = allData.slice(0, 10);
    secondaryRaw = allData.slice(10);
  }

  // Pad primary to exactly 10 codewords
  while (primaryData.length < 10) {
    primaryData.push(33); // pad character
  }
  primaryData = primaryData.slice(0, 10);

  // Secondary message: 84 data codewords total, split into two equal halves
  // Each half: 42 data codewords + 10 EC codewords
  const SECONDARY_TOTAL = 84;
  const SECONDARY_HALF = 42;

  while (secondaryRaw.length < SECONDARY_TOTAL) {
    secondaryRaw.push(33); // pad character
  }
  secondaryRaw = secondaryRaw.slice(0, SECONDARY_TOTAL);

  const secondaryData1 = secondaryRaw.slice(0, SECONDARY_HALF);
  const secondaryData2 = secondaryRaw.slice(SECONDARY_HALF, SECONDARY_TOTAL);

  // Reed-Solomon error correction over GF(64)
  // Primary:          10 data codewords → 10 EC codewords
  // Secondary block 1: 42 data codewords → 10 EC codewords
  // Secondary block 2: 42 data codewords → 10 EC codewords
  const primaryEC = maxicodeEC(primaryData, 10);
  const secondaryEC1 = maxicodeEC(secondaryData1, 10);
  const secondaryEC2 = maxicodeEC(secondaryData2, 10);

  // Assemble all codewords in transmission order:
  // Primary data (10) + Primary EC (10) +
  // Secondary data 1 (42) + Secondary EC 1 (10) +
  // Secondary data 2 (42) + Secondary EC 2 (10)
  // Total: 10 + 10 + 42 + 10 + 42 + 10 = 124 codewords = 744 bits
  const allCW = [
    ...primaryData,
    ...primaryEC,
    ...secondaryData1,
    ...secondaryEC1,
    ...secondaryData2,
    ...secondaryEC2,
  ];

  // Convert codewords to bit stream (6 bits per codeword, MSB first)
  const bits: number[] = [];
  for (const cw of allCW) {
    for (let b = 5; b >= 0; b--) {
      bits.push((cw >> b) & 1);
    }
  }

  // Build 33×30 matrix
  const matrix: boolean[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => false),
  );

  // Place bullseye finder pattern
  placeBullseye(matrix);

  // Place data modules using the MaxiCode placement sequence
  const maxBits = Math.min(bits.length, PLACEMENT_SEQUENCE.length);
  for (let i = 0; i < maxBits; i++) {
    const idx = PLACEMENT_SEQUENCE[i]!;
    const r = Math.floor(idx / COLS);
    const c = idx % COLS;
    matrix[r]![c] = bits[i] === 1;
  }

  return matrix;
}
