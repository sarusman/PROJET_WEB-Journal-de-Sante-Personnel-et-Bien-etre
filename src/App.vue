<template>
  <BaseLayout>
    <router-view />
    <!-- <HomePage />
    <ConversationsIndexPage /> -->
  </BaseLayout>
</template>

<script>
import BaseLayout from './components/BaseLayout.vue'
// import HomePage from './pages/HomePage.vue'
// import ConversationsIndexPage from'./pages/ConversationsIndexPage.vue'
export default {
  name: 'App',
  components: {
      BaseLayout
    // HomePage,
    // ConversationsIndexPage,
  }
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
