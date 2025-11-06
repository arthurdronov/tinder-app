import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from './api.js'

export const isLoggedIn = ref(false)
export const userProfile = ref(null)

export function useLogout() {
    const router = useRouter()
    
    async function logout() {
        try {
            await apiFetch('http://localhost:3000/logout', { 
                method: 'POST' 
            });
            
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            isLoggedIn.value = false
            userProfile.value = null
            router.push('/signin')
        }
    }
    
    return logout
}