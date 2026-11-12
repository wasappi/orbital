import type { SatelliteRecord } from '#shared/types/satellite'

// Cached 2h: CelesTrak updates GP data a few times a day and blocks clients that poll too often
export default defineCachedEventHandler(async (): Promise<SatelliteRecord[]> => {
    try {
        return await $fetch<SatelliteRecord[]>('https://celestrak.org/NORAD/elements/gp.php', {
            query: { GROUP: 'galileo', FORMAT: 'json' },
        })
    } catch {
        throw createError({
            statusCode: 502,
            statusMessage: 'An error occurred while fetching satellites data from CelesTrak',
        })
    }
}, { maxAge: 60 * 60 * 2 })
