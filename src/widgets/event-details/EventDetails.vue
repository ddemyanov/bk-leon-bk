<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Event } from '@/entities/event/types'

const props = defineProps<{ event: Event | null; live: boolean }>()

const active = ref(false)
const direction = ref<'up' | 'down' | null>(null)
const last = ref<number | null>(null)

watch(
  () => props.event?.coeff,
  (next, prev) => {
    if (!props.event) return
    const prevValue = last.value ?? prev
    if (prevValue == null || next === prevValue) return
    direction.value = (next ?? 0) > prevValue ? 'up' : 'down'
    active.value = true
    last.value = next ?? prevValue
  },
)
</script>

<template>
  <section
    class="glass-card event-details"
    :class="active && direction ? `trend-${direction}` : ''"
    v-if="event"
  >
    <div class="details-header">
      <div class="badge" :class="live ? 'badge-on' : 'badge-off'">
        {{ live ? 'LIVE' : 'OFF' }}
      </div>
    </div>

    <div class="details-teams">
      <div class="team">{{ event.teamA }}</div>
      <div class="score">{{ event.score }}</div>
      <div class="team">{{ event.teamB }}</div>
    </div>

    <div class="details-events">
      <div class="events-block">
        <div class="label text-muted">Коэффициент</div>
        <div class="value">
          {{ event.coeff.toFixed(2) }}
          <span v-if="active && direction === 'up'" class="chip up">▲</span>
          <span v-else-if="active && direction === 'down'" class="chip down">▼</span>
        </div>
      </div>
      <div class="events-block">
        <div class="label text-muted">Обновлено</div>
        <div class="value small">
          {{ new Date(event.lastUpdatedAt).toLocaleTimeString() }}
        </div>
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

.details-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.team {
  font-size: 18px;
  font-weight: 600;
}

.score {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: 1px;
}

.details-events {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.events-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.04);
}

.label {
  font-size: 13px;
}

.value {
  font-size: 22px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.value.small {
  font-size: 13px;
  font-weight: 500;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--card-border);
}

.chip.up {
  background: rgba(74, 222, 128, 0.15);
  color: var(--success);
}

.chip.down {
  background: rgba(248, 113, 113, 0.18);
  color: var(--danger);
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
    font-size: 36px;
  }

  .events-block {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
