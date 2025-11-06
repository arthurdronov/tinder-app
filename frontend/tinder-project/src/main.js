import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { apiFetch } from './api.js'
import { isLoggedIn, userProfile } from './auth.js'

async function initializeApp() {
    try {
        const response = await apiFetch('http://localhost:3000/me');
        
        if (response.ok) {
            isLoggedIn.value = true;
            userProfile.value = await response.json();
        } else {
            isLoggedIn.value = false;
            userProfile.value = null;
        }
    } catch (error) {
        isLoggedIn.value = false;
        userProfile.value = null;
    }

    const app = createApp(App)
    app.use(router)
    app.mount('#app')
}

initializeApp()