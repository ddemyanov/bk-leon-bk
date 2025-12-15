<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { EventEntity } from '@/entities/event/types'
import { useEventsStore } from '@/entities/event/store'

const props = defineProps<{ event: EventEntity | null; live: boolean }>()

const eventsStore = useEventsStore()
const resetTimer = ref<number | null>(null)

const trendClass = computed(() => {
  if (!props.event) return ''
  if (props.event.trend === 'up') return 'trend-up'
  if (props.event.trend === 'down') return 'trend-down'
  return ''
})

watch(
  // зачем это?
  () => props.event?.trend,
  (next) => {
    if (!props.event || !next) return
    if (resetTimer.value) {
      window.clearTimeout(resetTimer.value)
    }
    resetTimer.value = window.setTimeout(() => {
      eventsStore.clearTrend(props.event!.id)
      resetTimer.value = null
    }, 1400)
  },
)

onBeforeUnmount(() => {
  if (resetTimer.value) {
    window.clearTimeout(resetTimer.value)
  }
})
</script>

<template>
  <section class="glass-card event-details" :class="trendClass" v-if="event">
    <div class="details-header">
      <div>
        <div class="details-title">Матч</div>
        <div class="details-meta text-muted">
          {{ live ? 'Live поток активен' : 'Офлайн' }}
        </div>
      </div>
      <div class="badge" :class="live ? 'badge-on' : 'badge-off'">
        {{ live ? 'LIVE' : 'OFF' }}
      </div>
    </div>

    <div class="details-teams">
      <div class="team">{{ event.teamA }}</div>
      <div class="score">{{ event.score }}</div>
      <div class="team">{{ event.teamB }}</div>
    </div>

    <div class="details-odds">
      <div class="label text-muted">Коэффициент</div>
      <div class="value">{{ event.coeff.toFixed(2) }}</div>
      <div class="label text-muted">Обновлено</div>
      <div class="value small">
        {{ new Date(event.lastUpdated).toLocaleTimeString() }}
      </div>
    </div>
  </section>
  <section v-else class="glass-card event-details">
    <div class="empty">Событие не найдено</div>
  </section>
</template>

<style scoped>
.event-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-title {
  font-size: 18px;
  font-weight: 700;
}

.details-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.team {
  font-size: 18px;
  font-weight: 600;
}

.score {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 1px;
}

.details-odds {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  align-items: center;
}

.label {
  font-size: 13px;
}

.value {
  font-size: 20px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.value.small {
  font-size: 14px;
  font-weight: 500;
}

.badge {
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  border: 1px solid var(--card-border);
  font-size: 12px;
}

.badge-on {
  background: rgba(74, 222, 128, 0.15);
  color: var(--success);
  border-color: rgba(74, 222, 128, 0.4);
}

.badge-off {
  background: rgba(248, 113, 113, 0.18);
  color: var(--danger);
  border-color: rgba(248, 113, 113, 0.4);
}

.empty {
  font-size: 14px;
  color: var(--text-muted);
}

.trend-up {
  border-color: rgba(74, 222, 128, 0.4);
  box-shadow: 0 14px 40px rgba(74, 222, 128, 0.2);
  animation: glow-up 1s ease;
}

.trend-down {
  border-color: rgba(248, 113, 113, 0.45);
  box-shadow: 0 14px 40px rgba(248, 113, 113, 0.24);
  animation: glow-down 1s ease;
}

@keyframes glow-up {
  0% {
    box-shadow: 0 0 0 rgba(74, 222, 128, 0.35);
  }
  100% {
    box-shadow: 0 14px 40px rgba(74, 222, 128, 0.2);
  }
}

@keyframes glow-down {
  0% {
    box-shadow: 0 0 0 rgba(248, 113, 113, 0.4);
  }
  100% {
    box-shadow: 0 14px 40px rgba(248, 113, 113, 0.24);
  }
}

@media (max-width: 640px) {
  .details-teams {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .score {
    order: -1;
  }
}
</style>
