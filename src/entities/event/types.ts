export type EventStatus = 'scheduled' | 'live' | 'finished'
export type OddsDirection = 'up' | 'down'

export interface EventEntity {
  id: number
  teamA: string
  teamB: string
  score: string
  coeff: number
  prevCoeff?: number
  trend?: OddsDirection | null
  trendAt?: number | null
  status: EventStatus
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
