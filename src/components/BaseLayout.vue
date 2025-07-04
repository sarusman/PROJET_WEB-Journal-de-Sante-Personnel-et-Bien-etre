<template>
<div>
  <header class="header">
    <nav class="nav-bar">
      <div class="nav-left">
        <h1 class="app-title">Journal Santé</h1>
      </div>
      <div class="nav-center">
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/health-charts">Graphiques</RouterLink>
        <RouterLink to="/history">Historique</RouterLink>
        <RouterLink to="/about">À propos</RouterLink>
      </div>
      <div class="nav-right">
        <SignInButton v-if="!currentUser" />
        <button v-else @click="signOut">Déconnexion</button>
      </div>
    </nav>
  </header>
  
  <main>
    <slot />
  </main>
  
  <footer>
    <p>Copyright ©YAEM</p>
  </footer>
</div>
</template>

<script>
import { useStore } from 'vuex'
import { useCurrentUser } from '@/lib/useCurrentUser'
import SignInButton from '@/components/SignInButton.vue'

export default {
  name: 'BaseLayout',
  components: { SignInButton },
  setup() {
    const store = useStore()
    const signOut = () => {
      store.commit('setUser', null)
    }
    const currentUser = useCurrentUser()
    return { currentUser, signOut }
  }
}
</script>

<style scoped>
  @import '@/assets/CSS/BaseLayout.css';
</style>