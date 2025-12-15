export interface ApiEvent {
  id: number
  teamA: string
  teamB: string
  score: string
  coeff: number
}

export async function fetchEvents(): Promise<ApiEvent[]> {
  const response = await fetch('/api/events')
  if (!response.ok) {
    throw new Error('Не удалось загрузить события')
  }
  return response.json()
}
