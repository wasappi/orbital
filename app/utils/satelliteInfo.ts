import { degreesLat, degreesLong } from "satellite.js"

export function satelliteDescription(sat: SatelliteRecord, live: GeodeticPosition | null): string {
    const intlDesignator = String(sat.OBJECT_ID) // ex "2024-043A": launch year - launch number of that year + piece

    // [label, value] loop on map
    const rows: [string, string | number][] = [
        ['Constellation', isSentinel(sat) ? 'Copernicus Sentinel' : 'Aerospacelab'],
        ['NORAD ID', sat.NORAD_CAT_ID],
        ['Intl. designator', intlDesignator],
        ['Launch year', intlDesignator.slice(0, 4)],
        ['Inclination', `${Number(sat.INCLINATION).toFixed(1)}°`],
        ['More', `<a href="https://www.n2yo.com/satellite/?s=${sat.NORAD_CAT_ID}" target="_blank" rel="noopener">N2YO</a>`],
    ]

    if (live) {
        rows.push(
            ['Altitude', `${live.heightKm.toFixed(0)} km`],
            ['Latitude', `${degreesLat(live.latitude).toFixed(2)}°`],
            ['Longitude', `${degreesLong(live.longitude).toFixed(2)}°`],
        )
    }

    const html = rows
        .map(([label, value]) => `
        <tr>
          <th style="text-align:left; padding:2px 12px 2px 0; font-weight:600;">${label}</th>
          <td style="padding:2px 0;">${value}</td>
        </tr>`)
        .join('')

    return `<table style="border-collapse:collapse;">${html}</table>`
}
