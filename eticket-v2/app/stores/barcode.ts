import {
  barcode,
  barcodePNG,
  encodeRM4SCC,
  encodeKIX,
  encodeAustraliaPost,
  encodeJapanPost,
  encodeIMb,
  encodeHIBCPrimary,
  encodeHIBCSecondary,
  encodeHIBCConcatenated,
  encodeISBT128DIN,
  encodeISBT128Component,
  encodeISBT128Expiry,
  encodeISBT128BloodGroup,
} from "etiket";

export const BARCODE_DEFAULTS: Record<string, string> = {
  code128: "Hello World",
  code39: "HELLO",
  code39ext: "Hello!",
  code93: "HELLO",
  code93ext: "Hello!",
  code11: "0123456789",
  ean13: "5901234123457",
  ean8: "96385074",
  ean2: "53",
  ean5: "52495",
  upca: "012345678905",
  upce: "01234565",
  itf: "1234567890",
  itf14: "1234567890123",
  codabar: "A12345B",
  msi: "1234567",
  pharmacode: "1234",
  plessey: "01234567",
  "gs1-128": "(01)12345678901231",
  "gs1-databar": "0123456789012",
  "gs1-databar-limited": "0123456789012",
  "gs1-databar-expanded": "(01)12345678901231",
  identcode: "563102430313",
  leitcode: "21348075016401",
  postnet: "12345",
  planet: "1234567890",
  rm4scc: "SW1A1AA",
  kix: "1234AB",
  "australia-post": "11:12345678",
  "japan-post": "1234567",
  imb: "01234567890123456789",
  "hibc-primary": "A123:PROD001:1",
  "hibc-secondary": "260101:LOT123",
  "hibc-concatenated": "A123:PROD001:260101:LOT1",
  "isbt-din": "US:01234:26:001234",
  "isbt-component": "E0791",
  "isbt-expiry": "260101",
  "isbt-bloodgroup": "51",
};

export const FORMAT_HINTS: Record<string, string> = {
  "australia-post": "Format: FCC:DPID (e.g. 11:12345678)",
  "hibc-primary": "Format: LIC:PRODUCT:UOM (e.g. A123:PROD001:1)",
  "hibc-secondary": "Format: EXPIRY:LOT (e.g. 260101:LOT123)",
  "hibc-concatenated": "Format: LIC:PRODUCT:EXPIRY:LOT",
  "isbt-din": "Format: COUNTRY:FACILITY:YEAR:DONATION",
};

const FOURSTATE_TYPES = new Set(["rm4scc", "kix", "australia-post", "japan-post", "imb"]);
const HEALTHCARE_TYPES = new Set([
  "hibc-primary",
  "hibc-secondary",
  "hibc-concatenated",
  "isbt-din",
  "isbt-component",
  "isbt-expiry",
  "isbt-bloodgroup",
]);

export const BARCODE_GROUPS = [
  {
    label: "Standard",
    items: [
      { value: "code128", label: "Code 128" },
      { value: "code39", label: "Code 39" },
      { value: "code39ext", label: "Code 39 Extended" },
      { value: "code93", label: "Code 93" },
      { value: "code93ext", label: "Code 93 Extended" },
      { value: "code11", label: "Code 11" },
      { value: "ean13", label: "EAN-13" },
      { value: "ean8", label: "EAN-8" },
      { value: "ean5", label: "EAN-5 (Add-on)" },
      { value: "ean2", label: "EAN-2 (Add-on)" },
      { value: "upca", label: "UPC-A" },
      { value: "upce", label: "UPC-E" },
      { value: "itf", label: "ITF" },
      { value: "itf14", label: "ITF-14" },
      { value: "codabar", label: "Codabar" },
      { value: "msi", label: "MSI Plessey" },
      { value: "pharmacode", label: "Pharmacode" },
      { value: "plessey", label: "Plessey" },
    ],
  },
  {
    label: "GS1",
    items: [
      { value: "gs1-128", label: "GS1-128" },
      { value: "gs1-databar", label: "GS1 DataBar" },
      { value: "gs1-databar-limited", label: "GS1 DataBar Limited" },
      { value: "gs1-databar-expanded", label: "GS1 DataBar Expanded" },
    ],
  },
  {
    label: "Postal",
    items: [
      { value: "identcode", label: "Identcode" },
      { value: "leitcode", label: "Leitcode" },
      { value: "postnet", label: "POSTNET" },
      { value: "planet", label: "PLANET" },
    ],
  },
  {
    label: "4-State Postal",
    items: [
      { value: "rm4scc", label: "RM4SCC (Royal Mail)" },
      { value: "kix", label: "KIX (Netherlands)" },
      { value: "australia-post", label: "Australia Post" },
      { value: "japan-post", label: "Japan Post" },
      { value: "imb", label: "Intelligent Mail (IMb)" },
    ],
  },
  {
    label: "Healthcare / ISBT",
    items: [
      { value: "hibc-primary", label: "HIBC Primary" },
      { value: "hibc-secondary", label: "HIBC Secondary" },
      { value: "hibc-concatenated", label: "HIBC Concatenated" },
      { value: "isbt-din", label: "ISBT 128 DIN" },
      { value: "isbt-component", label: "ISBT 128 Component" },
      { value: "isbt-expiry", label: "ISBT 128 Expiry" },
      { value: "isbt-bloodgroup", label: "ISBT 128 Blood Group" },
    ],
  },
];

export const useBarcodeStore = defineStore("barcode", () => {
  const type = ref("code128");
  const data = ref("Hello World");
  const height = ref(80);
  const barWidth = ref(2);
  const color = ref("#000000");
  const background = ref("#ffffff");
  const rotation = ref<0 | 90 | 180 | 270>(0);
  const showText = ref(true);
  const margin = ref(10);
  const marginTop = ref<number | undefined>(undefined);
  const marginBottom = ref<number | undefined>(undefined);

  const hint = computed(() => FORMAT_HINTS[type.value] ?? "");
  const isFourState = computed(() => FOURSTATE_TYPES.has(type.value));
  const isHealthcare = computed(() => HEALTHCARE_TYPES.has(type.value));
  const supportsPNG = computed(() => !isFourState.value && !isHealthcare.value);

  function setType(newType: string) {
    type.value = newType;
    const def = BARCODE_DEFAULTS[newType];
    if (def) data.value = def;
  }

  function buildSVG(): string {
    const opts = {
      height: height.value,
      barWidth: barWidth.value,
      color: color.value,
      background: background.value,
      rotation: rotation.value || undefined,
      showText: showText.value,
      margin: margin.value,
      marginTop: marginTop.value,
      marginBottom: marginBottom.value,
    };

    if (isFourState.value) {
      let states: string[];
      switch (type.value) {
        case "rm4scc":
          states = encodeRM4SCC(data.value) as string[];
          break;
        case "kix":
          states = encodeKIX(data.value) as string[];
          break;
        case "australia-post": {
          const [fcc, dpid] = data.value.split(":");
          states = encodeAustraliaPost(fcc, dpid) as string[];
          break;
        }
        case "japan-post":
          states = encodeJapanPost(data.value) as string[];
          break;
        case "imb":
          states = encodeIMb(data.value) as string[];
          break;
        default:
          states = [];
      }
      return renderFourStateSVG(states, opts.color ?? "#000");
    }

    if (isHealthcare.value) {
      let encoded: string;
      switch (type.value) {
        case "hibc-primary": {
          const [lic, product, uom] = data.value.split(":");
          encoded = encodeHIBCPrimary(lic, product, uom ? Number(uom) : undefined);
          break;
        }
        case "hibc-secondary": {
          const [expiry, lot] = data.value.split(":");
          encoded = encodeHIBCSecondary(expiry || undefined, lot || undefined);
          break;
        }
        case "hibc-concatenated": {
          const [lic, product, expiry, lot] = data.value.split(":");
          encoded = encodeHIBCConcatenated(lic, product, { expiry, lot });
          break;
        }
        case "isbt-din": {
          const [cc, facility, year, donation] = data.value.split(":");
          encoded = encodeISBT128DIN(cc, facility, year, donation);
          break;
        }
        case "isbt-component":
          encoded = encodeISBT128Component(data.value);
          break;
        case "isbt-expiry":
          encoded = encodeISBT128Expiry(data.value);
          break;
        case "isbt-bloodgroup":
          encoded = encodeISBT128BloodGroup(data.value);
          break;
        default:
          encoded = data.value;
      }
      return barcode(encoded, { ...opts, type: "code128" });
    }

    return barcode(data.value, { ...opts, type: type.value });
  }

  function buildPNG(): Uint8Array {
    return barcodePNG(data.value, {
      type: type.value as any,
      scale: barWidth.value,
      height: height.value,
      margin: margin.value,
      color: color.value,
      background: background.value,
    });
  }

  const result = computed<{ svg: string } | { error: string }>(() => {
    try {
      return { svg: buildSVG() };
    } catch (e) {
      return { error: (e as Error).message };
    }
  });

  return {
    type,
    data,
    height,
    barWidth,
    color,
    background,
    rotation,
    showText,
    margin,
    marginTop,
    marginBottom,
    hint,
    isFourState,
    isHealthcare,
    supportsPNG,
    setType,
    buildSVG,
    buildPNG,
    result,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBarcodeStore, import.meta.hot));
}
