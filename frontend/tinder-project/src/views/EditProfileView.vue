<script setup>
import { ref, onMounted } from 'vue';
import { apiFetch } from '../api.js';
import { userProfile } from '../auth.js';

const firstName = ref('');
const lastName = ref('');
const dob = ref('');
const bio = ref('');
const gender = ref('');
const seeking = ref('');
const ageRangeMin = ref(18);
const ageRangeMax = ref(99);
const newPhotoFiles = ref([]);
const alerta = ref('');
const sucesso = ref('');

onMounted(() => {
    if (userProfile.value) {
        firstName.value = userProfile.value.firstName;
        lastName.value = userProfile.value.lastName;
        if (userProfile.value.dob) {
            dob.value = new Date(userProfile.value.dob).toISOString().split('T')[0];
        }
        bio.value = userProfile.value.bio || '';
        gender.value = userProfile.value.gender;
        seeking.value = userProfile.value.seeking;
        if (userProfile.value.ageRange) {
            ageRangeMin.value = userProfile.value.ageRange.min;
            ageRangeMax.value = userProfile.value.ageRange.max;
        }
    }
});

function handleFileChange(event) {
    newPhotoFiles.value = Array.from(event.target.files);
}

async function saveProfile() {
    try {
        alerta.value = "";
        sucesso.value = "";
        const formData = new FormData();
        formData.append('firstName', firstName.value);
        formData.append('lastName', lastName.value);
        formData.append('dob', dob.value);
        formData.append('bio', bio.value);
        formData.append('gender', gender.value);
        formData.append('seeking', seeking.value);
        formData.append('ageRangeMin', ageRangeMin.value);
        formData.append('ageRangeMax', ageRangeMax.value);
        for (const file of newPhotoFiles.value) {
            formData.append('photos', file);
        }

        const response = await apiFetch('https://tinder-app-smoky.vercel.app/profile', {
            method: 'PUT',
            body: formData
        });
        const data = await response.json();

        if (response.ok) {
            userProfile.value = data;
            sucesso.value = "Perfil atualizado com sucesso!";
            newPhotoFiles.value = [];
        } else {
            alerta.value = data.Error || data.Message;
        }
    } catch (error) {
        alerta.value = error.message;
    }
}

async function setMainPhoto(photoUrl) {
    try {
        alerta.value = "";
        sucesso.value = "";

        const response = await apiFetch('https://tinder-app-smoky.vercel.app/profile/photos/set-main', {
            method: 'PUT',
            body: JSON.stringify({ photoUrl })
        });

        const updatedProfile = await response.json();

        if (response.ok) {
            userProfile.value = updatedProfile;
            sucesso.value = "Foto principal atualizada!";
        } else {
            alerta.value = updatedProfile.Error || "Não foi possível definir a foto principal.";
        }
    } catch (error) {
        alerta.value = error.message;
    }
}
</script>

<template>
    <h1>Editar Perfil</h1>

    <div class="photo-management" v-if="userProfile && userProfile.photos.length > 0">
        <h2>Minhas Fotos</h2>
        <p>A primeira foto é a sua foto principal.</p>
        <div class="photo-grid">

            <div v-for="(photo, index) in userProfile.photos" :key="photo" class="photo-item">
                <img :src="photo" alt="Foto do perfil">

                <button type="button" @click="setMainPhoto(photo)" :disabled="index === 0">
                    {{ index === 0 ? 'Principal' : 'Definir como Principal' }}
                </button>

            </div>
        </div>
    </div>

    <form @submit.prevent="saveProfile" v-if="userProfile">
        <hr>
        <h2>Editar Detalhes</h2>

        <label>Primeiro Nome</label>
        <input v-model="firstName" type="text" required>

        <label>Último Nome</label>
        <input v-model="lastName" type="text" required>

        <label>Data de Nascimento</label>
        <input v-model="dob" type="date" required>

        <label>Sua Bio</label>
        <textarea v-model="bio"></textarea>

        <label>Seu Gênero</label>
        <select v-model="gender" required>
            <option disabled value="">Seu gênero</option>
            <option value="homem">Homem</option>
            <option value="mulher">Mulher</option>
            <option value="outro">Outro</option>
        </select>

        <label>Busca por</label>
        <select v-model="seeking" required>
            <option disabled value="">Você busca por</option>
            <option value="homem">Homens</option>
            <option value="mulher">Mulheres</option>
            <option value="todos">Todos</option>
        </select>

        <label>Preferência de Idade:</label>
        <div class="age-range-inputs">
            De: <input v-model.number="ageRangeMin" type="number" min="18" max="120" style="width: 60px;">
            Até: <input v-model.number="ageRangeMax" type="number" min="18" max="120" style="width: 60px;">
        </div>

        <label>Adicionar Novas Fotos (Máx 6)</label>
        <input type="file" @change="handleFileChange" multiple accept="image/png, image/jpeg, image/jpg">

        <button>Salvar Alterações</button>
    </form>

    <p v-if="alerta" style="color: red;">{{ alerta }}</p>
    <p v-if="sucesso" style="color: green;">{{ sucesso }}</p>
</template>

<style scoped>
form {
    display: flex;
    flex-direction: column;
    max-width: 400px;
    gap: 10px;
    margin: 20px;
}

label {
    font-weight: bold;
    margin-top: 10px;
}

.age-range-inputs {
    display: flex;
    align-items: center;
    gap: 10px;
}

.photo-management {
    margin: 20px;
    max-width: 600px;
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 10px;
}

.photo-item {
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

.photo-item img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    display: block;
}

.photo-item button {
    width: 100%;
    margin-top: 0;
    font-size: 0.8rem;
    padding: 8px 5px;
    border: none;
    border-top: 1px solid #ddd;
    cursor: pointer;
}

.photo-item button:disabled {
    background-color: #007bff;
    color: white;
    opacity: 1;
    cursor: default;
}
</style>
