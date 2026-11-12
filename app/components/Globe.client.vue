
<script setup lang="ts">

// import { nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue' Auto imports so not necessary 
import { Cartesian3, ImageryLayer, OpenStreetMapImageryProvider, ArcGisMapServerImageryProvider, TileMapServiceImageryProvider, Viewer, Color, CallbackPositionProperty, JulianDate, buildModuleUrl,SkyBox, LabelStyle, VerticalOrigin, Cartesian2 } from 'cesium'

const container = useTemplateRef<HTMLDivElement>('container')
const prop = defineProps<{satellites: SatelliteRecord[]}>() //injected from index.vue via  <Globe :satellites="satelliteData" />

// either when data is actually injected in components (LazyFetch so no garantee data is present when viewer mount)
watch(() => prop.satellites, displaySatellites) 

let viewer: Viewer | null = null

onMounted(async () => {
  // .client.vue components render their template only after mount → wait one tick for the <div>
  await nextTick()
  if (!container.value) return

  viewer = new Viewer(container.value, {
    // Esri World Imagery: real satellite photos
    baseLayer: ImageryLayer.fromProviderAsync(
      ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      )
    ),

    baseLayerPicker: false, // picker lists Ion layers
    geocoder: false, // geocoder uses Ion
    timeline: true,  // enable Cesium internal clock to animate entities on a timeline or real time
    animation: true, // enable Cesium internal clock to animate entities on a timeline or real time
    useBrowserRecommendedResolution: false
  })

  viewer.clock.shouldAnimate = true
  viewer.scene.globe.enableLighting = true
  viewer.scene.skyBox.show = false


  // Start above Bxl
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(4.349394, 50.847767, 20_000_000),
  })
  

  // either when viewer is actually added to page (or via watch triggered when satellites data are injecyed in components)
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
      viewer?.entities.add({
        position: new CallbackPositionProperty((time) => {
            // Cesium calls this on EVERY frame, passing its clock time
            if (!time) return undefined
            const current_pos = positionAt(satrec, JulianDate.toDate(time))
            return current_pos ? Cartesian3.fromRadians(current_pos.longitude, current_pos.latitude, current_pos.heightKm * 1000) : undefined
          }, false),
        point: {
          pixelSize: 10,
          color: isSentinel(satellite) ? Color.ORANGE : Color.BLUE,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: satellite.OBJECT_NAME,                 
          font: '12px sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,          
          verticalOrigin: VerticalOrigin.BOTTOM,      
          pixelOffset: new Cartesian2(0, -10),       
      },
      });
    }
  })
}

</script>

<template>
  <div ref="container" class="w-full h-screen" />
</template>
