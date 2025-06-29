<template>
<div>
	<header>
		<nav>
			<RouterLink to="/">Home</RouterLink><a>|</a>
			<RouterLink to="/conversations">Conversations</RouterLink><a>|</a>
			<button v-if="currentUser" @click="signOut">Sign out</button><a>|</a>
			<RouterLink to="/about">About</RouterLink>
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
import { useCurrentUser } from  '@/lib/useCurrentUser'//'C:\\Users\\Muken\\Documents\\EfreiS2\\GIT\\Web_dev\\TP4_dev_web\\TP3_vue-oauth-microsoft-graph\\src\\pages\\HomePage.vue'
export default {
	name: 'BaseLayout',
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
div {
	flex-direction: column;
}
header {
	text-align: center;
	padding: 1rem 0;
}
a, button {
	color: black;
	margin: 0 5px;
}
.router-link-active {
	color: green;
}
button {
	background: none;
	border: none;
	font: inherit;
	cursor: pointer;
}
footer {
	background-color: #000;
	color: #fff;
	text-align: center;
}
</style>