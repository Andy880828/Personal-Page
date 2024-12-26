import { createRouter, createWebHistory } from 'vue-router';
import MainView from '../views/MainView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'about',
            component: MainView,
        },
        {
            path: '/',
            name: 'projects',
            component: MainView,
        },
        {
            path: '/',
            name: 'contact',
            component: MainView,
        },
    ],
});

export default router;
