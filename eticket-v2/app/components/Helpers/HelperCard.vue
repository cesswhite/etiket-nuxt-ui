<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon :name="icon" class="size-4 text-primary" />
        <p class="font-semibold text-sm">{{ title }}</p>
      </div>
    </template>

    <!-- Form fields -->
    <div class="flex flex-col gap-3 mb-4">
      <slot />
    </div>

    <!-- Compact preview -->
    <div
      class="flex items-center justify-center rounded-lg border border-default bg-white dark:bg-neutral-950 p-3 min-h-28"
      :class="{ 'border-error/40 bg-error/5': 'error' in result }"
    >
      <div v-if="'error' in result" class="text-center">
        <UIcon name="i-lucide-alert-circle" class="size-5 text-error mb-1 mx-auto" />
        <p class="text-xs text-error font-mono">{{ result.error }}</p>
      </div>
      <div
        v-else
        v-html="result.svg"
        class="[&>svg]:max-w-full [&>svg]:h-auto [&>svg]:max-h-32"
      />
    </div>

    <!-- Actions -->
    <template #footer>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-copy"
          label="Copy"
          variant="ghost"
          color="neutral"
          size="xs"
          :disabled="'error' in result"
          @click="handleCopy"
        />
        <UButton
          icon="i-lucide-download"
          label="SVG"
          variant="ghost"
          color="neutral"
          size="xs"
          :disabled="'error' in result"
          @click="handleDownload"
        />
        <UButton
          icon="i-lucide-image"
          label="PNG"
          variant="ghost"
          color="neutral"
          size="xs"
          :loading="downloadingPNG"
          :disabled="'error' in result"
          @click="handleDownloadPNG"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  icon: string;
  result: { svg: string } | { error: string };
  name: string;
}>();

const { copySVG, downloadSVG, downloadSVGasPNG } = useDownload();
const downloadingPNG = ref(false);

function handleCopy() {
  if ("svg" in props.result) copySVG(props.result.svg);
}

function handleDownload() {
  if ("svg" in props.result) downloadSVG(props.result.svg, props.name);
}

async function handleDownloadPNG() {
  if ("error" in props.result) return;
  downloadingPNG.value = true;
  try {
    await downloadSVGasPNG(props.result.svg, props.name);
  } finally {
    downloadingPNG.value = false;
  }
}
</script>
