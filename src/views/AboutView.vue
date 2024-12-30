<script setup>
import { ref } from 'vue';
const skill = ref(0);
const changeSkill = (num) => {
    skill.value = num;
};
</script>

<template>
    <section class="relative min-h-screen bg-gradient-to-b from-[#6C7F8C] to-[#011B2C]">
        <div class="w-full bg-gray-800 md:bg-[url('@/assets/image/bg-3.jpg')] bg-cover bg-top rounded-b-[3rem]">
            <section class="relative flex flex-col justify-center items-center gap-5">
                <div
                    class="size-72 rounded-full bg-gradient-to-r from-[#eed991] to-[#ccf7f4] mt-20 flex justify-center items-center"
                >
                    <div
                        style="background-image: url('@/assets/image/M105090005.jpg')"
                        class="rounded-full size-[17rem] bg-top bg-cover"
                    ></div>
                </div>
                <p class="text-center text-6xl gradient-text font-extrabold">嗨! 我是敬勛!</p>
                <p class="text-center mt-3 font-semibold text-3xl text-white w-[70%] leading-10 text-shadow-lg">
                    一位具備海洋背景的網頁全端工程師，專精於 C#、JavaScript、Python 和 R 等程式語言，擅長開發 RESTful
                    API、進行前端版面設計與切版，並能熟練串接各種功能。我能獨立完成網頁開發與部署，並確保系統的穩定運行。此外，我對魚類與環境DNA也非常熟悉，若有任何<span
                        class="font-semibold line-through"
                        >有趣的潛水調查工作</span
                    >相關疑問，歡迎隨時來問我！
                </p>
                <div class="mt-10 mb-16">
                    <a
                        class="font-semibold text-3xl hover-underline hover:text-white"
                        href="https://rxresu.me/andy880828/literary-polite-sparrow"
                        target="_blank"
                        ><i class="fa-solid fa-scroll me-3"></i>下載我的RESUME</a
                    >
                </div>
            </section>
        </div>
        <section class="relative mt-12 p-10">
            <img class="absolute left-10 opacity-70 hidden md:block" src="/src/assets/image/wrasse-1.svg" alt="" />
            <img
                class="absolute right-[20%] top-[85%] opacity-70 hidden md:block"
                src="/src/assets/image/wrasse-2.svg"
                alt=""
            />
            <div class="mx-[10%] grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 place-items-center">
                <h1 class="text-4xl md:text-5xl font-bold gradient-text md:ms-auto">證照 Certificates</h1>
                <div
                    class="w-full flex flex-col justify-center text-white items-start p-8 rounded-[3rem] border-4 border-dashed border-zinc-200"
                >
                    <ul class="text-2xl list-disc list-inside leading-9">
                        <li class="font-bold">TOEIC Listening & Reading (多益聽讀測驗) 910</li>
                        <li class="font-bold">TOEIC Writing (多益寫作測驗) 170</li>
                        <li class="font-bold">TOEIC Speaking (多益口說測驗) 160</li>
                        <li class="font-bold">PADI Advanced Open Water Diver (PADI進階潛水員)</li>
                    </ul>
                </div>
                <div
                    class="relative z-10 w-full order-4 md:order-3 flex flex-col justify-center text-white items-start p-8 rounded-[3rem] border-4 border-dashed border-zinc-200"
                >
                    <button
                        @click="changeSkill(0)"
                        class="absolute z-40 rounded-full ring-4 ring-white top-[6%] md:top-[4%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                    >
                        <i class="fa-solid fa-file-code group-hover:animate-spin transition-all"></i>
                    </button>
                    <button
                        @click="changeSkill(1)"
                        class="absolute z-40 rounded-full ring-4 ring-white top-[26%] md:top-[24%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                    >
                        <i class="fa-solid fa-gear group-hover:animate-spin transition-all"></i>
                    </button>
                    <button
                        @click="changeSkill(2)"
                        class="absolute z-40 rounded-full ring-4 ring-white top-[46%] md:top-[44%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                    >
                        <i class="fa-solid fa-table group-hover:animate-spin transition-all"></i>
                    </button>
                    <button
                        @click="changeSkill(3)"
                        class="absolute z-40 rounded-full ring-4 ring-white top-[66%] md:top-[64%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                    >
                        <i class="fa-solid fa-cloud group-hover:animate-spin transition-all"></i>
                    </button>
                    <button
                        @click="changeSkill(4)"
                        class="absolute z-40 rounded-full ring-4 ring-white top-[86%] md:top-[84%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                    >
                        <i class="fa-solid fa-dna group-hover:animate-spin transition-all"></i>
                    </button>
                    <div v-if="skill === 0">
                        <p class="text-3xl font-bold underline underline-offset-8">網頁前端專長</p>
                        <p class="mt-5 text-2xl font-bold">
                            擅長 前端設計、切版、功能串接、網頁互動功能、響應式設計(RWD)。
                        </p>
                        <p class="mt-4 text-2xl font-bold">
                            會使用 JavaScript、HTML5、CSS3、VueJS、Tailwind、Vite、Bootstrap、JQuery、Figma
                        </p>
                    </div>
                    <div v-if="skill === 1">
                        <p class="text-3xl font-bold underline underline-offset-8">網頁後端專長</p>
                        <p class="mt-5 text-2xl font-bold">擅長 RESTful APIs建置、可擴展後端系統的設計與實作。</p>
                        <p class="mt-4 text-2xl font-bold">會使用 C#、ASP.NET、ADO.NET</p>
                    </div>
                    <div v-if="skill === 2">
                        <p class="text-3xl font-bold underline underline-offset-8">資料庫專長</p>
                        <p class="mt-5 text-2xl font-bold">
                            擅長 資料庫操作(SQL語言)、網頁資料庫設計、E-R Diagram繪製。
                        </p>
                        <p class="mt-4 text-2xl font-bold">會使用 Microsoft SQL Server、MySQL</p>
                    </div>
                    <div v-if="skill === 3">
                        <p class="text-3xl font-bold underline underline-offset-8">其他資訊專長</p>
                        <p class="mt-5 text-2xl font-bold">
                            擅長
                            雲端服務商網站部署(IaaS與SaaS皆有經驗)、Python視窗應用程式撰寫、Pandas資料處理、R語言統計分析與繪圖、Git與Github版本控制。
                        </p>
                        <p class="mt-4 text-2xl font-bold">
                            會使用 Google Cloud, Microsoft Azure, Linux, Python, Pandas, R, Git, Github
                        </p>
                    </div>
                    <div v-if="skill === 4">
                        <p class="text-3xl font-bold underline underline-offset-8">生物研究專長</p>
                        <p class="mt-5 text-2xl font-bold">
                            擅長潮間帶魚類調查、溪流魚類調查、DNA萃取、PCR、eDNA分析、科學文章撰寫。
                        </p>
                        <p class="mt-4 text-2xl font-bold">
                            會使用 目視調查法、拋網、陷阱法、DNA管柱精萃、凝膠電泳法、eDNA採樣、eDNA資料流處理
                        </p>
                    </div>
                </div>
                <h1 class="order-3 md:order-4 text-4xl md:text-5xl font-bold gradient-text text-start md:me-auto">
                    工作技能 Skills
                </h1>
            </div>
        </section>
        <!-- 學經歷 -->
        <section class="mt-20">
            <div class="relative mt-5 mx-auto min-h-48 w-[70%] md:w-[40%] md:translate-x-[8%]">
                <div class="absolute top-[50%] -left-[12%] md:-left-[7%] -translate-y-1/2">
                    <span
                        class="text-3xl md:text-5xl font-bold gradient-text -rotate-90 -translate-x-[50%] inline-block tracking-wider"
                    >
                        學經歷 Experiences
                    </span>
                </div>
                <div
                    class="absolute left-0 top-0 ml-[-8px] h-full w-4 rounded-full ring-2 ring-zinc-200 bg-gradient-to-b from-[#eed991] to-[#ccf7f4]"
                >
                    <div class="sticky top-1/2">
                        <div
                            class="h-4 w-4 rounded-full ring-1 ring-zinc-200 bg-black flex items-center text-sm text-white justify-center font-bold transform -translate-y-[0.1rem] -translate-x-[0.05rem]"
                        >
                            C
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-[30%,70%] content-start gap-5 md:gap-10 ms-8">
                    <div class="text-zinc-200 font-semibold text-2xl">2014/09-2017/06</div>
                    <div class="font-bold text-3xl text-white">國立鳳新高中</div>
                    <div class="text-zinc-200 font-semibold text-2xl">2017/09-2021/06</div>
                    <div class="font-bold text-3xl text-white">國立中山大學海洋科學系</div>
                    <div class="text-zinc-200 font-semibold text-2xl">2019/07-2019/08</div>
                    <div class="font-bold text-3xl text-white">海鯨號實習鯨豚解說員</div>
                    <div class="text-zinc-200 font-semibold text-2xl">2021/09-2023/11</div>
                    <div class="font-bold text-3xl text-white">國立中山大學海洋科學系研究所</div>
                    <div class="text-zinc-200 font-semibold text-2xl">2023/06-2023/09</div>
                    <div class="font-bold text-3xl text-white">美國黃石公園BearPaw Deli員工</div>
                    <div class="text-zinc-200 font-semibold text-2xl">2024/01-2024/02</div>
                    <div class="font-bold text-3xl text-white">國立中山大學研究助理</div>
                    <div class="text-zinc-200 font-semibold text-2xl">2024/06-2024/11</div>
                    <div class="font-bold text-3xl text-white">資展國際全端就業養成班學員</div>
                </div>
            </div>
        </section>
        <!-- 興趣 -->
        <section class="relative mt-40 flex flex-col items-center justify-center">
            <h1 class="text-2xl md:text-3xl font-semibold">當我沒有在工作時，我可能在</h1>
            <h1 class="text-3xl md:text-4xl font-bold md:mt-5 mt-2 text-center">
                <span class="font-extrabold text-white">登山</span>、<span class="font-extrabold text-white">潛水</span
                >、<span class="font-extrabold text-white">旅遊</span>、<span class="font-extrabold text-white"
                    >唱歌</span
                >、<span class="font-extrabold text-white">看魚</span>、<span class="font-extrabold text-white"
                    >玩遊戲</span
                >
            </h1>
            <img class="md:w-[70%] w-full" src="/src/assets/image/個人.png" alt="" />
        </section>
        <p class="mt-20 text-center text-5xl gradient-text font-bold h-32 md:h-auto">- 感謝你的造訪 -</p>
    </section>
</template>

<style lang="css" scoped></style>
