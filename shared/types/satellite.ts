import type { OMMJsonObject } from 'satellite.js'

/**
 * OMM is the prefered method as the tle format does not allow enough ID length for the current satellite ids + We can directly use the built in Interface typeOMMJsonObject
 * One satellite as returned by CelesTrak in OMM JSON format (FORMAT=json).
 * Alias kept so the rest of the app doesn't depend on the satellite.js type name.
 *
 * Example (https://celestrak.org/NORAD/elements/gp.php?GROUP=galileo&FORMAT=json):
 * {
 *   "OBJECT_NAME": "GSAT0101 (GALILEO-PFM)", "OBJECT_ID": "2011-060A", "NORAD_CAT_ID": 37846,
 *   "EPOCH": "2026-11-08T17:38:13.626144", "MEAN_MOTION": 1.70475767, "ECCENTRICITY": 0.0002078,
 *   "INCLINATION": 56.9356, "RA_OF_ASC_NODE": 337.8348, "ARG_OF_PERICENTER": 308.4031,
 *   "MEAN_ANOMALY": 51.6274, "BSTAR": 0, "MEAN_MOTION_DOT": -8.3e-7, "MEAN_MOTION_DDOT": 0, ...
 * }
 */
export type SatelliteRecord = OMMJsonObject
