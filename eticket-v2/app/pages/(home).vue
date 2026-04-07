<template>
  <div class="flex flex-col gap-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Barcode & QR Generator</h1>
      <p class="text-sm text-muted mt-1">
        40+ formats — SVG & PNG output, styled QR codes, zero dependencies.
      </p>
    </div>

    <!-- Main tabs -->
    <UTabs v-model="activeTab" :items="tabs" variant="link" class="w-full">
      <template #content="{ item }">
        <div class="pt-6">
          <BarcodePanel v-if="item.value === 'barcodes'" />
          <QRPanel v-else-if="item.value === 'qr'" />
          <TwoDPanel v-else-if="item.value === '2d'" />
          <HelpersPanel v-else-if="item.value === 'helpers'" />
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "main" });

const activeTab = ref("barcodes");

const tabs = [
  { label: "Barcodes", value: "barcodes", icon: "i-lucide-scan-barcode" },
  { label: "QR Code", value: "qr", icon: "i-lucide-qr-code" },
  { label: "2D Codes", value: "2d", icon: "i-lucide-grid-2x2" },
  { label: "Helpers", value: "helpers", icon: "i-lucide-wrench" },
];

useSeoMeta({
  title: "etiket — Barcode & QR Generator",
  description:
    "Zero-dependency barcode & QR code generator. 40+ formats, styled QR codes, SVG & PNG output.",
});
</script>
