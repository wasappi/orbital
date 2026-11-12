<script setup lang="ts">
    const {data: satelliteData} = useLazyFetch<SatelliteRecord[]>('/api/satellite', { default: () => [] })

    // Same rule as the point colors (shared/utils/constellations.ts)
    const sentinelCount = computed(() => satelliteData.value.filter(isSentinel).length)
</script>

<template>
  <main class="relative w-full h-screen overflow-hidden bg-slate-950 text-white">
    <header class="absolute top-4 left-4 z-10 bg-slate-900/80 p-4 rounded-xl backdrop-blur">
      <h1 class="text-xl font-bold">Satellite Tracker</h1>

      <ul class="mt-2 space-y-1 text-sm text-slate-300">
        <li class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-[#FFA500] ring-1 ring-white" />
          Copernicus Sentinels ({{ sentinelCount }})
        </li>
        <li class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-[#0000FF] ring-1 ring-white" />
          Aerospacelab ({{ satelliteData.length - sentinelCount }})
        </li>
      </ul>
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
