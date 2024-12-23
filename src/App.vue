<script setup>
import { RouterView } from 'vue-router';
import Loader from './components/Layout/LoaderComponent.vue';
</script>

<template>
    <Loader />
    <div class="wrapper">
        <RouterView />
    </div>
</template>

<style scoped></style>
