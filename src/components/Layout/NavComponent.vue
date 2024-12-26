<script setup>
import { ref } from 'vue';
const navAppended = ref(false);
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
            class="bg-slate-500/50 backdrop-blur-sm fixed top-5 left-24 w-4/5 h-12 z-50 text-zinc-100 border-4 border-dotted border-zinc-100 rounded-2xl flex justify-center items-center p-4 transition-opacity duration-300 ease-out md:w-1/4"
            :class="{ 'opacity-100': navAppended, 'opacity-0': !navAppended }"
        >
            <ul class="flex list-none gap-20 text-zinc-100 [&>li]:no-underline font-bold text-xl">
                <li class="hover:text-zinc-300 text-shadow-lg"><a href="#about">關於我</a></li>
                <li class="hover:text-zinc-300 text-shadow-lg"><a href="#projects">作品集</a></li>
                <li class="hover:text-zinc-300 text-shadow-lg"><a href="#contact">聯絡資訊</a></li>
            </ul>
        </nav>
    </section>
</template>

<style lang="css" scoped></style>
