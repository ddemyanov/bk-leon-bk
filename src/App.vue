<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__title">Leon</div>
      <div class="app-header__meta">
        <span class="pill">Live betting dashboard</span>
        <span class="pill">Real-time mock feed</span>
      </div>
    </header>

    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>
