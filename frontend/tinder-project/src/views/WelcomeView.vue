<script setup>
import { RouterLink } from 'vue-router';
import Logo from '@/images/love2.png'
</script>

<template>
  <div class="container">
    <div class="logo">
      <h1 style="text-align: center; margin-bottom: 0px;">LOVE</h1>
      <img style="width: 20rem;" :src="Logo" alt="">
      <h3 style="text-align: center;  margin-top: 0px;">Logo, outro você encontra.</h3>
    </div>

    <RouterLink class="getStarted" to="signin">Get Started</RouterLink>
  </div>

</template>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 90vh;
  }

  .logo {
    margin: auto 0;
  }

  h3 {
    margin-bottom: 4rem;
  }

  .getStarted {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
</style>