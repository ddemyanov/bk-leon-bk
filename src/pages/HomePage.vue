<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEventsStore } from '@/entities/event/store'
import EventsList from '@/widgets/events-list/EventsList.vue'

const eventsStore = useEventsStore()

const ids = computed(() => eventsStore.ids)
const eventsMap = computed(() => eventsStore.events)
const loading = computed(() => eventsStore.loading)
const error = computed(() => eventsStore.error)
const live = computed(() => eventsStore.liveConnected)

const refresh = () => eventsStore.loadEvents()

onMounted(async () => {
  if (!eventsStore.ids.length) {
    await eventsStore.loadEvents()
  }
  if (!eventsStore.liveConnected) {
    eventsStore.enableLiveUpdates()
  }
})
</script>

<template>
  <EventsList
    :ids="ids"
    :events="eventsMap"
    :loading="loading"
    :error="error"
    :live="live"
    :on-refresh="refresh"
  />
</template>
