import { createRouter, createWebHistory } from 'vue-router';
import MainView from '../views/MainView.vue';
import AboutView from '@/views/AboutView.vue';
import ProjectView from '@/views/ProjectView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: MainView,
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView,
        },
        {
            path: '/project',
            name: 'project',
            component: ProjectView,
        },
        {
            path: '/:pathMatch(.*)*', // 這個匹配所有路徑
            redirect: '/',
        },
    ],
});

export default router;
