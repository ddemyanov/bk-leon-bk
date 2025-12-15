import { defineStore } from 'pinia'
import { fetchEvents, type ApiEvent } from '@/shared/api/eventsApi'
import type { EventEntity, EventsState, OddsUpdate } from './types'

const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/odds`
let ws: WebSocket | null = null

function mapApiEvent(payload: ApiEvent): EventEntity {
  return {
    id: payload.id,
    teamA: payload.teamA,
    teamB: payload.teamB,
    score: payload.score,
    coeff: payload.coeff,
    status: 'live',
    lastUpdated: Date.now(),
  }
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    entities: {},
    ids: [],
    loading: false,
    error: null,
  }),
  getters: {
    list(state): EventEntity[] {
      return state.ids
        .map((id) => state.entities[id])
        .filter((event): event is EventEntity => Boolean(event))
    },
  },
  actions: {
    async loadEvents() {
      try {
        this.loading = true
        this.error = null
        const events = await fetchEvents()
        this.upsertMany(events.map(mapApiEvent))
        this.connectOdds()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить события'
      } finally {
        this.loading = false
      }
    },
    upsertMany(events: EventEntity[]) {
      events.forEach((event) => {
        this.entities[event.id] = { ...this.entities[event.id], ...event }
        if (!this.ids.includes(event.id)) {
          this.ids.push(event.id)
        }
      })
    },
    applyOddsUpdate(update: OddsUpdate) {
      const target = this.entities[update.id]
      if (!target) return
      this.entities[update.id] = {
        ...target,
        prevCoeff: target.coeff,
        coeff: update.coeff,
        lastUpdated: update.at,
      }
    },
    connectOdds() {
      if (ws) {
        ws.close()
        ws = null
      }
      ws = new WebSocket(WS_URL)
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as OddsUpdate | { type?: string }
          if ('id' in payload && 'coeff' in payload) {
            this.applyOddsUpdate({
              id: Number(payload.id),
              coeff: Number(payload.coeff),
              at: 'at' in payload && typeof payload.at === 'number' ? payload.at : Date.now(),
            })
          }
        } catch (e) {
          console.warn('Failed to parse ws payload', e)
        }
      }
    },
  },
})
