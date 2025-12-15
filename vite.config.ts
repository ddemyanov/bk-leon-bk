import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

const mockEvents = [
  { id: 1, teamA: 'Team Alpha', teamB: 'Team Beta', score: '1:2', coeff: 1.85 },
  { id: 2, teamA: 'Red Wolves', teamB: 'Blue Sharks', score: '0:0', coeff: 2.1 },
  { id: 3, teamA: 'Night Owls', teamB: 'Silver Foxes', score: '2:1', coeff: 1.65 },
]

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
    {
      name: 'mock-api-and-ws',
      configureServer(server) {
        server.middlewares.use('/api/events', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(mockEvents))
        })

        const oddsMap = new Map<number, number>(mockEvents.map((e) => [e.id, e.coeff]))
        const clients = new Set<any>()

        const emitRandomUpdate = () => {
          if (!clients.size || !oddsMap.size) return
          const ids = Array.from(oddsMap.keys())
          const pickedId = ids[Math.floor(Math.random() * ids.length)]
          const current = oddsMap.get(pickedId) ?? 1.1
          const drift = randomBetween(-0.2, 0.25)
          const next = Math.max(1.05, Number((current + drift).toFixed(2)))
          oddsMap.set(pickedId, next)
          const payload = JSON.stringify({ id: pickedId, coeff: next, at: Date.now() })
          clients.forEach((ws) => ws.send(payload))
        }

        const scheduleNext = () => {
          const delay = randomBetween(1000, 3000)

          setTimeout(() => {
            emitRandomUpdate()
            scheduleNext()
          }, delay)
        }
        scheduleNext()

        server.ws.on('connection', (ws, req) => {
          if (req.url !== '/ws/odds') return
          clients.add(ws)
          ws.on('close', () => clients.delete(ws))
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
