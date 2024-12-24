<script setup>
import { ref } from 'vue';
import FooterComponent from '@/components/Layout/FooterComponent.vue';
import scrollDownComponent from '@/components/scrollDownComponent.vue';
import waterButtonComponent from '@/components/waterButtonComponent.vue';
const navAppended = ref(false);
</script>

<template>
    <section class="navbar">
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
            class="bg-slate-500/50 fixed top-5 left-24 w-4/5 h-12 z-50 text-zinc-100 border-4 border-dotted border-zinc-100 rounded-2xl flex justify-center items-center p-4 transition-opacity duration-300 ease-out md:w-1/4"
            :class="{ 'opacity-100': navAppended, 'opacity-0': !navAppended }"
        >
            <ul class="flex list-none gap-20 text-zinc-100 [&>li]:no-underline font-bold text-xl">
                <li class="hover:text-zinc-300 text-shadow-lg"><a href="#about">關於我</a></li>
                <li class="hover:text-zinc-300 text-shadow-lg"><a href="#projects">作品集</a></li>
                <li class="hover:text-zinc-300 text-shadow-lg"><a href="#contact">聯絡資訊</a></li>
            </ul>
        </nav>
    </section>
    <!-- Hero -->
    <section
        class="relative h-screen w-screen text-center overflow-hidden bg-right md:bg-center bg-no-repeat bg-cover flex flex-col items-center justify-center after:content-[''] after:w-full after:h-[10%] after:absolute after:z-[1] after:bottom-0 after:left-0 after:gradient-t-white"
        style="background-image: url('./src/assets/image/hero-bg.png')"
    >
        <p class="h-14 text-[56px] text-zinc-100 text-shadow-lg">Ching-Hsun Lin</p>
        <p class="h-[180px] text-[152px] text-zinc-100 text-shadow-lg">林敬勛</p>
        <p class="text-[56px] text-zinc-100 mt-0 mb-16 text-shadow-lg">Web Developer / Oceanographer</p>
        <div class="absolute bottom-40">
            <scrollDownComponent></scrollDownComponent>
        </div>
    </section>
    <section class="w-screen min-h-[200vh] bg-gradient-to-b from-[#edf8ff] to-[#011b2c]">
        <img
            class="absolute w-3/5 h-3/5 translate-x-[-40%] opacity-50 mt-[10%] hidden md:block"
            src="@/assets/image/fish-sides.svg"
            alt=""
        />
        <img
            class="transform translate-x-[40%] rotate-[-40deg] absolute w-6/12 h-3/5 opacity-50 mt-[10%] right-0 hidden md:block"
            src="@/assets/image/coral-1.svg"
            alt=""
        />
        <!-- 簡介 -->
        <section class="flex justify-center items-center">
            <div
                class="relative flex flex-col mt-20 justify-start text-[#35556a] items-center p-8 w-4/5 rounded-[3rem] border-4 border-dashed border-[#35556a]"
            >
                <h1 class="text-[3rem] font-bold">嗨! 我是敬勛</h1>
                <p class="text-[2rem] font-bold mt-2 text-center">
                    我來自高雄，畢業於國立中山大學海洋科學系研究所，之前曾就任科技部研究助理，目前正往工程師之路邁進，如果對於我有任何好奇，就請繼續往下滑吧!
                </p>
                <span class="text-[#6f7e88] text-2xl font-bold my-8">-或者先查看-</span>
                <waterButtonComponent text="關於我" class="mb-5"></waterButtonComponent>
            </div>
        </section>
        <!-- 潛水員軌道 -->
        <section class="relative">
            <div class="hidden md:inline-block sticky top-[50%] left-[50%] -translate-x-[2.1rem] mt-10 z-0">
                <img class="w-32 h-80 z-0" src="@/assets/image/diver-1.png" alt="" />
                <div class="absolute left-12 bottom-7 bg-white animate-ping size-10 rounded-full z-0 opacity-60"></div>
            </div>
            <section class="relative z-10">
                <h1 class="text-5xl mt-[5vh] md:text-[72px] md:-mt-8 ml-[10%] font-semibold text-white">
                    工作技能 Skills
                </h1>
                <div
                    class="mx-10 md:mx-40 min-h-[50vh] bg-gray-600/50 mt-5 backdrop-blur-md shadow-[0_4px_6px_rgba(0,0,0,0.1)] relative rounded-[3rem]"
                ></div>
            </section>
            <div class="relative mt-44 text-center z-[3] h-[70px]">
                <p class="font-semibold text-3xl hidden md:block">
                    MAKE THE <span class="font-bold text-black">CH</span>ANGES
                </p>
            </div>
        </section>
    </section>
    <FooterComponent></FooterComponent>
</template>

<style lang="css" scoped></style>
