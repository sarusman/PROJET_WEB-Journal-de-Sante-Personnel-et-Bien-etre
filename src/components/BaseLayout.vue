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
.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-left .app-title {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.nav-center {
  display: flex;
  gap: 1rem;
}

.nav-center a {
  color: #2c3e50;
  text-decoration: none;
  padding: 0.5rem 1rem;
}

.nav-center a.router-link-active {
  color: #42b983;
  font-weight: bold;
}

.nav-right button {
  background: none;
  border: none;
  color: #2c3e50;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

footer {
  background-color: #000;
  color: #fff;
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
}
</style>