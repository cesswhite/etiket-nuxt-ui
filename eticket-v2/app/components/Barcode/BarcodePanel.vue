<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Controls -->
    <div class="flex flex-col gap-5">
      <!-- Format + Data -->
      <UCard>
        <template #header>
          <p class="font-semibold text-sm">Barcode type</p>
        </template>

        <div class="flex flex-col gap-4">
          <UFormField label="Format">
            <USelectMenu
              v-model="store.type"
              :items="BARCODE_GROUPS"
              value-key="value"
              label-key="label"
              class="w-full"
              searchable
              @update:model-value="store.setType"
            />
          </UFormField>

          <UFormField label="Data" :hint="store.hint">
            <UInput v-model="store.data" class="w-full font-mono" placeholder="Enter data..." />
          </UFormField>
        </div>
      </UCard>

      <!-- Appearance -->
      <UCard>
        <template #header>
          <p class="font-semibold text-sm">Appearance</p>
        </template>

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Height">
              <UInputNumber v-model="store.height" :min="10" :max="400" class="w-full" />
            </UFormField>
            <UFormField label="Bar width">
              <UInputNumber v-model="store.barWidth" :min="1" :max="10" class="w-full" />
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

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Margin">
              <UInputNumber v-model="store.margin" :min="0" :max="50" class="w-full" />
            </UFormField>
            <UFormField label="Show text">
              <USelect
                v-model="store.showText"
                :items="[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <!-- Advanced -->
      <UCard>
        <template #header>
          <p class="font-semibold text-sm">Advanced options</p>
        </template>
        <div class="grid grid-cols-3 gap-4">
          <UFormField label="Rotation">
            <USelect
              v-model="store.rotation"
              :items="[
                { value: 0, label: '0°' },
                { value: 90, label: '90°' },
                { value: 180, label: '180°' },
                { value: 270, label: '270°' },
              ]"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Margin top">
            <UInputNumber v-model="store.marginTop" :min="0" :max="50" class="w-full" placeholder="auto" />
          </UFormField>
          <UFormField label="Margin bottom">
            <UInputNumber v-model="store.marginBottom" :min="0" :max="50" class="w-full" placeholder="auto" />
          </UFormField>
        </div>
      </UCard>
    </div>

    <!-- Preview (sticky on large screens) -->
    <div class="lg:sticky lg:top-20 h-fit">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-semibold text-sm">Preview</p>
            <UBadge :label="store.type" variant="subtle" color="neutral" size="xs" />
          </div>
        </template>

        <CodePreview
          :result="store.result"
          :name="`barcode-${store.type}`"
          :supports-p-n-g="store.supportsPNG"
          :on-download-p-n-g="store.supportsPNG ? () => store.buildPNG() : undefined"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BARCODE_GROUPS } from "~/stores/barcode";

const store = useBarcodeStore();
</script>
