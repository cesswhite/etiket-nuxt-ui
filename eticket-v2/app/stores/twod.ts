import {
  datamatrix,
  datamatrixPNG,
  gs1datamatrix,
  gs1datamatrixPNG,
  pdf417,
  pdf417PNG,
  aztec,
  aztecPNG,
  renderMatrixSVG,
  encodeMicroPDF417,
  encodeRMQR,
  encodeMaxiCode,
  encodeDotCode,
  encodeHanXin,
  encodeJABCode,
  encodeCodablockF,
  encodeCode16K,
  encodeGS1Composite,
} from "etiket";

export const M2D_DEFAULTS: Record<string, string> = {
  datamatrix: "Hello World",
  gs1datamatrix: "(01)12345678901231",
  pdf417: "Hello World",
  aztec: "Hello World",
  micropdf417: "Hello",
  rmqr: "HELLO",
  maxicode: "Hello MaxiCode",
  dotcode: "HELLO",
  hanxin: "Hello",
  jabcode: "Hello",
  codablockf: "HELLO WORLD",
  code16k: "HELLO",
  "gs1-composite": "(17)260101(10)BATCH01",
};

export const FORMAT_GROUPS = [
  {
    label: "Standard 2D",
    items: [
      { value: "datamatrix", label: "Data Matrix" },
      { value: "gs1datamatrix", label: "GS1 Data Matrix" },
      { value: "pdf417", label: "PDF417" },
      { value: "aztec", label: "Aztec Code" },
    ],
  },
  {
    label: "Extended 2D",
    items: [
      { value: "micropdf417", label: "Micro PDF417" },
      { value: "rmqr", label: "rMQR" },
      { value: "maxicode", label: "MaxiCode" },
      { value: "dotcode", label: "DotCode" },
      { value: "hanxin", label: "Han Xin" },
      { value: "jabcode", label: "JAB Code" },
      { value: "codablockf", label: "Codablock F" },
      { value: "code16k", label: "Code 16K" },
      { value: "gs1-composite", label: "GS1 Composite" },
    ],
  },
];

// Formats with built-in PNG support
const PNG_SUPPORTED = new Set(["datamatrix", "gs1datamatrix", "pdf417", "aztec"]);

export const useTwoDStore = defineStore("twod", () => {
  const format = ref("datamatrix");
  const data = ref("Hello World");
  const size = ref(200);
  const color = ref("#000000");
  const background = ref("#ffffff");
  const margin = ref(4);

  // PDF417 options
  const pdfEcLevel = ref(2);
  const pdfColumns = ref<number | undefined>(undefined);
  const pdfCompact = ref(false);

  // Aztec options
  const aztecEcPercent = ref(23);
  const aztecLayers = ref<number | undefined>(undefined);
  const aztecCompact = ref(false);

  // MicroPDF417
  const mpdfColumns = ref<number | undefined>(undefined);

  // rMQR
  const rmqrEcLevel = ref<"M" | "H">("M");

  // MaxiCode
  const maxiMode = ref(4);

  // Han Xin
  const hanxinEcLevel = ref(1);

  // JABCode
  const jabColors = ref(8);

  // Codablock F
  const cbfColumns = ref<number | undefined>(undefined);

  // GS1 Composite
  const gs1CompType = ref("cc-a");

  function setFormat(newFormat: string) {
    format.value = newFormat;
    const def = M2D_DEFAULTS[newFormat];
    if (def) data.value = def;
  }

  const supportsPNG = computed(() => PNG_SUPPORTED.has(format.value));

  const svgOpts = computed(() => ({
    size: size.value,
    color: color.value,
    background: background.value,
    margin: margin.value,
  }));

  function buildSVG(): string {
    const opts = svgOpts.value;
    switch (format.value) {
      case "datamatrix":
        return datamatrix(data.value, opts);
      case "gs1datamatrix":
        return gs1datamatrix(data.value, opts);
      case "pdf417":
        return pdf417(data.value, {
          ...opts,
          width: opts.size,
          ecLevel: pdfEcLevel.value,
          columns: pdfColumns.value,
          compact: pdfCompact.value,
        });
      case "aztec":
        return aztec(data.value, {
          ...opts,
          ecPercent: aztecEcPercent.value,
          layers: aztecLayers.value,
          compact: aztecCompact.value,
        });
      case "micropdf417": {
        const r = encodeMicroPDF417(data.value, mpdfColumns.value ? { columns: mpdfColumns.value as any } : undefined);
        return renderMatrixSVG(r.matrix, opts);
      }
      case "rmqr":
        return renderMatrixSVG(encodeRMQR(data.value, { ecLevel: rmqrEcLevel.value }), opts);
      case "maxicode":
        return renderMatrixSVG(encodeMaxiCode(data.value, { mode: maxiMode.value as any }), opts);
      case "dotcode":
        return renderMatrixSVG(encodeDotCode(data.value), opts);
      case "hanxin":
        return renderMatrixSVG(encodeHanXin(data.value, { ecLevel: hanxinEcLevel.value as any }), opts);
      case "jabcode":
        return renderJABCodeSVG(
          encodeJABCode(data.value, { colors: jabColors.value as any }),
          opts.size,
        );
      case "codablockf": {
        const r = encodeCodablockF(data.value, cbfColumns.value ? { columns: cbfColumns.value } : undefined);
        return renderMatrixSVG(r.matrix, opts);
      }
      case "code16k":
        return renderMatrixSVG(encodeCode16K(data.value).matrix, opts);
      case "gs1-composite":
        return renderMatrixSVG(
          encodeGS1Composite(data.value, gs1CompType.value as any).composite,
          opts,
        );
      default:
        return datamatrix(data.value, opts);
    }
  }

  function buildPNG(): Uint8Array {
    const pngOpts = {
      moduleSize: Math.max(2, Math.round(size.value / 30)),
      margin: margin.value,
      color: color.value,
      background: background.value,
    };
    switch (format.value) {
      case "datamatrix":
        return datamatrixPNG(data.value, pngOpts);
      case "gs1datamatrix":
        return gs1datamatrixPNG(data.value, pngOpts);
      case "pdf417":
        return pdf417PNG(data.value, {
          ...pngOpts,
          ecLevel: pdfEcLevel.value,
          columns: pdfColumns.value,
          compact: pdfCompact.value,
        });
      case "aztec":
        return aztecPNG(data.value, {
          ...pngOpts,
          ecPercent: aztecEcPercent.value,
          layers: aztecLayers.value,
          compact: aztecCompact.value,
        });
      default:
        throw new Error("Direct PNG not supported for this format");
    }
  }

  const result = computed<{ svg: string } | { error: string }>(() => {
    try {
      return { svg: buildSVG() };
    } catch (e) {
      return { error: (e as Error).message };
    }
  });

  return {
    format, data, size, color, background, margin,
    pdfEcLevel, pdfColumns, pdfCompact,
    aztecEcPercent, aztecLayers, aztecCompact,
    mpdfColumns, rmqrEcLevel, maxiMode, hanxinEcLevel,
    jabColors, cbfColumns, gs1CompType,
    supportsPNG,
    setFormat, buildSVG, buildPNG, result,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTwoDStore, import.meta.hot));
}
