<script setup lang="ts">
import { RouterLink } from 'vue-router'
import './eventPage.css'
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
