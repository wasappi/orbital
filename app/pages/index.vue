<script setup lang="ts">
    const {data: satelliteData} = useLazyFetch<SatelliteRecord[]>('/api/satellite', { default: () => [] })
</script>

<template>
  <main class="relative w-full h-screen overflow-hidden bg-slate-950 text-white">
    <header class="absolute top-4 left-4 z-10 bg-slate-900/80 p-4 rounded-xl backdrop-blur">
      <h1 class="text-xl font-bold">Satellite Tracker</h1>
      <p class="text-sm text-slate-400">Powered by Cesium</p>
    </header>

    <!-- Heavy WebGL lib are commonly rendered client side only-->
    <ClientOnly>
      <Globe :satellites="satelliteData" />
      <template #fallback>
        <div class="flex items-center justify-center w-full h-screen bg-slate-950 text-slate-400 animate-pulse">
          <p>Loading globe...</p>
        </div>
      </template>
    </ClientOnly>
  </main>
</template>
