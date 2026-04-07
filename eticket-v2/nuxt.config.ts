import { fileURLToPath, URL } from "node:url";

export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2025-11-11",
  alias: {
    etiket: fileURLToPath(new URL("../src/index.ts", import.meta.url)),
  },
  vite: {
    optimizeDeps: {
      include: ["tailwindcss/colors", "@vueuse/core"],
    },
  },
});

