<template>
  <div class="page-container">
    <header class="header">
      <nav class="nav-bar">
        <BaseButton><a href="#" class="nav-link">Home</a></BaseButton>
        <SignInButton />
      </nav>
    </header>
    <div v-if="currentUser" class="user-info">
      <p><strong>Bienvenue {{ currentUser.name }}</strong></p>
      <p>Email : {{ currentUser.username }}</p>
    </div>

    <div class="button-group">
      <AsyncButton color="primary">
        Disabled and animated for 1 second if clicked
      </AsyncButton>
      <AsyncButton color="danger">
        Danger
      </AsyncButton>
      <AsyncButton color="primary">
        Disabled and animated for 1 second if clicked
      </AsyncButton>
    </div>

    <div class="image-wrapper">
      <img :src="require('@/assets/image.png')" />
    </div>

    <div v-if="currentUser" class="user-info">
      Connecté en tant que: {{ currentUser.name }} ({{ currentUser.username }})
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import BaseButton from '../components/BaseButton.vue'
import SignInButton from '../components/SignInButton.vue'
import AsyncButton from '../components/AsyncButton.vue'

export default {
  name: 'HomePage',
  components: { BaseButton, SignInButton, AsyncButton },
  setup() {
    const store = useStore()
    const currentUser = computed(() => store.state.user)
    return { currentUser }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #107c10;
  color: white;
  padding: 10px;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  background-color: #f0f0f0;
  text-align: center;
  padding: 1rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  width: 400px;
  margin: 1rem auto 0;
}

.button-group > * {
  margin: 0;
}

.image-wrapper {
  text-align: center;
  margin-top: 0;
}

.image-wrapper img {
  width: 400px;
  height: auto;
}
</style>
