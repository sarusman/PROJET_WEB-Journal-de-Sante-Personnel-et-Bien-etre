<template>
  <button @click="signIn" class="signin-button">
    <img
      src="https://img.icons8.com/color/48/000000/microsoft.png"
      alt="Microsoft logo"
      width="20"
      style="margin-right: 5px;"
    />
    Sign in with Microsoft
  </button>
</template>

<script>
import { useStore } from "vuex";
import { getCurrentInstance } from "vue";

export default {
  name: "SignInButton",
  setup() {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const signIn = async () => {
      console.log("SignInButton cliqué!");
      try {
        const result = await proxy.$msal.loginPopup({
          scopes: ["User.Read"],
        });
        const account = result.account;
        store.commit("setUser", {
          name: account.name,
          username: account.username
        });
        console.log("Login success", account);
      } catch (error) {
        console.error("Microsoft login failed", error);
      }
    };

    return { signIn };
  },
};
</script>

<style scoped>
  @import '@/assets/CSS/SignInButton.css';
</style>
