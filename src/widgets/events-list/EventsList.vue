<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { EventEntity } from '@/entities/event/types'
import EventCard from '@/widgets/event-card/EventCard.vue'

const props = defineProps<{
  events: EventEntity[]
  loading: boolean
  error: string | null
  live: boolean
  onRefresh: () => void
}>()
</script>

<template>
  <section class="glass-card events">
    <header class="events-header">
      <div>
        <div class="events-title">События</div>
        <div class="events-subtitle text-muted">
          {{ loading ? 'Загрузка...' : 'Live-события  каждые 1–3 секунды' }}
        </div>
      </div>
      <div class="events-actions">
        <span class="dot" :class="live ? 'dot-on' : 'dot-off'">
          {{ live ? 'Live' : 'Офлайн' }}
        </span>
        <button class="button-ghost" type="button" :disabled="loading" @click="props.onRefresh">
          {{ loading ? 'Загрузка...' : 'Обновить' }}
        </button>
      </div>
    </header>

    <div v-if="error" class="events-error">{{ error }}</div>
    <div v-else-if="!events.length && !loading" class="events-empty text-muted">Нет событий</div>

    <div class="grid-responsive" v-if="events.length">
      <RouterLink
        v-for="event in events"
        :key="event.id"
        class="events-item"
        :to="`/event/${event.id}`"
      >
        <EventCard :event="event" :live="live" />
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.events {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.events-title {
  font-size: 18px;
  font-weight: 700;
}

.events-subtitle {
  font-size: 14px;
}

.events-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.events-error {
  color: var(--danger);
  font-size: 14px;
}

.events-empty {
  font-size: 14px;
}

.events-item {
  display: block;
  color: inherit;
}

.dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.05);
}

.grid-responsive {
  margin-top: 4px;
}

.dot::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-on::before {
  background: var(--success);
  box-shadow: 0 0 0 6px rgba(74, 222, 128, 0.25);
}

.dot-off::before {
  background: var(--danger);
}

.button-ghost:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
