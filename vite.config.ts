import { fileURLToPath, URL } from 'node:url'
import { WebSocketServer } from 'ws'

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
        const globalClients = new Set<WebSocket>()
        const eventClients = new Map<number, Set<WebSocket>>()

        const wss = new WebSocketServer({ noServer: true })

        wss.on('connection', (ws, req) => {
          const url = new URL(req.url ?? '/', 'http://localhost')
          const path = url.pathname
          if (path === '/ws/odds') {
            globalClients.add(ws)
            ws.on('close', () => globalClients.delete(ws))
            return
          }
          const match = path.match(/^\/ws\/odds\/(\d+)$/)
          if (match) {
            const eventId = Number(match[1])
            const bucket = eventClients.get(eventId) ?? new Set<WebSocket>()
            bucket.add(ws)
            eventClients.set(eventId, bucket)
            ws.on('close', () => bucket.delete(ws))
            return
          }
          ws.close()
        })

        server.httpServer?.on('upgrade', (req, socket, head) => {
          const url = new URL(req.url ?? '/', 'http://localhost')
          if (url.pathname === '/ws/odds' || url.pathname.startsWith('/ws/odds/')) {
            wss.handleUpgrade(req, socket, head, (ws) => {
              wss.emit('connection', ws, req)
            })
          }
        })

        const emitRandomUpdate = () => {
          const hasGlobal = globalClients.size > 0
          const targetedIds = Array.from(eventClients.keys()).filter((id) => {
            const set = eventClients.get(id)
            return set && set.size > 0
          })
          if (!hasGlobal && targetedIds.length === 0) return

          const ids = Array.from(oddsMap.keys())
          const pickPool = targetedIds.length ? targetedIds : ids
          const pickedId = pickPool[Math.floor(Math.random() * pickPool.length)]
          const current = oddsMap.get(pickedId) ?? 1.1
          const drift = randomBetween(-0.2, 0.25)
          const next = Math.max(1.05, Number((current + drift).toFixed(2)))
          oddsMap.set(pickedId, next)
          const payload = JSON.stringify({ id: pickedId, coeff: next, at: Date.now() })

          if (hasGlobal) {
            globalClients.forEach((ws) => ws.send(payload))
          }

          const bucket = eventClients.get(pickedId)
          if (bucket) {
            bucket.forEach((ws) => ws.send(payload))
          }
        }

        const scheduleNext = () => {
          const delay = randomBetween(1000, 3000)

          setTimeout(() => {
            emitRandomUpdate()
            scheduleNext()
          }, delay)
        }
        scheduleNext()
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
