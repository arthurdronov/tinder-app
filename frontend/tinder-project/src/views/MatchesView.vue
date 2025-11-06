<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../api.js'
import { userProfile } from '../auth.js'

const matches = ref([])

onMounted(async () => {
    try {
        const response = await apiFetch('https://tinder-app-smoky.vercel.app/matches');
        if (response.ok) {
            const data = await response.json();
            matches.value = data.matches;
        }
    } catch (error) {
        console.error("Erro ao buscar matches:", error);
    }
})

function getOtherProfile(match) {
    if (!userProfile.value) return null;
    
    return match.profiles.find(p => p && p._id !== userProfile.value._id);
}
</script>

<template>
    <h1>Meus Matches</h1>
    
    <div v-if="!userProfile || !matches || matches.length === 0">
        <p>Você ainda não tem nenhum match. Continue dando likes!</p>
    </div>

    <div v-else class="matches-grid">
        <div v-for="match in matches" :key="match._id" class="match-card">
            <template v-if="getOtherProfile(match)">
                <img :src="getOtherProfile(match).photos[0] || 'https://via.placeholder.com/150'" alt="Foto">
                <h3>{{ getOtherProfile(match).firstName || 'Usuário' }}</h3>
                <button>Abrir Chat</button>
            </template>

        </div>
    </div>
</template>

<style scoped>
.matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
}

.match-card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
}

.match-card img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
}
</style>
