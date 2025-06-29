import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../src/pages/HomePage.vue'
import ConversationShowPage from '../src/pages/ConversationShowPage.vue'
import ConversationsIndexPage from '../src/pages/ConversationsIndexPage.vue'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/conversations',
    name: 'Conversations',
    component: ConversationsIndexPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/conversations/:id',
    name: 'ConversationShow',
    component: ConversationShowPage,
    meta: { requiresAuth: true },
    props: true
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
