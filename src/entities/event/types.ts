import type { ApiEvent } from '@/shared/api/eventsApi'

export type EventStatus = 'scheduled' | 'live' | 'finished'

export interface Event extends ApiEvent {
  prevCoeff?: number
  lastUpdatedAt: number
}

export interface EventUpdate {
  id: number
  coeff: number
  at: number
}

export interface EventsState {
  events: Record<number, Event>
  ids: number[]
  loading: boolean
  error: string | null
  liveConnected: boolean
}
