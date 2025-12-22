import { defineStore } from 'pinia'
import { fetchEvents, type ApiEvent } from '@/shared/api/eventsApi'
import type { Event, EventsState, EventUpdate } from './types'

const WS_BASE = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`
let ws: WebSocket | null = null

function mapApiEvent(payload: ApiEvent): Event {
  return {
    ...payload,
    lastUpdatedAt: Date.now(),
  }
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    // Нормализованный список событий
    events: {},
    // Храним ids, чтобы помнить изначальный порядок сортировки
    ids: [],
    loading: false,
    error: null,
    liveConnected: false,
  }),

  getters: {
    // Оставил как пример получения полного списка, если это потребуется в дальнейшем
    // list(state): Event[] {
    //   return state.ids
    //     .map((id) => state.events[id])
    //     .filter((event): event is Event => Boolean(event))
    // },

    byId: (state) => (id: number) => state.events[id] ?? null,
  },

  actions: {
    async loadEvents() {
      try {
        this.loading = true
        this.error = null

        const events = await fetchEvents()

        this.updateEvents(events.map(mapApiEvent))
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить события'
      } finally {
        this.loading = false
      }
    },

    updateEvents(events: Event[]) {
      const nextIds: number[] = []

      events.forEach((event) => {
        const current = this.events[event.id]
        const merged: Event = current ? { ...event, prevCoeff: current.prevCoeff } : event

        this.events[event.id] = merged
        nextIds.push(event.id)
      })

      this.ids = nextIds
    },

    updateSingleEvent(update: EventUpdate) {
      const target = this.events[update.id]

      if (!target) return

      this.events[update.id] = {
        ...target,
        prevCoeff: target.coeff,
        coeff: update.coeff,
        lastUpdatedAt: update.at,
      }
    },

    enableLiveUpdates(eventId?: number) {
      if (ws) {
        ws.close()
        ws = null
      }

      const path = eventId ? `/ws/events/${eventId}` : '/ws/events'

      ws = new WebSocket(`${WS_BASE}${path}`)
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)

          if ('id' in payload && 'coeff' in payload) {
            this.updateSingleEvent({
              id: payload.id,
              coeff: payload.coeff,
              at: Date.now(),
            })
          }
        } catch (e) {
          console.warn('Failed to parse ws payload', e)
        }
      }

      ws.onopen = () => {
        this.liveConnected = true
      }

      ws.onclose = () => {
        this.liveConnected = false
        ws = null
      }

      ws.onerror = () => {
        this.liveConnected = false
      }
    },

    disableLiveUpdates() {
      if (!ws) return

      ws.close()
      ws = null
      this.liveConnected = false
    },
  },
})
