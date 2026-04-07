<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Controls -->
    <div class="flex flex-col gap-5">
      <!-- Data + Mode -->
      <UCard>
        <template #header>
          <p class="font-semibold text-sm">QR Code data</p>
        </template>
        <div class="flex flex-col gap-4">
          <UFormField label="Data">
            <UTextarea v-model="store.data" class="w-full font-mono" autoresize :maxrows="4" placeholder="Enter text, URL..." />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Mode">
              <USelect
                v-model="store.mode"
                :items="[{ value: 'regular', label: 'QR Code' }, { value: 'micro', label: 'Micro QR' }]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Error correction">
              <USelect
                v-model="store.ecLevel"
                :items="[
                  { value: 'L', label: 'L — 7%' },
                  { value: 'M', label: 'M — 15%' },
                  { value: 'Q', label: 'Q — 25%' },
                  { value: 'H', label: 'H — 30%' },
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Size (px)">
              <UInputNumber v-model="store.size" :min="64" :max="1024" class="w-full" />
            </UFormField>
            <UFormField label="Margin">
              <UInputNumber v-model="store.margin" :min="0" :max="20" class="w-full" />
            </UFormField>
          </div>
        </div>
      </UCard>

      <!-- Style (regular QR only) -->
      <template v-if="!store.isMicro">
        <UCard>
          <template #header>
            <p class="font-semibold text-sm">Style</p>
          </template>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Shape">
                <USelect
                  v-model="store.shape"
                  :items="[
                    { value: 'square', label: 'Square' },
                    { value: 'circle', label: 'Circle' },
                    { value: 'squircle', label: 'Squircle' },
                  ]"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Dot type">
                <USelect
                  v-model="store.dotType"
                  :items="dotTypeItems"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField :label="`Dot size — ${store.dotSize.toFixed(1)}`">
              <USlider v-model="store.dotSize" :min="0.5" :max="1.5" :step="0.05" class="w-full" />
            </UFormField>
          </div>
        </UCard>

        <!-- Color -->
        <UCard>
          <template #header>
            <p class="font-semibold text-sm">Foreground color</p>
          </template>
          <div class="flex flex-col gap-4">
            <UFormField label="Mode">
              <USelect
                v-model="store.colorMode"
                :items="[
                  { value: 'solid', label: 'Solid' },
                  { value: 'linear', label: 'Linear gradient' },
                  { value: 'radial', label: 'Radial gradient' },
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
            <div v-if="store.colorMode === 'solid'">
              <UInput v-model="store.color" type="color" class="w-full h-9" />
            </div>
            <div v-else-if="store.colorMode === 'linear'" class="flex flex-col gap-3">
              <div class="grid grid-cols-2 gap-3">
                <UFormField label="Start">
                  <UInput v-model="store.gradStart" type="color" class="w-full h-9" />
                </UFormField>
                <UFormField label="End">
                  <UInput v-model="store.gradEnd" type="color" class="w-full h-9" />
                </UFormField>
              </div>
              <UFormField :label="`Rotation — ${store.gradRot}°`">
                <USlider v-model="store.gradRot" :min="0" :max="360" :step="15" class="w-full" />
              </UFormField>
            </div>
            <div v-else-if="store.colorMode === 'radial'" class="grid grid-cols-2 gap-3">
              <UFormField label="Inner">
                <UInput v-model="store.radialStart" type="color" class="w-full h-9" />
              </UFormField>
              <UFormField label="Outer">
                <UInput v-model="store.radialEnd" type="color" class="w-full h-9" />
              </UFormField>
            </div>
          </div>
        </UCard>

        <!-- Background -->
        <UCard>
          <template #header>
            <p class="font-semibold text-sm">Background</p>
          </template>
          <div class="flex flex-col gap-4">
            <UFormField label="Mode">
              <USelect
                v-model="store.bgMode"
                :items="[
                  { value: 'solid', label: 'Solid' },
                  { value: 'transparent', label: 'Transparent' },
                  { value: 'linear', label: 'Linear gradient' },
                  { value: 'radial', label: 'Radial gradient' },
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
            <div v-if="store.bgMode === 'solid'">
              <UInput v-model="store.bgColor" type="color" class="w-full h-9" />
            </div>
            <div v-else-if="store.bgMode === 'linear'" class="flex flex-col gap-3">
              <div class="grid grid-cols-2 gap-3">
                <UFormField label="Start">
                  <UInput v-model="store.bgGradStart" type="color" class="w-full h-9" />
                </UFormField>
                <UFormField label="End">
                  <UInput v-model="store.bgGradEnd" type="color" class="w-full h-9" />
                </UFormField>
              </div>
              <UFormField :label="`Rotation — ${store.bgGradRot}°`">
                <USlider v-model="store.bgGradRot" :min="0" :max="360" :step="15" class="w-full" />
              </UFormField>
            </div>
            <div v-else-if="store.bgMode === 'radial'" class="grid grid-cols-2 gap-3">
              <UFormField label="Inner">
                <UInput v-model="store.bgRadialStart" type="color" class="w-full h-9" />
              </UFormField>
              <UFormField label="Outer">
                <UInput v-model="store.bgRadialEnd" type="color" class="w-full h-9" />
              </UFormField>
            </div>
          </div>
        </UCard>

        <!-- Corners -->
        <UCard>
          <template #header>
            <p class="font-semibold text-sm">Corner style</p>
          </template>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Outer shape">
                <USelect
                  v-model="store.cornerOuter"
                  :items="cornerShapeItems"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Inner shape">
                <USelect
                  v-model="store.cornerInner"
                  :items="cornerShapeItems"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Outer color">
                <UInput v-model="store.cornerColor" type="color" class="w-full h-9" />
              </UFormField>
              <UFormField label="Inner color">
                <UInput v-model="store.cornerInnerColor" type="color" class="w-full h-9" />
              </UFormField>
            </div>
          </div>
        </UCard>

        <!-- Logo -->
        <UCard>
          <template #header>
            <p class="font-semibold text-sm">Logo</p>
          </template>
          <div class="flex flex-col gap-4">
            <UFormField label="Logo type">
              <USelect
                v-model="store.logoType"
                :items="[
                  { value: 'none', label: 'None' },
                  { value: 'path', label: 'SVG path' },
                  { value: 'url', label: 'Image URL' },
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
            <UFormField v-if="store.logoType === 'path'" label="SVG path">
              <UInput v-model="store.logoPath" class="w-full font-mono" placeholder="M0 0 L..." />
            </UFormField>
            <UFormField v-if="store.logoType === 'url'" label="Image URL">
              <UInput v-model="store.logoUrl" class="w-full" placeholder="https://..." />
            </UFormField>
            <div v-if="store.logoType !== 'none'" class="grid grid-cols-2 gap-4">
              <UFormField :label="`Size — ${store.logoSize.toFixed(2)}`">
                <USlider v-model="store.logoSize" :min="0.1" :max="0.4" :step="0.01" class="w-full" />
              </UFormField>
              <UFormField label="Logo margin">
                <UInputNumber v-model="store.logoMargin" :min="0" :max="20" class="w-full" />
              </UFormField>
            </div>
          </div>
        </UCard>
      </template>
    </div>

    <!-- Preview -->
    <div class="lg:sticky lg:top-20 h-fit">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-semibold text-sm">Preview</p>
            <UBadge :label="store.isMicro ? 'Micro QR' : 'QR Code'" variant="subtle" color="neutral" size="xs" />
          </div>
        </template>

        <CodePreview
          :result="store.result"
          :name="store.isMicro ? 'qr-micro' : 'qrcode'"
          :supports-p-n-g="!store.isMicro"
          :on-download-p-n-g="!store.isMicro ? () => store.buildPNG() : undefined"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useQRStore();

const dotTypeItems = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy rounded" },
  { value: "diamond", label: "Diamond" },
  { value: "star", label: "Star" },
  { value: "thin-diamond", label: "Thin diamond" },
  { value: "cross", label: "Cross" },
  { value: "vertical-line", label: "Vertical line" },
  { value: "horizontal-line", label: "Horizontal line" },
];

const cornerShapeItems = [
  { value: "", label: "Default" },
  { value: "square", label: "Square" },
  { value: "extra-rounded", label: "Rounded" },
  { value: "dot", label: "Dot" },
];
</script>
