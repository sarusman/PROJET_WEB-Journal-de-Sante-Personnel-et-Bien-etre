import { createStore } from 'vuex'

const savedUser = JSON.parse(localStorage.getItem('currentUser'))

export default createStore({
  state() {
    return {
      user: savedUser || null
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
  },
  getters: {
    user: (state) => state.user
  }
})