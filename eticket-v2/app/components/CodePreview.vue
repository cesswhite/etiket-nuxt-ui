<template>
  <div class="flex flex-col gap-3">
    <!-- Output -->
    <div
      class="min-h-48 flex items-center justify-center rounded-xl border border-default bg-white dark:bg-neutral-950 p-4 transition-all duration-200"
      :class="{ 'border-error/40 bg-error/5': 'error' in result }"
    >
      <div v-if="'error' in result" class="text-center">
        <UIcon name="i-lucide-alert-circle" class="size-6 text-error mb-2 mx-auto" />
        <p class="text-sm text-error font-mono">{{ result.error }}</p>
      </div>
      <div
        v-else
        v-html="result.svg"
        class="max-w-full [&>svg]:max-w-full [&>svg]:h-auto [&>img]:max-w-full"
      />
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 flex-wrap">
      <UButton
        icon="i-lucide-copy"
        label="Copy SVG"
        variant="outline"
        color="neutral"
        size="sm"
        :disabled="'error' in result"
        @click="handleCopy"
      />
      <UButton
        icon="i-lucide-download"
        label="SVG"
        variant="outline"
        color="neutral"
        size="sm"
        :disabled="'error' in result"
        @click="handleDownloadSVG"
      />
      <UButton
        v-if="supportsPNG"
        icon="i-lucide-image"
        label="PNG"
        variant="outline"
        color="neutral"
        size="sm"
        :loading="downloadingPNG"
        :disabled="'error' in result"
        @click="handleDownloadPNG"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  result: { svg: string } | { error: string };
  name?: string;
  supportsPNG?: boolean;
  onDownloadPNG?: () => Uint8Array | Promise<Uint8Array>;
}>();

const { copySVG, downloadSVG, downloadPNG, downloadSVGasPNG } = useDownload();
const downloadingPNG = ref(false);

function handleCopy() {
  if ("svg" in props.result) copySVG(props.result.svg);
}

function handleDownloadSVG() {
  if ("svg" in props.result) downloadSVG(props.result.svg, props.name ?? "code");
}

async function handleDownloadPNG() {
  if ("error" in props.result) return;
  downloadingPNG.value = true;
  try {
    if (props.onDownloadPNG) {
      const png = await props.onDownloadPNG();
      downloadPNG(png, props.name ?? "code");
    } else {
      await downloadSVGasPNG(props.result.svg, props.name ?? "code");
    }
  } finally {
    downloadingPNG.value = false;
  }
}
</script>
