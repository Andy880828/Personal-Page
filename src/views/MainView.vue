<script setup>
import { onMounted } from 'vue';
import scrollDownComponent from '@/components/scrollDownComponent.vue';
import waterButtonComponent from '@/components/waterButtonComponent.vue';
import bg from '@/assets/image/hero-bg.png';
onMounted(() => {
    const leftArrow = document.querySelector('#left-arrow');
    const rightArrow = document.querySelector('#right-arrow');
    const carousal = document.querySelector('#carousal');
    const cardWidth = carousal.querySelectorAll('div')[0].clientWidth;
    leftArrow.addEventListener('click', () => {
        carousal.scrollLeft = carousal.scrollLeft - cardWidth;
    });
    rightArrow.addEventListener('click', () => {
        carousal.scrollLeft = carousal.scrollLeft + cardWidth;
    });
});
</script>

<template>
    <!-- Hero -->
    <section
        class="relative h-screen w-screen text-center overflow-hidden bg-right md:bg-center bg-no-repeat bg-cover flex flex-col items-center justify-center after:content-[''] after:w-full after:h-[10%] after:absolute after:z-[1] after:-bottom-0.5 after:left-0 after:gradient-t-white"
        :style="{ backgroundImage: `url(${bg})` }"
    >
        <p class="md:h-14 text-2xl md:text-[56px] text-zinc-100 text-shadow-lg">Ching-Hsun Lin</p>
        <p class="md:h-[180px] text-8xl md:text-[152px] text-zinc-100 text-shadow-lg">林敬勛</p>
        <p class="text-4xl md:text-[56px] text-zinc-100 mt-0 mb-16 text-shadow-lg">Web Developer / Oceanographer</p>
        <div class="absolute bottom-40">
            <scrollDownComponent></scrollDownComponent>
        </div>
    </section>
    <section class="w-full pb-10 bg-gradient-to-b from-[#edf8ff] to-[#011b2c] relative overflow-x-clip">
        <img
            class="absolute w-[30%] h-[30%] translate-x-[-40%] mt-[10%] opacity-50 hidden md:inline-block"
            src="@/assets/image/fish-sides.svg"
            alt=""
        />
        <img
            class="absolute w-[30%] h-[30%] translate-x-[40%] rotate-[-40deg] mt-[10%] opacity-50 right-0 hidden md:inline-block"
            src="@/assets/image/coral-1.svg"
            alt=""
        />
        <!-- 簡介 -->
        <section class="flex justify-center items-center">
            <div
                class="relative flex flex-col mt-20 justify-start text-[#35556a] items-center p-8 w-4/5 rounded-[3rem] border-4 border-dashed border-[#35556a]"
            >
                <h1 class="text-4xl md:text-5xl font-bold">嗨! 我是敬勛</h1>
                <p class="text-3xl mt-4 md:mt-3 font-bold text-center">
                    我來自高雄，是一名有海洋背景的網頁全端工程師，畢業於國立中山大學海洋科學系研究所，之前曾就任科技部研究助理，如果對於我有任何好奇，就請繼續往下滑吧!
                </p>
                <span class="text-[#6f7e88] text-2xl font-bold my-8">-或者先查看-</span>
                <RouterLink to="about"><waterButtonComponent text="關於我"></waterButtonComponent></RouterLink>
            </div>
        </section>
        <!-- 潛水員軌道 -->
        <section class="relative">
            <div class="sticky hidden md:inline-block top-[50%] left-[50%] transform -translate-x-1/2 mt-10 z-0">
                <img class="w-32 h-80" src="@/assets/image/diver-1.png" alt="" />
                <div class="absolute left-12 bottom-7 bg-white animate-ping size-10 rounded-full opacity-60"></div>
            </div>
            <section class="relative z-10">
                <h1 class="text-5xl mt-[5vh] md:text-[72px] md:-mt-8 ml-[10%] font-semibold text-white">
                    工作技能 Skills
                </h1>
                <div class="flex items-center justify-center m-5">
                    <button id="left-arrow" class="px-2 text-6xl hover:opacity-70 hover:text-shadow-lg">
                        <i class="fas fa-angle-left"></i>
                    </button>
                    <div
                        id="carousal"
                        class="max-w-[90%] bg-gray-600/50 mt-5 backdrop-blur-md shadow-[0_4px_6px_rgba(0,0,0,0.1)] px-10 rounded-[3rem] scroll-smooth flex items-start w-full snap-x gap-8 overflow-x-auto"
                    >
                        <div class="skill min-w-[100%] md:min-w-[50%] min-h-[40vh] snap-center my-7">
                            <h2
                                class="text-3xl md:text-4xl text-center border-b-4 border-zinc-100 pb-4 bg-gradient-to-r from-zinc-100 to-blue-200 bg-clip-text text-transparent font-bold"
                            >
                                網頁前端技術
                            </h2>
                            <img
                                class="mx-auto my-5 h-[300px] w-[70%] hidden md:block"
                                src="@/assets/image/front-end.png"
                                alt=""
                            />
                            <p class="text-justify px-10 text-2xl text-zinc-100 leading-9 hidden md:block">
                                擅長精細切版與現代化前端技術，能夠根據需求設計出兼具美感與功能的網站。無論是<strong>響應式設計</strong>、<strong>互動效果</strong>還是<strong>複雜的前端功能</strong>開發，我都能夠快速並精確地實現，致力於提供最佳的用戶體驗和流暢的操作界面。
                            </p>
                            <p class="px-10 mb-5 text-2xl font-semibold text-zinc-100 mt-3 leading-9">
                                擅長工具: HTML5, CSS3, JavaScript, Vue3, Vite, Tailwind, Bootstrap, JQuery, Figma
                            </p>
                        </div>
                        <div class="skill min-w-[100%] md:min-w-[50%] min-h-[40vh] snap-center my-7">
                            <h2
                                class="text-3xl md:text-4xl text-center border-b-4 border-zinc-100 pb-4 bg-gradient-to-r from-zinc-100 to-blue-200 bg-clip-text text-transparent font-bold"
                            >
                                網頁後端技術
                            </h2>
                            <img
                                class="mx-auto my-5 h-[300px] w-[70%] hidden md:block"
                                src="@/assets/image/Back-end.png"
                                alt=""
                            />
                            <p class="text-justify px-10 text-2xl text-zinc-100 leading-9 hidden md:block">
                                能夠根據需求設計與建置高效、結構清晰的<strong>資料庫</strong>，並能夠撰寫功能完整且穩定的
                                <strong>RESTful APIs</strong>
                                。無論是單純的數據存取還是複雜的業務邏輯處理，我都能夠精確地設計架構，確保數據完整性，致力於讓每個系統與功能都能夠無縫對接，保證最佳的資料流與操作體驗。
                            </p>
                            <p class="px-10 mb-5 text-2xl font-semibold text-zinc-100 mt-3 leading-9">
                                擅長工具: C#, ASP.NET, ADO.NET, Microsoft SQL Server, MySQL
                            </p>
                        </div>
                        <div class="skill min-w-[100%] md:min-w-[50%] min-h-[40vh] snap-center my-7">
                            <h2
                                class="text-3xl md:text-4xl text-center border-b-4 border-zinc-100 pb-4 bg-gradient-to-r from-zinc-100 to-blue-200 bg-clip-text text-transparent font-bold"
                            >
                                其他資訊技術
                            </h2>
                            <img
                                class="mx-auto my-5 h-[300px] w-[70%] hidden md:block"
                                src="@/assets/image/other.png"
                                alt=""
                            />
                            <p class="text-justify px-10 text-2xl text-zinc-100 leading-9 hidden md:block">
                                具備獨立進行<strong>雲端部署</strong>的能力，無論是 IaaS 還是 SaaS
                                都有實際運行與部署經驗，能夠根據需求選擇合適的雲端平台。除此之外，我對於
                                <strong>Python</strong> 和 <strong>R</strong>
                                也有相當的熟練度，擅長數據處理、分析與<strong>自動化腳本開發</strong>，能夠根據不同的需求靈活應用這些語言來解決問題。最後，我也熟稔<strong>版本控制</strong>的概念。
                            </p>
                            <p class="px-10 mb-5 text-2xl font-semibold text-zinc-100 mt-3 leading-9">
                                擅長工具: Google Cloud, Microsoft Azure, Linux, Python, Pandas, R, Git, Github
                            </p>
                        </div>
                        <div class="skill min-w-[100%] md:min-w-[50%] min-h-[40vh] snap-center my-7 hidden md:block">
                            <h2
                                class="text-4xl text-center border-b-4 border-zinc-100 pb-4 bg-gradient-to-r from-zinc-100 to-blue-200 bg-clip-text text-transparent font-bold"
                            >
                                生物研究技術
                            </h2>
                            <img
                                class="mx-auto my-5 h-[300px] w-[70%] hidden md:block"
                                src="@/assets/image/field.jpg"
                                alt=""
                            />
                            <p class="text-justify px-10 text-2xl text-zinc-100 leading-9">
                                除了網頁方面，我也擅長<strong>野外調查</strong>，無論是淡水魚類、海水魚類、陸蟹皆有調查經驗，由於在碩班時期經常接觸，對於<strong>海水魚類</strong>較為熟悉。另外，對於<strong>萃取</strong>及<strong>PCR</strong>等生物技術掌握度高。碩班題目為溪流的環境DNA，善於<strong>eDNA的採樣及分析</strong>，能夠利用Python及R進行資料流處理與繪製統計圖表。
                            </p>
                        </div>
                        <div class="skill min-w-[100%] md:min-w-[50%] min-h-[40vh] snap-center my-7 hidden md:block">
                            <h2
                                class="text-4xl text-center border-b-4 border-zinc-100 pb-4 bg-gradient-to-r from-zinc-100 to-blue-200 bg-clip-text text-transparent font-bold"
                            >
                                證照及軟實力
                            </h2>
                            <img
                                class="mx-auto my-5 h-[300px] w-[70%] hidden md:block"
                                src="@/assets/image/soft.jpg"
                                alt=""
                            />
                            <p class="text-justify px-10 text-2xl text-zinc-100 leading-9">
                                曾去過美國黃石公園打工度假，做熟食店收銀員，聽說讀寫皆有一定程度，證照部分具<strong>
                                    TOEIC Reading & Listening (多益聽讀測驗) 910</strong
                                >、<strong>TOEIC Writing (多益寫作測驗) 170</strong> 及
                                <strong>TOEIC Speaking (多益口說測驗) 160</strong>。另外，也有
                                <strong>PADI Advanced Open Water Diver (進階潛水證照)</strong>。
                            </p>
                        </div>
                    </div>
                    <button id="right-arrow" class="px-2 text-6xl hover:opacity-70 hover:text-shadow-lg">
                        <i class="fas fa-angle-right"></i>
                    </button>
                </div>
            </section>
            <div class="relative mt-44 me-[50px] text-center z-10 h-[70px] hidden md:block">
                <p class="font-semibold text-3xl">MAKE THE <span class="font-bold text-black">CH</span>ANGES</p>
            </div>
        </section>
        <!-- 繼續閱讀 -->
        <div class="relative w-full mt-5 mb-20 z-10">
            <h1 class="text-2xl text-center font-semibold text-zinc-400">- 繼續查看 -</h1>
            <div
                class="absolute left-1/2 transform -translate-x-1/2 mt-5 flex flex-col md:flex-row gap-10 border-l-4 border-l-zinc-400 border-r-4 border-r-zinc-400 px-10"
            >
                <RouterLink to="about"><waterButtonComponent text="關於我"></waterButtonComponent></RouterLink>
                <RouterLink to="project"><waterButtonComponent text="作品集"></waterButtonComponent></RouterLink>
            </div>
        </div>
    </section>
</template>

<style lang="css" scoped></style>
