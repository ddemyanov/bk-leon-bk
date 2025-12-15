<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { EventEntity } from '@/entities/event/types'
import { useEventsStore } from '@/entities/event/store'

const props = defineProps<{
  event: EventEntity
  live?: boolean
}>()

const eventsStore = useEventsStore()
const resetTimer = ref<number | null>(null)

const trendClass = computed(() => {
  if (props.event.trend === 'up') return 'trend-up'
  if (props.event.trend === 'down') return 'trend-down'
  return ''
})

watch(
  () => props.event.trend,
  (next) => {
    if (!next) return
    if (resetTimer.value) {
      window.clearTimeout(resetTimer.value)
    }
    resetTimer.value = window.setTimeout(() => {
      eventsStore.clearTrend(props.event.id)
      resetTimer.value = null
    }, 1200)
  },
)

onBeforeUnmount(() => {
  if (resetTimer.value) {
    window.clearTimeout(resetTimer.value)
  }
})
</script>

<template>
  <article class="event-card glass-card" :class="trendClass">
    <header class="card-header">
      <div class="teams">
        <div class="team">{{ event.teamA }}</div>
        <div class="vs">vs</div>
        <div class="team">{{ event.teamB }}</div>
      </div>
      <div class="meta">
        <span class="pill" v-if="live">LIVE</span>
        <span class="time text-muted" v-else>Запланировано</span>
      </div>
    </header>

    <div class="card-body">
      <div class="score">{{ event.score }}</div>
      <div class="odds">
        <span class="odds-value">{{ event.coeff.toFixed(2) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  position: relative;
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: var(--shadow-strong);
  background: rgba(255, 255, 255, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.teams {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.team {
  font-size: 15px;
}

.vs {
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.4px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time {
  font-size: 12px;
}

.card-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.score {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
}

.odds {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--card-border);
}

.odds-value {
  font-weight: 700;
  font-size: 18px;
}

.trend-up {
  border-color: rgba(74, 222, 128, 0.4);
  box-shadow: 0 14px 40px rgba(74, 222, 128, 0.18);
  animation: glow-up 0.9s ease;
}

.trend-down {
  border-color: rgba(248, 113, 113, 0.45);
  box-shadow: 0 14px 40px rgba(248, 113, 113, 0.2);
  animation: glow-down 0.9s ease;
}

@keyframes glow-up {
  0% {
    box-shadow: 0 0 0 rgba(74, 222, 128, 0.4);
  }
  100% {
    box-shadow: 0 14px 40px rgba(74, 222, 128, 0.18);
  }
}

@keyframes glow-down {
  0% {
    box-shadow: 0 0 0 rgba(248, 113, 113, 0.45);
  }
  100% {
    box-shadow: 0 14px 40px rgba(248, 113, 113, 0.2);
  }
}

@media (max-width: 640px) {
  .card-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .score {
    font-size: 22px;
  }
}
</style>
