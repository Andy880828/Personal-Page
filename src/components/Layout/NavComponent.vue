<script setup>
import { useRoute } from 'vue-router';
import { ref } from 'vue';
const navAppended = ref(true);
const route = useRoute();
const isActive = (path) => {
    return route.path === path;
};
// 定義 emit
const emit = defineEmits(['onToggle']);
const onToggle = () => {
    emit('onToggle', true);
};
</script>
<template>
    <section>
        <label
            class="block fixed top-6 left-6 z-50 cursor-pointer size-10 [&>span]:absolute [&>span]:w-12 [&>span]:h-1.5 [&>span]:bg-zinc-100 [&>span]:rounded-full"
            for="check"
        >
            <input type="checkbox" id="check" v-model="navAppended" class="peer hidden invisible" />
            <span class="top-0 peer-checked:rotate-45 peer-checked:top-4 transition-all"></span>
            <span class="top-4 opacity-100 peer-checked:opacity-0 transition-all"></span>
            <span class="top-8 peer-checked:-rotate-45 peer-checked:top-4 transition-all"></span>
        </label>
        <nav
            v-show="navAppended"
            class="bg-slate-500/50 backdrop-blur-sm fixed top-5 left-[72px] md:left-24 w-4/5 md:w-1/2 xl:w-2/5 h-12 z-50 text-zinc-100 border-4 border-dotted border-zinc-100 rounded-2xl flex justify-center items-center p-4 transition-opacity duration-300 ease-out"
            :class="{ 'opacity-100': navAppended, 'opacity-0': !navAppended }"
        >
            <ul class="flex list-none gap-10 md:gap-20 text-zinc-200 [&>li]:no-underline font-bold text-xl">
                <li class="hover:text-zinc-400 text-shadow-lg" :class="{ 'text-white': isActive('/about') }">
                    <RouterLink to="about">關於我</RouterLink>
                </li>
                <li class="hover:text-zinc-400 text-shadow-lg" :class="{ 'text-white': isActive('/project') }">
                    <RouterLink to="project">作品集</RouterLink>
                </li>
                <li class="hover:text-zinc-400">
                    <button class="text-shadow-lg" @click="onToggle">聯絡資訊</button>
                </li>
            </ul>
        </nav>
    </section>
</template>

<style lang="css" scoped></style>
