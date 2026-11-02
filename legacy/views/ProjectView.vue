<script setup></script>

<template>
    <section class="min-h-screen bg-gradient-to-b from-[#6C7F8C] to-[#011B2C] pt-24">
        <p class="text-center text-7xl text-white font-bold">所有作品</p>
        <!-- list開始 -->
        <section class="mt-12 pb-20">
            <div
                class="max-w-[70%] mx-auto p-4 bg-white/90 rounded-lg shadow-md flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
                <!-- Image Section -->
                <div class="flex-none sm:w-1/3">
                    <img
                        src="/src/assets/image/RecipeCube.png"
                        alt="Card image"
                        class="rounded-lg object-cover w-full h-48 sm:h-full"
                    />
                </div>
                <!-- Content Section -->
                <div class="flex-grow flex flex-col gap-3 items-center md:items-start">
                    <!-- Tag -->
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-sm font-medium text-white bg-black px-2 py-1 rounded-full">WEB APP</span>
                        <span class="text-sm font-medium text-white bg-emerald-500 px-2 py-1 rounded-full">VueJS</span>
                        <span class="text-sm font-medium text-white bg-amber-600 px-2 py-1 rounded-full">ASP.NET</span>
                    </div>
                    <!-- Title -->
                    <h2 class="text-3xl text-center md:text-start font-bold text-gray-900 leading-snug">
                        食譜魔方 RecipeCube
                    </h2>
                    <!-- Description -->
                    <p class="text-xl mb-3 text-center md:text-start font-medium text-gray-600">
                        前端Vue3+後端ASP.NET Core Web API (Restful
                        API)，用來智慧管理食材+推薦食譜的WebApp，旨在解決食材浪費的難題。
                    </p>
                    <div class="flex mt-auto gap-3 text-xl text-gray-500">
                        <a href="https://github.com/Andy880828/RecipeCube.git" target="_blank"
                            ><button
                                class="cursor-pointer transition-all bg-black text-white px-6 py-2 rounded-lg border-zinc-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                            >
                                <i class="fa-brands fa-github me-1"></i>Github
                            </button></a
                        >
                        <a href="https://chlinandys.com" target="_blank"
                            ><button
                                class="cursor-pointer transition-all bg-black text-white px-6 py-2 rounded-lg border-zinc-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                            >
                                <i class="fa-solid fa-laptop me-1"></i>Live Demo
                            </button></a
                        >
                    </div>
                </div>
            </div>
            <div
                class="mt-8 max-w-[70%] mx-auto p-4 bg-white/90 rounded-lg shadow-md flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
                <!-- Image Section -->
                <div class="flex-none sm:w-1/3">
                    <img
                        src="/src/assets/image/AquariumFishVending.png"
                        alt="Card image"
                        class="rounded-lg object-cover w-full h-48 sm:h-full"
                    />
                </div>
                <!-- Content Section -->
                <div class="flex-grow flex flex-col gap-3 items-center md:items-start">
                    <!-- Tag -->
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-sm font-medium text-white bg-black px-2 py-1 rounded-full">WinForm</span>
                        <span class="text-sm font-medium text-white bg-indigo-400 px-2 py-1 rounded-full">C#</span>
                        <span class="text-sm font-medium text-white bg-amber-600 px-2 py-1 rounded-full">ADO.NET</span>
                    </div>
                    <!-- Title -->
                    <h2 class="text-3xl text-center md:text-start font-bold text-gray-900 leading-snug">
                        觀賞魚販賣系統 AquariumFishVending
                    </h2>
                    <!-- Description -->
                    <p class="text-xl mb-3 text-center md:text-start font-medium text-gray-600">
                        介面C#+後端ADO.NET，假想寫給水族商家使用的WinForm
                        App，根據帳號權限具有三種不同操作系統，顧客(販賣機)、員工(POS機)、老闆(管理系統)。
                    </p>
                    <div class="flex mt-auto gap-3 text-xl text-gray-500">
                        <a href="https://github.com/Andy880828/AquariumFishVending.git" target="_blank"
                            ><button
                                class="cursor-pointer transition-all bg-black text-white px-6 py-2 rounded-lg border-zinc-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                            >
                                <i class="fa-brands fa-github me-1"></i>Github
                            </button></a
                        >
                    </div>
                </div>
            </div>
            <div
                class="mt-8 max-w-[70%] mx-auto p-4 bg-white/90 rounded-lg shadow-md flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
                <!-- Image Section -->
                <div class="flex-none sm:w-1/3">
                    <img
                        src="/src/assets/image/BINGOBINGO.png"
                        alt="Card image"
                        class="rounded-lg object-cover w-full h-48 sm:h-full"
                    />
                </div>
                <!-- Content Section -->
                <div class="flex-grow flex flex-col gap-3 items-center md:items-start">
                    <!-- Tag -->
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-sm font-medium text-white bg-black px-2 py-1 rounded-full">WinForm</span>
                        <span class="text-sm font-medium text-white bg-indigo-400 px-2 py-1 rounded-full">C#</span>
                    </div>
                    <!-- Title -->
                    <h2 class="text-3xl text-center md:text-start font-bold text-gray-900 leading-snug">
                        BINGOBINGO選號器
                    </h2>
                    <!-- Description -->
                    <p class="text-xl mb-3 text-center md:text-start font-medium text-gray-600">
                        C#寫成的BingoBingo選號器，附帶各大玩法，也有連碰(多號碼)跟多倍率，附帶模擬開獎與對獎功能，可以做為教育用途(機率論)或過乾癮。
                    </p>
                    <div class="flex mt-auto gap-3 text-xl text-gray-500">
                        <a href="https://github.com/Andy880828/BingoBingoGenerator.git" target="_blank">
                            <button
                                class="cursor-pointer transition-all bg-black text-white px-6 py-2 rounded-lg border-zinc-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                            >
                                <i class="fa-brands fa-github me-1"></i>Github
                            </button></a
                        >
                    </div>
                </div>
            </div>
            <div
                class="mt-8 max-w-[70%] mx-auto p-4 bg-white/90 rounded-lg shadow-md flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
                <!-- Image Section -->
                <div class="flex-none sm:w-1/3">
                    <img
                        src="/src/assets/image/Trim2Sort.png"
                        alt="Card image"
                        class="rounded-lg object-cover w-full h-48 sm:h-full"
                    />
                </div>
                <!-- Content Section -->
                <div class="flex-grow flex flex-col gap-3 items-center md:items-start">
                    <!-- Tag -->
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-sm font-medium text-white bg-black px-2 py-1 rounded-full">WinForm</span>
                        <span class="text-sm font-medium text-white bg-sky-800 px-2 py-1 rounded-full">Python</span>
                        <span class="text-sm font-medium text-white bg-pink-500 px-2 py-1 rounded-full">Pandas</span>
                    </div>
                    <!-- Title -->
                    <h2 class="text-3xl text-center md:text-start font-bold text-gray-900 leading-snug">
                        DNA資料流系統 Trim2Sort
                    </h2>
                    <!-- Description -->
                    <p class="text-xl mb-3 text-center md:text-start font-medium text-gray-600">
                        Python配合Tkinter打包而成的Winform
                        App，可以處理eDNA的RawData，輸出附中文的完整物種名錄，並利用Pandas對輸出文件進行多樣統計。
                    </p>
                    <div class="flex mt-auto gap-3 text-xl text-gray-500">
                        <a href="https://github.com/Andy880828/Trim2Sort.git" target="_blank">
                            <button
                                class="cursor-pointer transition-all bg-black text-white px-6 py-2 rounded-lg border-zinc-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                            >
                                <i class="fa-brands fa-github me-1"></i>Github
                            </button></a
                        >
                    </div>
                </div>
            </div>
        </section>
    </section>
</template>

<style lang="css" scoped></style>
