export function useDownload() {
  const toast = useToast();

  function copySVG(svg: string) {
    if (!import.meta.client) return;
    navigator.clipboard.writeText(svg).then(() => {
      toast.add({ title: "Copied!", description: "SVG copied to clipboard", color: "success", duration: 2000 });
    });
  }

  function downloadSVG(svg: string, name: string) {
    if (!import.meta.client) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.add({ title: "Downloaded", description: `${name}.svg saved`, color: "success", duration: 2000 });
  }

  function downloadPNG(data: Uint8Array, name: string) {
    if (!import.meta.client) return;
    const blob = new Blob([data], { type: "image/png" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.add({ title: "Downloaded", description: `${name}.png saved`, color: "success", duration: 2000 });
  }

  async function downloadSVGasPNG(svg: string, name: string) {
    if (!import.meta.client) return;
    try {
      const png = await svgToPNG(svg);
      downloadPNG(png, name);
    } catch {
      toast.add({ title: "Error", description: "Failed to convert SVG to PNG", color: "error", duration: 3000 });
    }
  }

  return { copySVG, downloadSVG, downloadPNG, downloadSVGasPNG };
}
