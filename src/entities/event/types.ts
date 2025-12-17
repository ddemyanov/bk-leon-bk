export type EventStatus = 'scheduled' | 'live' | 'finished'

export interface EventEntity {
  id: number
  teamA: string
  teamB: string
  score: string
  coeff: number
  prevCoeff?: number
  lastUpdated: number
}

export interface OddsUpdate {
  id: number
  coeff: number
  at: number
}

export interface EventsState {
  entities: Record<number, EventEntity>
  ids: number[]
  loading: boolean
  error: string | null
  liveConnected: boolean
  lastSnapshotAt: number | null
}
