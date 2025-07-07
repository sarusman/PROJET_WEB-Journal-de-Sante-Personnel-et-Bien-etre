import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../src/pages/HomePage.vue'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/health-charts',
    name: 'HealthCharts',
    component: () => import('../src/pages/HealthChart.vue'), // Changé de HealthCharts.vue à HealthChart.vue
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../src/pages/HistoryPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {

  const isLoggedIn = !!store.state.user
  console.log('islLOggedIn?', isLoggedIn)
  console.log('currentUser?', store.state.user)

  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('redirected to home')
    next('/')

  } else {
    console.log('redirected to /conversations')
    next()
    
  }
  
})

export default router
