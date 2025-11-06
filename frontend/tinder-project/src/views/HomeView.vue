<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiFetch } from '../api.js'

const candidates = ref([])
const currentIndex = ref(0)
const showMatchAnimation = ref(false)
const isDetailModalOpen = ref(false)

const currentProfile = computed(() => {
    if (candidates.value.length > 0 && currentIndex.value < candidates.value.length) {
        return candidates.value[currentIndex.value]
    }
    return null
})

onMounted(async () => {
    try {
        const response = await apiFetch('http://localhost:3000/candidates');
        if (response.ok) {
            candidates.value = await response.json();
        }
    } catch (error) {
        console.error("Erro ao buscar candidatos:", error);
    }
})

function openProfileModal() {
    isDetailModalOpen.value = true
}
function closeProfileModal() {
    isDetailModalOpen.value = false
}

function nextCard() {
    showMatchAnimation.value = false
    currentIndex.value++
}

function dislike() {
    console.log("Dislike");
    nextCard();
}

async function like() {
    if (!currentProfile.value) return;

    try {
        const targetProfileId = currentProfile.value._id;

        const response = await apiFetch('http://localhost:3000/like', {
            method: 'POST',
            body: JSON.stringify({ targetProfileId })
        });

        const data = await response.json();

        if (data.status === 'match') {
            showMatchAnimation.value = true;
            setTimeout(() => {
                showMatchAnimation.value = false;
                nextCard();
            }, 2000);
        } else {
            nextCard();
        }
    } catch (error) {
        console.error("Erro ao dar like:", error);
    }
}
</script>

<template>
    <div class="home-container">
        <div v-if="showMatchAnimation" class="match-overlay">
            <div class="match-heart">❤️</div>
                <h2>It's a Match!</h2>
        </div>

        <h1>Home - Encontre seu par</h1>

        <div v-if="currentProfile" class="profile-card clickable" @click="openProfileModal">
            <img :src="currentProfile.photos[0] || 'https://via.placeholder.com/300'" alt="Foto do perfil">
            <h2>{{ currentProfile.firstName || 'Usuário' }}, {{ currentProfile.age }}</h2>
            <p>{{ currentProfile.bio || 'Sem bio.' }}</p>
            <small>(Clique para ver mais)</small>
        </div>

        <div v-else>
            <h2>Não há mais perfis disponíveis. Tente novamente mais tarde.</h2>
        </div>

        <div v-if="currentProfile" class="actions">
            <button @click.stop="dislike" class="dislike-btn" :disabled="showMatchAnimation">Dislike (X)</button>
            <button @click.stop="like" class="like-btn" :disabled="showMatchAnimation">Like (❤️)</button>
        </div>

        <div v-if="isDetailModalOpen && currentProfile" class="modal-overlay">
            <div class="modal-content-wrapper" @click.self="closeProfileModal">
                <div class="modal-content">
                    <button @click="closeProfileModal" class="close-btn">&times;</button>
                    <h2>{{ currentProfile.firstName }} {{ currentProfile.lastName }}, {{ currentProfile.age }}</h2>
                    <p class="modal-gender"><strong>Gênero:</strong> {{ currentProfile.gender }}</p>
                    <p class="modal-bio">{{ currentProfile.bio || 'Este usuário ainda não escreveu uma bio.' }}</p>

                    <hr>

                    <div class="photo-gallery">
                        <img v-for="(photo, index) in currentProfile.photos" :key="index" :src="photo" alt="Foto do perfil">
                        <img v-if="!currentProfile.photos.length" :src="'https://via.placeholder.com/300'" alt="Foto do perfil">
                    </div>

                    <div class="actions modal-actions">
                        <button @click="dislike(); closeProfileModal();" class="dislike-btn">Dislike (X)</button>
                        <button @click="like(); closeProfileModal();" class="like-btn">Like (❤️)</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home-container {
    position: relative;
}

.profile-card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    max-width: 350px;
    margin: 20px auto;
    text-align: center;
}

.profile-card.clickable {
    cursor: pointer;
}

.profile-card.clickable:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-card img {
    max-width: 100%;
    border-radius: 8px;
}

.actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.like-btn,
.dislike-btn {
    font-size: 1.5rem;
    padding: 10px 20px;
}

.like-btn:disabled,
.dislike-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.actions button {
    z-index: 10;
    position: relative;
}

.match-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1001;
    color: white;
}

.match-heart {
    font-size: 10rem;
    animation: pulse 1s ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }

    50% {
        transform: scale(1.2);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 2rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
}

.close-btn:hover {
    color: #333;
}

.modal-gender {
    font-style: italic;
    color: #333;
    margin-top: -15px;
    margin-bottom: 15px;
}

.modal-bio {
    font-size: 1.1rem;
    color: #555;
    margin-bottom: 20px;
}

.photo-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
}

.photo-gallery img {
    width: 100%;
    border-radius: 8px;
}

.modal-actions {
    margin-top: 10px;
}
</style>