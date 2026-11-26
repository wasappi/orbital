# Orbital — Satellite Tracker

A real-time 3D satellite tracker built with Nuxt 4 and CesiumJS. It shows the Copernicus Sentinels and the Aerospacelab satellites on a globe and moves them along their orbits as time passes.

Live at **https://orbital.darkmode.sh**

## How it works

```
CelesTrak (OMM JSON) ──► /api/satellite (Nitro, cached 2h) ──► index.vue ──► Globe.client.vue (Cesium)
                                                                              └─ satellite.js (SGP4) propagates each frame
```

1. **Server**: [server/api/satellite.ts](server/api/satellite.ts) fetches the whole CelesTrak `active` catalog in OMM JSON format. It then keeps only:
   - satellites whose name contains `SENTINEL` (Copernicus)
   - a hand-picked list of NORAD IDs (the Aerospacelab satellites)
2. **Cache**: the CelesTrak call is cached for 2 hours (`defineCachedFunction`), and `/api/**` uses ISR with the same 2-hour window. CelesTrak blocks clients that request more often than that and returns a 403. In production the cache lives on disk at `/app/.data/cache`, on a Docker volume, so it survives redeploys.
3. **Client**: [app/components/Globe.client.vue](app/components/Globe.client.vue) creates a Cesium `Viewer` with Esri World Imagery, which needs no Cesium Ion token. Each satellite's position and info box are `CallbackProperty`s that run SGP4 at the Cesium clock time on every frame (see [shared/utils/orbit.ts](shared/utils/orbit.ts)). This keeps the timeline and animation controls working.

### Project layout

| Path | Purpose |
| --- | --- |
| `app/pages/index.vue` | Page, legend and per-constellation counts |
| `app/components/Globe.client.vue` | Cesium viewer and satellite entities (client-only) |
| `app/utils/satelliteInfo.ts` | HTML for the info box shown when a satellite is clicked |
| `server/api/satellite.ts` | CelesTrak fetch, filtering and cache |
| `server/routes/up.ts` | `GET /up` health check for kamal-proxy |
| `shared/utils/orbit.ts` | OMM → satrec → position helpers (satellite.js) |
| `shared/utils/constellations.ts` | Constellation rules and colors |
| `shared/types/satellite.ts` | `SatelliteRecord` type (alias of satellite.js `OMMJsonObject`) |

### Adding satellites

- **By name**: change `NAME_FILTER` in `server/api/satellite.ts`.
- **By NORAD ID**: add the ID to `NORAD_IDS` in the same file. Sources such as [Gunter's Space Page](https://space.skyrocket.de/directories/sat_eo_belgium.htm) list the IDs.
- **As a new constellation** (new color and legend entry): also update `shared/utils/constellations.ts` and the legend in `app/pages/index.vue`.

## Development

Requires Node 24 (the version the Docker image uses).

```bash
npm install     # postinstall also copies Cesium's static assets to public/cesium
npm run dev     # http://localhost:3000
```

`public/cesium` is generated and git-ignored. If Cesium fails to load its Workers or Assets, run `npm run cesium:copy`.

In development the Nitro cache is kept in memory, so restarting the dev server many times can still get you rate-limited by CelesTrak.

Other scripts:

```bash
npm run build     # production build in .output/
npm run preview   # serve the production build locally
```

## Deployment

Each push to `master` deploys automatically through [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

1. A GitHub arm64 runner builds the Docker image with the multi-stage [Dockerfile](Dockerfile) and pushes it to `ghcr.io/wasappi/orbital`.
2. [Kamal](https://kamal-deploy.org) deploys it over SSH to the server set in [config/deploy.yml](config/deploy.yml).
3. kamal-proxy switches traffic to the new container once `GET /up` returns 200. The check never calls CelesTrak, so a CelesTrak outage cannot block a deploy.
4. Nginx Proxy Manager in front of the server terminates TLS and forwards to kamal-proxy on port 8080. That kamal-proxy is shared with another app (geotool), so its `http_port`/`https_port` settings must stay the same in both apps.

Required GitHub secret: `DEPLOY_SSH_KEY`. The registry password comes from the workflow's `GITHUB_TOKEN` via `gh auth token` (see `.kamal/secrets`).

A manual deploy from your machine (Kamal 2.10.1) is also possible:

```bash
kamal deploy
```

## Credits

- Orbital data: [CelesTrak](https://celestrak.org)
- Propagation: [satellite.js](https://github.com/shashwatak/satellite-js)
- 3D globe: [CesiumJS](https://cesium.com/platform/cesiumjs/)
- Imagery: Esri World Imagery
