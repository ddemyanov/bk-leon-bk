import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/home/HomePage.vue'),
    },
    {
      path: '/event/:id',
      name: 'event',
      component: () => import('@/pages/event/EventPage.vue'),
      props: true,
    },
  ],
})

export default router
