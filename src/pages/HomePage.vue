<script setup lang="ts"></script>

<template>
  <section class="glass-card">
    <header class="home-header">
      <div>
        <div class="home-title">События</div>
        <div class="home-subtitle text-muted">Список матчей</div>
      </div>
      <button class="button-ghost">Обновить</button>
    </header>
  </section>
</template>

<style scoped>
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.home-title {
  font-size: 18px;
  font-weight: 700;
}

.home-subtitle {
  font-size: 14px;
}

.home-placeholder {
  margin-top: 16px;
  font-size: 14px;
}
</style>
