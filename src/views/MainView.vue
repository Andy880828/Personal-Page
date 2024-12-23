<script setup>
import { ref, onMounted } from 'vue';
import FooterComponent from '@/components/FooterComponent.vue';
const navAppended = ref(false);
const diverShowed = ref(false);
onMounted(() => {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 980) {
            diverShowed.value = true;
        } else {
            diverShowed.value = false;
        }
    });
});
</script>

<template>
    <section class="navbar">
        <label class="bar" for="check">
            <input type="checkbox" id="check" v-model="navAppended" />
            <span class="top"></span>
            <span class="middle"></span>
            <span class="bottom"></span>
        </label>
        <Transition name="fade">
            <nav v-show="navAppended" class="nav-content">
                <ul class="nav-list">
                    <li><a href="#about">關於我</a></li>
                    <li><a href="#projects">作品集</a></li>
                    <li><a href="#contact">聯絡資訊</a></li>
                </ul>
            </nav>
        </Transition>
    </section>
    <section class="hero">
        <p class="eng">Ching-Hsun Lin</p>
        <p class="zh">林敬勛</p>
        <p class="role">Web Developer / Oceanographer</p>
        <div class="scrolldown" style="--color: white">
            <div class="chevrons">
                <div class="chevrondown"></div>
                <div class="chevrondown"></div>
            </div>
        </div>
    </section>
    <section class="content">
        <img class="fish-sides-1" src="@/assets/image/fish-sides.svg" alt="" />
        <img class="coral-1" src="@/assets/image/coral-1.svg" alt="" />
        <section class="profile">
            <div class="container">
                <h1>嗨! 我是敬勛</h1>
                <p>
                    我來自高雄，畢業於國立中山大學海洋科學系研究所，之前曾就任科技部研究助理，目前正往前端工程師之路邁進，如果對於我有任何好奇，就請繼續往下滑吧!
                </p>
                <span class="">-或者先查看-</span>
                <button class="button">
                    <span class="liquid"></span>
                    <span class="btn-txt">關於我</span>
                </button>
            </div>
        </section>
        <Transition name="fade">
            <img v-if="diverShowed" class="diver-1" src="@/assets/image/diver-1.png" alt="" />
        </Transition>
        <section class="skill">
            <h1>工作技能 Skills</h1>
            <div class="container"></div>
        </section>
    </section>
    <FooterComponent></FooterComponent>
</template>

<style lang="css" scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
input[type='checkbox'] {
    -webkit-appearance: none;
    display: none;
    visibility: hidden;
}

.bar {
    display: block;
    position: fixed;
    top: 5%;
    left: 3%;
    z-index: 999;
    cursor: pointer;
    width: 50px;
    height: 40px;
}

.bar span {
    position: absolute;
    width: 45px;
    height: 7px;
    background: #f1faee;
    border-radius: 100px;
    display: inline-block;
    transition: 0.3s ease;
    left: 0;
}

.bar span.top {
    top: 0;
}

.bar span.middle {
    top: 17px;
}

.bar span.bottom {
    bottom: 0;
}

input[type]:checked ~ span.top {
    transform: rotate(45deg);
    transform-origin: top left;
    width: 48px;
    left: 5px;
}

input[type]:checked ~ span.bottom {
    transform: rotate(-45deg);
    transform-origin: top left;
    width: 48px;
    bottom: -1px;
    box-shadow: 0 0 10px #495057;
}

input[type]:checked ~ span.middle {
    transform: translateX(-20px);
    opacity: 0;
}

.nav-content {
    position: fixed;
    top: 4.3%;
    left: 7%;
    width: 30%;
    height: 3rem;
    z-index: 999;
    color: white;
    font-size: large;
    border: #f1faee dotted 5px;
    border-radius: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
}

.nav-list {
    display: flex;
    list-style: none;
    gap: 5rem;
}

.nav-list li a {
    color: #f1faee;
    text-decoration: none;
    font-size: 1.1rem;
    transition: color 0.3s ease;
}

.nav-list li a:hover {
    color: #011b2c;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.hero {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-image: url('@/assets/image/hero-bg.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    box-shadow: 0 0 100px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.hero:after {
    content: '';
    width: 100%;
    height: 10%;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #edf8ff 100%);
}
.hero .eng {
    height: 56px;
    font-size: 56px;
    color: #f6ebe4;
    text-align: center;
    margin: 0;
    padding: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
.hero .zh {
    height: 180px;
    font-size: 152px;
    color: #f6ebe4;
    text-align: center;
    align-self: center;
    margin: 0;
    padding: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
.hero .role {
    font-size: 56px;
    color: #f6ebe4;
    text-align: center;
    margin: 0 0 4rem 0;
    padding: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
.scrolldown {
    --color: white;
    --sizeX: 30px;
    --sizeY: 50px;
    position: relative;
    width: var(--sizeX);
    height: var(--sizeY);
    margin-left: var(sizeX / 2);
    border: calc(var(--sizeX) / 10) solid var(--color);
    border-radius: 50px;
    box-sizing: border-box;
    cursor: pointer;
}

.scrolldown::before {
    content: '';
    position: absolute;
    bottom: 30px;
    left: 50%;
    width: 6px;
    height: 6px;
    margin-left: -3px;
    background-color: var(--color);
    border-radius: 100%;
    animation: scrolldown-anim 2s infinite;
    box-sizing: border-box;
    box-shadow: 0px -5px 3px 1px #2a547066;
}

@keyframes scrolldown-anim {
    0% {
        opacity: 0;
        height: 6px;
    }

    40% {
        opacity: 1;
        height: 10px;
    }

    80% {
        transform: translate(0, 20px);
        height: 10px;
        opacity: 0;
    }

    100% {
        height: 3px;
        opacity: 0;
    }
}

.chevrons {
    padding: 6px 0 0 0;
    margin-left: -3px;
    margin-top: 48px;
    width: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chevrondown {
    margin-top: -6px;
    position: relative;
    border: solid var(--color);
    border-width: 0 3px 3px 0;
    display: inline-block;
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
}

.chevrondown:nth-child(odd) {
    animation: pulse54012 500ms ease infinite alternate;
}

.chevrondown:nth-child(even) {
    animation: pulse54012 500ms ease infinite alternate 250ms;
}

@keyframes pulse54012 {
    from {
        opacity: 0;
    }

    to {
        opacity: 0.5;
    }
}

.content {
    width: 100vw;
    height: 300vh;
    overflow: hidden;
    background: linear-gradient(to bottom, #edf8ff 0%, #011b2c 100%);
}

.fish-sides-1 {
    position: absolute;
    width: 60%;
    height: 60%;
    margin-top: 20%;
    transform: translateX(-40%);
    opacity: 50%;
}

.coral-1 {
    position: absolute;
    width: 50%;
    height: 60%;
    margin-top: 20%;
    right: 0%;
    transform: translateX(40%) rotateZ(-40deg);
    opacity: 50%;
}

.profile {
    display: flex;
    justify-content: center;
    align-items: center;
}

.profile .container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: baseline;
    align-items: center;
    margin-top: 5rem;
    padding: 2rem;
    width: 80%;
    min-height: 50vh;
    border: #35556a dashed 5px;
    border-radius: 3rem;
}
.profile h1 {
    color: #35556a;
    font-size: 3rem;
    font-weight: 600;
}
.profile p {
    color: #35556a;
    font-size: 2rem;
    font-weight: 600;
    margin-top: 0.5rem;
    text-align: center;
}
.profile span {
    color: #6f7e88;
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1rem;
    text-align: center;
}

.button {
    background-color: #ffffff;
    border: 0px;
    outline: 0px;
    color: #fff;
    width: 200px;
    padding: 10px;
    margin-top: 1.2rem;
    border-radius: 50px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.liquid {
    background-color: #2893eb;
    width: 200px;
    height: 70px;
    position: absolute;
    bottom: 0;
    left: 0;
    box-shadow:
        inset 5px -5px 25px #104e81,
        inset -5px 0px 25px #104e81;
}

.liquid::after {
    content: '';
    width: 450px;
    height: 400px;
    background: #ffffff;
    z-index: 1;
    position: absolute;
    left: -110px;
    top: -360px;
    border-radius: 45%;
    animation: liquid 5s linear 2s infinite;
}

.liquid::before {
    content: '';
    width: 450px;
    height: 400px;
    background-color: rgb(68, 160, 235);
    z-index: 1;
    position: absolute;
    left: -110px;
    top: -360px;
    border-radius: 40%;
    animation: liquid 5s linear 1.8s infinite;
}

.btn-txt {
    position: relative;
    z-index: 1;
    font-size: 28px !important;
    color: #35556a !important;
    letter-spacing: 2px;
}

@keyframes liquid {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.diver-1 {
    position: fixed;
    width: 150px;
    height: 330px;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
}

.skill h1 {
    margin-top: 40vh;
    position: relative;
    margin-left: 10%;
    font-size: 72px;
    font-weight: 600;
    color: #ffffff;
    z-index: 3;
}

.skill .container {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    min-height: 50vh;
    background-color: rgba(70, 70, 70, 0.5);
    backdrop-filter: blur(10px); /* 背景模糊 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 3rem;
    position: relative;
    z-index: 2;
}

/* RWD */
@media (max-width: 768px) {
    .nav-content {
        width: 85%;
        left: 13%;
    }

    .hero {
        background-position: right;
    }
    .content .coral-1,
    .content .fish-sides-1,
    .content .diver-1 {
        display: none;
    }

    .skill h1 {
        margin-top: 5vh;
        font-size: 48px;
    }
}
</style>
