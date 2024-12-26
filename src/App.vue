<script setup>
import { RouterView } from 'vue-router';
import Loader from './components/Layout/LoaderComponent.vue';
import FooterComponent from '@/components/Layout/FooterComponent.vue';
import NavComponent from './components/Layout/NavComponent.vue';
import LogoComponent from './components/Layout/LogoComponent.vue';
</script>

<template>
    <Loader />
    <div class="wrapper">
        <LogoComponent></LogoComponent>
        <NavComponent></NavComponent>
        <RouterView />
        <!-- footer -->
        <section class="relative bg-gradient-to-b from-[#011b2c] to-[#000000] h-48 md:h-72">
            <img
                class="absolute bottom-0 w-full brightness-0 hidden md:inline-block z-0"
                src="/src/assets/image/footer.png"
                alt=""
            />
            <div class="absolute bottom-7 left-1/2 transform -translate-x-1/2">
                <FooterComponent></FooterComponent>
            </div>
        </section>
    </div>
</template>

<style scoped></style>
