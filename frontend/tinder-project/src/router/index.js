import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../auth.js'

import WelcomeView from '../views/WelcomeView.vue'
import SignInView from '../views/SignInView.vue'
import SignUpView from '../views/SignUpView.vue'
import HomeView from '../views/HomeView.vue'
import MatchesView from '../views/MatchesView.vue'
import EditProfileView from '../views/EditProfileView.vue'

const routes = [
    {
        path: '/',
        name: 'welcome',
        component: WelcomeView,
        meta: { publicOnly: true }
    },
    {
        path: '/signin',
        name: 'signin',
        component: SignInView,
        meta: { publicOnly: true }
    },
    {
        path: '/signup',
        name: 'signup',
        component: SignUpView,
        meta: { publicOnly: true }
    },
    {
        path: '/home',
        name: 'home',
        component: HomeView,
        meta: { requiresAuth: true }
    },
    {
        path: '/matches',
        name: 'matches',
        component: MatchesView,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile', 
        name: 'edit-profile',
        component: EditProfileView,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isLoggedIn.value) {
        return next({ name: 'signin' });
    }

    if (to.meta.publicOnly && isLoggedIn.value) {
        return next({ name: 'home' });
    }

    return next()
})

export default router