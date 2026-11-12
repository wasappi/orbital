import type { SatelliteRecord } from '#shared/types/satellite'

// Fetch entire Celestrak catalog and filter after
const CELESTRAK_QUERY = { GROUP: 'active', FORMAT: 'json' }

const NAME_FILTER = 'SENTINEL' // Copernicus Sentinels
//https://space.skyrocket.de/directories/sat_eo_belgium.htm
const NORAD_IDS = new Set([
    // Aerospacelab
    66764, // NAHLA
    59137, // VSP RF B1 Riri
    59136, // VSP RF C1 Loulou
    59135, // VSP RF A1 Fifi
    59124, // VSP ROSE
    58298, // SPIP
    56946, // GREGOIRE
])


const fetchActiveSatellites = defineCachedFunction(async (): Promise<SatelliteRecord[]> => {
    let data: unknown
    try {
        data = await $fetch('https://celestrak.org/NORAD/elements/gp.php', { query: CELESTRAK_QUERY })
    } catch {
        throw createError({ statusCode: 502, statusMessage: 'CelesTrak request failed' })
    }
    // CelesTrak answers 200 + plain text when blocked or when nothing matches → don't pass it on
    if (!Array.isArray(data)) {
        throw createError({ statusCode: 502, statusMessage: `CelesTrak: ${String(data).slice(0, 200)}` })
    }
    return data as SatelliteRecord[]
}, {
    name: 'celestrak',
    maxAge: 60 * 60 * 2,
    getKey: () => new URLSearchParams(CELESTRAK_QUERY).toString(), // 
})

export default defineEventHandler(async (): Promise<SatelliteRecord[]> => {
    const all = await fetchActiveSatellites()
    return all.filter((sat) =>
        sat.OBJECT_NAME.includes(NAME_FILTER) || NORAD_IDS.has(Number(sat.NORAD_CAT_ID)),
    )
})
