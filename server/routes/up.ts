// Health check for kamal-proxy: it polls GET /up and only switches traffic to a new container once this answers 200.
// Deliberately trivial: no CelesTrak call, so a CelesTrak outage never blocks a deploy.
export default defineEventHandler(() => 'OK')
