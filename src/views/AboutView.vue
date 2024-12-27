<script setup></script>

<template>
    <section class="min-h-screen bg-gradient-to-b from-[#BFE3FA] to-[#011B2C]">
        <section class="flex flex-col justify-center items-center gap-5">
            <div
                class="size-36 rounded-full bg-gradient-to-r from-[#eed991] to-[#ccf7f4] mt-20 flex justify-center items-center"
            >
                <div
                    style="background-image: url('./src/assets//image/M105090005.jpg')"
                    class="rounded-full size-[8.5rem] bg-top bg-cover"
                ></div>
            </div>
            <p class="text-center text-6xl gradient-text font-bold">嗨! 我是林敬勛 :)</p>
            <p class="text-center mt-3 font-semibold text-3xl text-white w-[70%] leading-10">
                一位具備海洋背景的網頁全端工程師，專精於 C#、JavaScript、Python 和 R 等程式語言，擅長開發 RESTful
                API、進行前端版面設計與切版，並能熟練串接各種功能。我能獨立完成網頁開發與部署，並確保系統的穩定運行。此外，我對魚類與環境DNA也非常熟悉，若有任何<span
                    class="font-semibold line-through"
                    >有趣的潛水調查工作</span
                >相關疑問，歡迎隨時來問我！
            </p>
            <div class="mt-12">
                <a
                    class="font-semibold text-3xl hover-underline hover:text-white"
                    href="https://rxresu.me/andy880828/literary-polite-sparrow"
                    target="_blank"
                    ><i class="fa-solid fa-scroll me-3"></i>下載我的RESUME</a
                >
            </div>
        </section>
        <section class="mt-16 mx-[10%] grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 place-items-center">
            <h1 class="text-4xl md:text-5xl font-bold gradient-text md:ms-auto">證照 Certificates</h1>
            <div
                class="w-full flex flex-col justify-center text-zinc-200 items-start p-8 rounded-[3rem] border-4 border-dashed border-zinc-200"
            >
                <ul class="text-2xl list-disc list-inside leading-9">
                    <li class="font-bold">TOEIC Listening & Reading (多益聽讀測驗) 910</li>
                    <li class="font-bold">TOEIC Writing (多益寫作測驗) 170</li>
                    <li class="font-bold">TOEIC Speaking (多益口說測驗) 160</li>
                    <li class="font-bold">PADI Advanced Open Water Diver (PADI進階潛水員)</li>
                </ul>
            </div>
            <div
                class="relative z-50 w-full order-4 md:order-3 flex flex-col justify-center text-zinc-200 items-start p-8 rounded-[3rem] border-4 border-dashed border-zinc-200"
            >
                <div
                    class="absolute z-40 rounded-full ring-4 ring-white top-[6%] md:top-[4%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                >
                    <i class="fa-solid fa-file-code group-hover:animate-spin transition-all"></i>
                </div>
                <div
                    class="absolute z-40 rounded-full ring-4 ring-white top-[26%] md:top-[24%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                >
                    <i class="fa-solid fa-gear group-hover:animate-spin transition-all"></i>
                </div>
                <div
                    class="absolute z-40 rounded-full ring-4 ring-white top-[46%] md:top-[44%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                >
                    <i class="fa-solid fa-table group-hover:animate-spin transition-all"></i>
                </div>
                <div
                    class="absolute z-40 rounded-full ring-4 ring-white top-[66%] md:top-[64%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                >
                    <i class="fa-solid fa-cloud group-hover:animate-spin transition-all"></i>
                </div>
                <div
                    class="absolute z-40 rounded-full ring-4 ring-white top-[86%] md:top-[84%] left-0 size-6 md:size-8 md:-translate-x-[140%] -translate-x-[160%] flex items-center justify-center group cursor-pointer"
                >
                    <i class="fa-solid fa-dna group-hover:animate-spin transition-all"></i>
                </div>
                <div>
                    <p class="text-3xl font-bold underline underline-offset-8">網頁前端專長</p>
                    <p class="mt-5 text-2xl font-bold">
                        擅長 前端設計、切版、功能串接、網頁互動功能、響應式設計(RWD)。
                    </p>
                    <p class="mt-4 text-2xl font-bold">
                        會使用 JavaScript、HTML5、CSS3、VueJS、Tailwind、Vite、Bootstrap、JQuery、Figma
                    </p>
                </div>
                <div>
                    <p class="text-3xl font-bold underline underline-offset-8">網頁後端專長</p>
                    <p class="mt-5 text-2xl font-bold">擅長 RESTful APIs建置、可擴展後端系統的設計與實作。</p>
                    <p class="mt-4 text-2xl font-bold">會使用 C#、ASP.NET、ADO.NET</p>
                </div>
                <div>
                    <p class="text-3xl font-bold underline underline-offset-8">資料庫專長</p>
                    <p class="mt-5 text-2xl font-bold">擅長 資料庫操作(SQL語言)、網頁資料庫設計、E-R Diagram繪製。</p>
                    <p class="mt-4 text-2xl font-bold">會使用 Microsoft SQL Server、MySQL</p>
                </div>
                <div>
                    <p class="text-3xl font-bold underline underline-offset-8">其他資訊專長</p>
                    <p class="mt-5 text-2xl font-bold">
                        擅長
                        雲端服務商網站部署(IaaS與SaaS皆有經驗)、Python視窗應用程式撰寫、Pandas資料處理、R語言統計分析與繪圖、Git與Github版本控制。
                    </p>
                    <p class="mt-4 text-2xl font-bold">
                        會使用 Google Cloud, Microsoft Azure, Linux, Python, Pandas, R, Git, Github
                    </p>
                </div>
                <div>
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
        </section>
        <section></section>
    </section>
</template>

<style lang="css" scoped></style>
