import { eciToGeodetic, gstime, json2satrec, propagate, type SatRec } from 'satellite.js'
import type { SatelliteRecord } from '#shared/types/satellite'

export interface GeodeticPosition {
  longitude: number // radians
  latitude: number // radians
  heightKm: number
}

/** Decode orbital elements once — the result is reused for every propagation. */
export function toSatrec(record: SatelliteRecord): SatRec {
  return json2satrec(record)
}

// Call by CEsium when timeline is activated, passing its internal clock value (date) to determine entity position
/** SGP4 position at `date`, converted from TEME (inertial) to Earth-fixed lon/lat/height. */
export function positionAt(satrec: SatRec, date: Date): GeodeticPosition | null {
  const result = propagate(satrec, date)
  if (!result) return null // invalid elements or decayed satellite

  const geo = eciToGeodetic(result.position, gstime(date))
  return { longitude: geo.longitude, latitude: geo.latitude, heightKm: geo.height }
}
