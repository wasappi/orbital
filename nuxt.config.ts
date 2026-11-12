import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  $production: {
    routeRules: {
      '/api/**': { isr: 7200 }
    },
  },
  $development: {
    //
  },
  $env: {
    staging: {
      //
    }
  },
  runtimeConfig: {
    apiSecret: '',
    public: {
      apiBase: '/api',
    },
  },
  css: ['~/assets/css/main.css', 'cesium/Build/Cesium/Widgets/widgets.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    define: {
      // Where Cesium loads its runtime assets (Workers, Assets, Widgets) from — see public/cesium
      CESIUM_BASE_URL: JSON.stringify('/cesium'),
    },
    // satellite.js ships a WASM build whose Web Worker uses top-level await,
    // which the default 'iife' worker format can't bundle → production build fails
    worker: {
      format: 'es',
    },
  },
})
