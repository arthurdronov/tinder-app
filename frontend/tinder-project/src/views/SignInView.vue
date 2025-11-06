<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { ref } from 'vue'
import { isLoggedIn, userProfile } from '../auth.js'
import { apiFetch } from '../api.js'

import Logo from '@/images/love2.png'

const postEmail = ref('')
const postPassword = ref('')
const loginAlert = ref('')
const router = useRouter()

async function authUserLogin() {
  try {
    var response = await apiFetch('https://tinder-app-smoky.vercel.app/login', {
      method: "POST",
      body: JSON.stringify({
        email: postEmail.value,
        password: postPassword.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      isLoggedIn.value = true
      userProfile.value = data
      router.push('/home')
      
    } else {
      loginAlert.value = data.Error
    }
  } catch (error) {
    console.log('Error:', error)
  }
}
</script>

<template>
  <div class="container">
    <h1>Login</h1>

    <img class="logo" :src="Logo" alt="logo-escrito-love">

    <form @submit.prevent="authUserLogin">
      <div class="form-container">
        <input type="text" v-model="postEmail" name="email" placeholder="Email" required>
        <input type="password" v-model="postPassword" name="password" placeholder="Password" required>
        <router-link to="signup" class="signup">Sign up</router-link>
        <button>Continue</button>
        <p class="alerta">{{ loginAlert }}</p>
      </div>
    </form>

  </div>

</template>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 90vh;
    box-sizing: border-box;

  }

  form {
    margin-top: auto;
    width: 100%;
  }

  .container .form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 20rem;
    margin: 0 auto;
  }

  .container .form-container input {
    width: 90%;
    height: 3rem;
    border-radius: 20px;
    padding-left: 10%;
    border: 1px solid gray;
  }

  .container .form-container button {
    border-radius: 24px;
    border: none;
    width: 50%;
    height: 3rem;
  }

  .container .form-container .signup {
    text-align: center;
  }

  .container .logo {
    width: 300px;
    margin: 2rem;
  }
</style>
