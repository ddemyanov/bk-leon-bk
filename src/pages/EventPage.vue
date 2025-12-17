<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useEventsStore } from '@/entities/event/store'
import EventDetails from '@/widgets/event-details/EventDetails.vue'

const eventsStore = useEventsStore()
const route = useRoute()

const eventId = computed(() => Number(route.params.id))
const event = computed(() => eventsStore.byId(eventId.value))
const live = computed(() => eventsStore.liveConnected)

onMounted(async () => {
  if (!eventsStore.ids.length) {
    await eventsStore.loadEvents()
  }
  eventsStore.connectOdds(eventId.value)
})

watch(
  () => eventId.value,
  (id) => {
    eventsStore.connectOdds(id)
  },
)
</script>

<template>
  <section class="page-gap">
    <header class="page-header">
      <div>
        <div class="page-title">Детали</div>
      </div>
      <RouterLink class="button-ghost" to="/">Назад</RouterLink>
    </header>

    <EventDetails :event="event" :live="live" />
  </section>
</template>

<style scoped>
.page-gap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 14px;
}
</style>
