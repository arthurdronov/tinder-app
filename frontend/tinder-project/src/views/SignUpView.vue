<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiFetch } from '../api.js';
import { isLoggedIn, userProfile } from '../auth.js';
import Logo from '@/images/love2.png'

const router = useRouter();

const email = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
const dob = ref('');
const bio = ref('');
const gender = ref('');
const seeking = ref('');
const ageRangeMin = ref(18);
const ageRangeMax = ref(99);
const photoFiles = ref([]);
const alerta = ref('');

function handleFileChange(event) {
    photoFiles.value = Array.from(event.target.files);
}

async function registerUser() {
    try {
        const formData = new FormData();
        formData.append('email', email.value);
        formData.append('password', password.value);
        formData.append('firstName', firstName.value);
        formData.append('lastName', lastName.value);
        formData.append('dob', dob.value);
        formData.append('bio', bio.value);
        formData.append('gender', gender.value);
        formData.append('seeking', seeking.value);
        formData.append('ageRangeMin', ageRangeMin.value);
        formData.append('ageRangeMax', ageRangeMax.value);

        if (photoFiles.value.length === 0) {
            alerta.value = "Você deve enviar pelo menos uma foto.";
            return;
        }
        for (const file of photoFiles.value) {
            formData.append('photos', file);
        }

        const response = await apiFetch('https://tinder-app-smoky.vercel.app/register', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            isLoggedIn.value = true;
            userProfile.value = data.profile;
            router.push('/home');
        } else {
            alerta.value = data.Message;
        }
    } catch (error) {
        alerta.value = error.message;
    }
}
</script>

<template>
    <div class="container">
        <h1>Criar Conta</h1>
        <img class="logo" :src="Logo" alt="logo-escrito-love">
        <p>Preencha seus dados de login e perfil.</p>

        <form @submit.prevent="registerUser">
            <div class="form-group">
                <label for="email">Email:</label>
                <input id="email" v-model="email" placeholder="email" type="email" required>
            </div>

            <div class="form-group">
                <label for="password">Senha:</label>
                <input id="password" v-model="password" placeholder="password" type="password" required>
            </div>

            <hr>

            <div class="form-group">
                <label for="firstName">Primeiro Nome:</label>
                <input id="firstName" v-model="firstName" placeholder="Seu primeiro nome" type="text" required>
            </div>

            <div class="form-group">
                <label for="lastName">Último Nome:</label>
                <input id="lastName" v-model="lastName" placeholder="Seu último nome" type="text" required>
            </div>

            <div class="form-group">
                <label for="dob">Data de Nascimento:</label>
                <input id="dob" v-model="dob" type="date" required>
            </div>

            <div class="form-group">
                <label for="bio">Sua Bio:</label>
                <textarea id="bio" v-model="bio" placeholder="Sua bio..."></textarea>
            </div>

            <div class="form-group">
                <label for="gender">Seu Gênero:</label>
                <select id="gender" v-model="gender" required>
                    <option disabled value="">Seu gênero</option>
                    <option value="homem">Homem</option>
                    <option value="mulher">Mulher</option>
                    <option value="outro">Outro</option>
                </select>
            </div>

            <div class="form-group">
                <label for="seeking">Você busca por:</label>
                <select id="seeking" v-model="seeking" required>
                    <option disabled value="">Você busca por</option>
                    <option value="homem">Homens</option>
                    <option value="mulher">Mulheres</option>
                    <option value="todos">Todos</option>
                </select>
            </div>

            <div class="form-group">
                <label>Preferência de Idade:</label>
                <div class="age-range-inputs">
                    <span>De:</span>
                    <input v-model.number="ageRangeMin" type="number" min="18" max="120">
                    <span>Até:</span>
                    <input v-model.number="ageRangeMax" type="number" min="18" max="120">

                </div>
            </div>

            <div class="form-group">
                <label for="photos">Fotos (Pelo menos 1 obrigatória, máx 6)</label>
                <input id="photos" type="file" @change="handleFileChange" multiple required
                    accept="image/png, image/jpeg, image/jpg">
            </div>

            <div v-if="photoFiles.length > 0" class="previews">
                <p>Fotos selecionadas:</p>
                <ul>
                    <li v-for="file in photoFiles" :key="file.name">{{ file.name }}</li>
                </ul>
            </div>

            <button>Finalizar Cadastro</button>
            <p class="alerta">{{ alerta }}</p>
        </form>
        
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    padding-bottom: 5rem;
    box-sizing: border-box;
}

.logo {
    width: 200px;
    margin-bottom: 2rem;
}

form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

label {
    font-weight: bold;
    color: #333;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
textarea,
select {
    width: 100%;
    padding: 10px 15px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-sizing: border-box;
}

textarea {
    min-height: 80px;
    font-family: inherit;
}

.age-range-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
}

.age-range-inputs input[type="number"] {
    width: 70px;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    text-align: center;
}

input[type="file"] {
    font-size: 0.9rem;
    padding: 5px 0;
}

button {
    width: 100%;
    padding: 12px;
    font-size: 1.1rem;
    font-weight: bold;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 15px;
}

button:hover {
    background-color: #0056b3;
}

hr {
    margin: 15px 0;
    border: 0;
    border-top: 1px solid #eee;
}

.alerta {
    color: red;
    text-align: center;
    font-weight: bold;
    margin-top: 10px;
}

.previews p {
    font-weight: bold;
    margin-bottom: 5px;
    margin-top: 5px;
}

.previews ul {
    list-style-type: none;
    padding-left: 0;
    font-size: 0.9rem;
    color: #555;
    margin: 0;
}

.previews li {
    padding: 1px 0;
}
</style>
