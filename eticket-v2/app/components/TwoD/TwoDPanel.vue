<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Controls -->
    <div class="flex flex-col gap-5">
      <UCard>
        <template #header>
          <p class="font-semibold text-sm">Format & data</p>
        </template>
        <div class="flex flex-col gap-4">
          <UFormField label="Format">
            <USelectMenu
              v-model="store.format"
              :items="FORMAT_GROUPS"
              value-key="value"
              label-key="label"
              class="w-full"
              searchable
              @update:model-value="store.setFormat"
            />
          </UFormField>

          <UFormField label="Data">
            <UTextarea
              v-model="store.data"
              class="w-full font-mono"
              autoresize
              :maxrows="4"
              placeholder="Enter data..."
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Common options -->
      <UCard>
        <template #header>
          <p class="font-semibold text-sm">Appearance</p>
        </template>
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Size (px)">
              <UInputNumber v-model="store.size" :min="64" :max="1024" class="w-full" />
            </UFormField>
            <UFormField label="Margin">
              <UInputNumber v-model="store.margin" :min="0" :max="20" class="w-full" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Color">
              <UInput v-model="store.color" type="color" class="w-full h-9" />
            </UFormField>
            <UFormField label="Background">
              <UInput v-model="store.background" type="color" class="w-full h-9" />
            </UFormField>
          </div>
        </div>
      </UCard>

      <!-- Format-specific options -->
      <UCard v-if="hasSpecificOptions">
        <template #header>
          <p class="font-semibold text-sm">Format options</p>
        </template>
        <div class="flex flex-col gap-4">
          <!-- PDF417 -->
          <template v-if="store.format === 'pdf417'">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="EC level (0-8)">
                <UInputNumber v-model="store.pdfEcLevel" :min="0" :max="8" class="w-full" />
              </UFormField>
              <UFormField label="Columns">
                <UInputNumber v-model="store.pdfColumns" :min="1" :max="30" class="w-full" placeholder="auto" />
              </UFormField>
            </div>
            <UFormField label="Compact">
              <USwitch v-model="store.pdfCompact" label="Compact PDF417" />
            </UFormField>
          </template>

          <!-- Aztec -->
          <template v-else-if="store.format === 'aztec'">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="EC percent (5-95)">
                <UInputNumber v-model="store.aztecEcPercent" :min="5" :max="95" class="w-full" />
              </UFormField>
              <UFormField label="Layers">
                <UInputNumber v-model="store.aztecLayers" :min="1" :max="32" class="w-full" placeholder="auto" />
              </UFormField>
            </div>
            <UFormField label="Compact">
              <USwitch v-model="store.aztecCompact" label="Compact Aztec" />
            </UFormField>
          </template>

          <!-- Micro PDF417 -->
          <template v-else-if="store.format === 'micropdf417'">
            <UFormField label="Columns (1-4)">
              <UInputNumber v-model="store.mpdfColumns" :min="1" :max="4" class="w-full" placeholder="auto" />
            </UFormField>
          </template>

          <!-- rMQR -->
          <template v-else-if="store.format === 'rmqr'">
            <UFormField label="EC level">
              <USelect
                v-model="store.rmqrEcLevel"
                :items="[{ value: 'M', label: 'M' }, { value: 'H', label: 'H' }]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </template>

          <!-- MaxiCode -->
          <template v-else-if="store.format === 'maxicode'">
            <UFormField label="Mode">
              <USelect
                v-model="store.maxiMode"
                :items="[
                  { value: 2, label: 'Mode 2 — Structured carrier' },
                  { value: 3, label: 'Mode 3 — Structured carrier' },
                  { value: 4, label: 'Mode 4 — Standard security' },
                  { value: 5, label: 'Mode 5 — Full ECC' },
                  { value: 6, label: 'Mode 6 — Reader program' },
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </template>

          <!-- Han Xin -->
          <template v-else-if="store.format === 'hanxin'">
            <UFormField label="EC level (1-4)">
              <UInputNumber v-model="store.hanxinEcLevel" :min="1" :max="4" class="w-full" />
            </UFormField>
          </template>

          <!-- JABCode -->
          <template v-else-if="store.format === 'jabcode'">
            <UFormField label="Colors">
              <USelect
                v-model="store.jabColors"
                :items="[
                  { value: 4, label: '4 colors' },
                  { value: 8, label: '8 colors' },
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </template>

          <!-- Codablock F -->
          <template v-else-if="store.format === 'codablockf'">
            <UFormField label="Columns">
              <UInputNumber v-model="store.cbfColumns" :min="1" :max="62" class="w-full" placeholder="auto" />
            </UFormField>
          </template>

          <!-- GS1 Composite -->
          <template v-else-if="store.format === 'gs1-composite'">
            <UFormField label="Composite type">
              <USelect
                v-model="store.gs1CompType"
                :items="[
                  { value: 'cc-a', label: 'CC-A' },
                  { value: 'cc-b', label: 'CC-B' },
                  { value: 'cc-c', label: 'CC-C' },
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </template>
        </div>
      </UCard>
    </div>

    <!-- Preview -->
    <div class="lg:sticky lg:top-20 h-fit">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-semibold text-sm">Preview</p>
            <UBadge :label="store.format" variant="subtle" color="neutral" size="xs" />
          </div>
        </template>

        <CodePreview
          :result="store.result"
          :name="`2d-${store.format}`"
          :supports-p-n-g="true"
          :on-download-p-n-g="handlePNG"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FORMAT_GROUPS } from "~/stores/twod";

const store = useTwoDStore();
const { downloadSVGasPNG } = useDownload();

const SPECIFIC_OPTIONS = new Set([
  "pdf417", "aztec", "micropdf417", "rmqr", "maxicode",
  "hanxin", "jabcode", "codablockf", "gs1-composite",
]);

const hasSpecificOptions = computed(() => SPECIFIC_OPTIONS.has(store.format));

async function handlePNG(): Promise<Uint8Array> {
  if (store.supportsPNG) {
    return store.buildPNG();
  }
  // Fallback: convert SVG to PNG via canvas
  const svgString = store.buildSVG();
  return svgToPNG(svgString);
}
</script>
