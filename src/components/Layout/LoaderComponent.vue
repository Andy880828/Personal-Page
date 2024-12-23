<script setup>
import { ref, onMounted } from 'vue';
const isLoaded = ref(false);

// onMounted(() => {
//     document.onreadystatechange = () => {
//         if (document.readyState === 'complete') {
//             isLoaded.value = true;
//         }
//     };
// });

onMounted(() => {
    document.onreadystatechange = () => {
        if (document.readyState === 'complete') {
            // 稍微延遲一下不然看不到preloader XD，之後東西多在改用上面那段
            setTimeout(() => {
                isLoaded.value = true;
            }, 1000);
        }
    };
});
</script>

<template>
    <div v-if="!isLoaded" class="loader">
        <span>CHING-HSUN LIN</span>
        <span>CHING-HSUN LIN</span>
    </div>
</template>

<style lang="css" scoped>
.loader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(255, 255, 255);
    display: flex;
    align-items: center; /* 垂直置中 */
    justify-content: center; /* 水平置中 */
    opacity: 1;
    z-index: 9999;
    transition: opacity 0.25s ease;
}

.loader span {
    position: absolute;
    color: #fff;
    font-size: 72px;
    letter-spacing: 5px;
}

.loader span:nth-child(1) {
    color: transparent;
    -webkit-text-stroke: 0.3px rgb(0, 57, 244);
}

.loader span:nth-child(2) {
    color: rgb(0, 4, 255);
    -webkit-text-stroke: 1px rgb(17, 0, 255);
    animation: uiverse723 3s ease-in-out infinite;
}

@keyframes uiverse723 {
    0%,
    100% {
        clip-path: polygon(0% 45%, 15% 44%, 32% 50%, 54% 60%, 70% 61%, 84% 59%, 100% 52%, 100% 100%, 0% 100%);
    }

    50% {
        clip-path: polygon(0% 60%, 16% 65%, 34% 66%, 51% 62%, 67% 50%, 84% 45%, 100% 46%, 100% 100%, 0% 100%);
    }
}
</style>
