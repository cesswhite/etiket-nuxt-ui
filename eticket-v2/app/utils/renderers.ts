// Custom SVG renderers for formats not covered by etiket's built-in renderer

export function renderFourStateSVG(states: string[], color: string): string {
  const bw = 2;
  const gap = 3;
  const h = 24;
  const m = 10;
  const w = states.length * (bw + gap) - gap + m * 2;

  const bars = states
    .map((s, i) => {
      const x = m + i * (bw + gap);
      let y: number;
      let bh: number;
      switch (s) {
        case "F":
          y = 0;
          bh = h;
          break;
        case "A":
          y = 0;
          bh = h * 0.6;
          break;
        case "D":
          y = h * 0.4;
          bh = h * 0.6;
          break;
        default:
          y = h * 0.25;
          bh = h * 0.5;
          break; // T
      }
      return `<rect x="${x}" y="${y + m}" width="${bw}" height="${bh}" fill="${color}"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h + m * 2}" width="${w}" height="${h + m * 2}">${bars}</svg>`;
}

export function renderJABCodeSVG(
  result: { matrix: number[][]; rows: number; cols: number; palette: readonly string[] },
  size: number,
): string {
  const cell = Math.max(2, Math.floor(size / Math.max(result.rows, result.cols)));
  const w = result.cols * cell;
  const h = result.rows * cell;
  let rects = "";
  for (let r = 0; r < result.rows; r++) {
    for (let c = 0; c < result.cols; c++) {
      rects += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="${result.palette[result.matrix[r][c]]}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${rects}</svg>`;
}

export async function svgToPNG(svgString: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Failed to create PNG"));
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG"));
    };
    img.src = url;
  });
}
