
<script setup lang="ts">

// import { nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue' Auto imports so not necessary 
import { Cartesian3, ImageryLayer, OpenStreetMapImageryProvider, Viewer, Color } from 'cesium'

const container = useTemplateRef<HTMLDivElement>('container')
const prop = defineProps<{satellites: SatelliteRecord[]}>() //injected from index.vue via  <Globe :satellites="satelliteData" />

// either when data is actually injected in components (LazyFetch so no garantee data is present when viewer mount)
watch(() => prop.satellites, displaySatellites) 

// Plain variable on purpose: making the Viewer reactive would deep-proxy Cesium internals
let viewer: Viewer | null = null

onMounted(async () => {
  // .client.vue components render their template only after mount → wait one tick for the <div>
  await nextTick()
  if (!container.value) return

  viewer = new Viewer(container.value, {
    // OSM imagery instead of the default Ion/Bing layer → no Ion token needed
    baseLayer: new ImageryLayer(
      new OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' }),
    ),
    baseLayerPicker: false, // picker lists Ion layers
    geocoder: false, // geocoder uses Ion
    timeline: false, // re-enabled in step 5
    animation: false,
  })

  // Start above Paris, far enough to see the whole globe
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(2.3522, 48.8566, 20_000_000),
  })

  // either when viewer is actually added to page
  displaySatellites()

})

onBeforeUnmount(() => {
  // Free the WebGL context (otherwise leaks on navigation / HMR)
  viewer?.destroy()
  viewer = null

})
 
function displaySatellites() {
  if (!viewer) return                 // viewer not created yet → do nothing
  viewer.entities.removeAll()         // Remove all like pins on a map
  prop.satellites.forEach((satellite) => {

    // Helper methods from /shared/orbit.ts (auto imported when on /shared)
    // Chain is 
    // take OMM data from celestrak, 
    // pass it to toSatrec to decode it and get a SatRec object containing epoch, orbital data, ... computed with all the space constraints
    // Get the now satRec using positionAt, then converts it to km type values and add it to cesium globe viewer
    const satrec = toSatrec(satellite)
    const pos = positionAt(satrec, new Date())
    if (pos) {
      const cartesian = Cartesian3.fromRadians(
        pos.longitude,        // Already in radians
        pos.latitude,         // Already in radians
        pos.heightKm * 1000   // Convert kilometers to meters
      );
      const entity = viewer?.entities.add({
        position: cartesian,
        point: {
          pixelSize: 10,
          color: Color.BLUE,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
      });
    }
  })
}

</script>

<template>
  <div ref="container" class="w-full h-screen" />
</template>
