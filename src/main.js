import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from '../router'

import { PublicClientApplication } from '@azure/msal-browser'

const msalConfig = {
  auth: {
    clientId: process.env.VUE_APP_OAUTH_CLIENT_ID,  // mis dans .env
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin
  }
}

const msalInstance = new PublicClientApplication(msalConfig)

async function startApp() {
  await msalInstance.initialize()
  const app = createApp(App)
  app.use(store)
  app.use(router)
  app.config.globalProperties.$msal = msalInstance
  app.mount('#app')
}

startApp()
