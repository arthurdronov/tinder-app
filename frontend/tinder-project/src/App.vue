<script setup>
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { isLoggedIn, useLogout, userProfile } from './auth';

const logout = useLogout()
const router = useRouter()
const route = useRoute()

function goBack() {
  if (route.path === '/signin') router.push('/')
  else if (route.path === '/signup') router.push('/signin')
  else router.back()
}

const showBackButton = computed(() => {
  const rootRoutes = [
    '/',
    '/home',
  ]

  return !rootRoutes.includes(route.path)
})
</script>

<template>
  <nav>
    <button v-if="showBackButton" @click="goBack" class="back-button">&larr;</button>

    <div v-if="isLoggedIn" class="nav-links">
      <RouterLink to="/home">Home (Swiping)</RouterLink>
      <RouterLink to="/matches">Meus Matches</RouterLink>
      <RouterLink to="/profile">Meu Perfil</RouterLink>
      <p v-if="userProfile && userProfile.user" style="display: inline-block; margin: 0 10px;">{{ userProfile.user.email }}</p>
      <button @click="logout" style="float: right;">Sign out</button>
    </div>
  </nav>

  <RouterView />
</template>

<style scoped>
nav {
  padding: 10px 15px;
  display: flex;
  align-items: center;
}

.back-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  padding: 0;
  margin-right: 10px;
  line-height: 1;
}

.back-button:hover {
  color: #000;
}

.nav-links {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  padding: 5px 0;
}

nav a.router-link-exact-active {
  color: #e63980;
}

.nav-email {
  display: none;
  margin: 0;
  color: #777;
}

.logout-btn {
  background: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px 10px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #eee;
}

@media (min-width: 768px) {
  .nav-links {
    gap: 15px;
  }

  .nav-email {
    display: inline-block;
  }
}
</style>