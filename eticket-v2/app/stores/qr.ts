import {
  qrcode,
  qrcodePNG,
  encodeMicroQR,
  renderMatrixSVG,
} from "etiket";
import type { GradientOptions, LogoOptions } from "etiket";

export type ColorMode = "solid" | "linear" | "radial";
export type BgMode = "solid" | "transparent" | "linear" | "radial";
export type QRMode = "regular" | "micro";
export type ECLevel = "L" | "M" | "Q" | "H";

export const useQRStore = defineStore("qr", () => {
  const data = ref("https://etiket.dev");
  const mode = ref<QRMode>("regular");
  const ecLevel = ref<ECLevel>("M");
  const size = ref(200);
  const margin = ref(2);
  const shape = ref("square");
  const dotType = ref("square");
  const dotSize = ref(1.0);

  // Foreground color
  const colorMode = ref<ColorMode>("solid");
  const color = ref("#000000");
  const gradStart = ref("#000000");
  const gradEnd = ref("#4f46e5");
  const gradRot = ref(0);
  const radialStart = ref("#000000");
  const radialEnd = ref("#4f46e5");

  // Background
  const bgMode = ref<BgMode>("solid");
  const bgColor = ref("#ffffff");
  const bgGradStart = ref("#ffffff");
  const bgGradEnd = ref("#e0e7ff");
  const bgGradRot = ref(0);
  const bgRadialStart = ref("#ffffff");
  const bgRadialEnd = ref("#e0e7ff");

  // Corners
  const cornerOuter = ref("");
  const cornerInner = ref("");
  const cornerColor = ref("#000000");
  const cornerInnerColor = ref("#000000");

  // Logo
  const logoType = ref<"none" | "path" | "url">("none");
  const logoPath = ref("");
  const logoUrl = ref("");
  const logoSize = ref(0.2);
  const logoMargin = ref(2);

  function buildColor(): string | GradientOptions {
    if (colorMode.value === "linear") {
      return {
        type: "linear",
        rotation: gradRot.value,
        stops: [
          { offset: 0, color: gradStart.value },
          { offset: 1, color: gradEnd.value },
        ],
      };
    }
    if (colorMode.value === "radial") {
      return {
        type: "radial",
        stops: [
          { offset: 0, color: radialStart.value },
          { offset: 1, color: radialEnd.value },
        ],
      };
    }
    return color.value;
  }

  function buildBg(): string | GradientOptions | "transparent" {
    if (bgMode.value === "transparent") return "transparent";
    if (bgMode.value === "linear") {
      return {
        type: "linear",
        rotation: bgGradRot.value,
        stops: [
          { offset: 0, color: bgGradStart.value },
          { offset: 1, color: bgGradEnd.value },
        ],
      };
    }
    if (bgMode.value === "radial") {
      return {
        type: "radial",
        stops: [
          { offset: 0, color: bgRadialStart.value },
          { offset: 1, color: bgRadialEnd.value },
        ],
      };
    }
    return bgColor.value;
  }

  function buildCorners() {
    const outer = cornerOuter.value;
    const inner = cornerInner.value;
    if (!outer && !inner) return undefined;
    const c: Record<string, any> = {};
    if (outer) c.outerShape = outer;
    if (inner) c.innerShape = inner;
    if (cornerColor.value !== "#000000") c.outerColor = cornerColor.value;
    if (cornerInnerColor.value !== "#000000") c.innerColor = cornerInnerColor.value;
    return { topLeft: c, topRight: { ...c }, bottomLeft: { ...c } };
  }

  function buildLogo(): LogoOptions | undefined {
    if (logoType.value === "none") return undefined;
    const logo: LogoOptions = { size: logoSize.value, margin: logoMargin.value };
    if (logoType.value === "path") {
      if (!logoPath.value) return undefined;
      logo.path = logoPath.value;
    } else if (logoType.value === "url") {
      if (!logoUrl.value) return undefined;
      logo.imageUrl = logoUrl.value;
    }
    return logo;
  }

  function buildSVG(): string {
    if (mode.value === "micro") {
      const matrix = encodeMicroQR(data.value, { ecLevel: ecLevel.value as any });
      return renderMatrixSVG(matrix, {
        size: size.value,
        color: color.value,
        margin: margin.value,
      });
    }
    return qrcode(data.value, {
      size: size.value,
      margin: margin.value,
      ecLevel: ecLevel.value,
      shape: shape.value as any,
      dotType: dotType.value as any,
      dotSize: dotSize.value,
      color: buildColor(),
      background: buildBg(),
      corners: buildCorners(),
      logo: buildLogo(),
    });
  }

  function buildPNG(): Uint8Array {
    const fgColor = typeof buildColor() === "string" ? (buildColor() as string) : "#000000";
    const bg = buildBg();
    const bgColorStr = typeof bg === "string" && bg !== "transparent" ? bg : "#ffffff";
    return qrcodePNG(data.value, {
      ecLevel: ecLevel.value,
      moduleSize: Math.max(2, Math.round(size.value / 30)),
      margin: margin.value,
      color: fgColor,
      background: bgColorStr,
    });
  }

  const result = computed<{ svg: string } | { error: string }>(() => {
    try {
      return { svg: buildSVG() };
    } catch (e) {
      return { error: (e as Error).message };
    }
  });

  const isMicro = computed(() => mode.value === "micro");
  const hasGradient = computed(() => colorMode.value !== "solid");
  const hasBgGradient = computed(() => bgMode.value !== "solid" && bgMode.value !== "transparent");

  return {
    data, mode, ecLevel, size, margin, shape, dotType, dotSize,
    colorMode, color, gradStart, gradEnd, gradRot, radialStart, radialEnd,
    bgMode, bgColor, bgGradStart, bgGradEnd, bgGradRot, bgRadialStart, bgRadialEnd,
    cornerOuter, cornerInner, cornerColor, cornerInnerColor,
    logoType, logoPath, logoUrl, logoSize, logoMargin,
    isMicro, hasGradient, hasBgGradient,
    buildSVG, buildPNG, result,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useQRStore, import.meta.hot));
}
