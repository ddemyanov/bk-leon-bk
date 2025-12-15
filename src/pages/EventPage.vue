<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="glass-card">
    <div class="event-header">
      <div>
        <div class="event-title">Детали</div>
        <div class="event-subtitle text-muted">Команды</div>
      </div>
      <RouterLink class="button-ghost" to="/">Назад</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.event-title {
  font-size: 18px;
  font-weight: 700;
}

.event-subtitle {
  font-size: 14px;
}

.event-placeholder {
  margin-top: 16px;
  font-size: 14px;
}
</style>
