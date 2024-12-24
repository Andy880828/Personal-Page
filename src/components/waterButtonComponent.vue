<script setup>
defineProps({
    text: String,
});
</script>

<template>
    <button
        class="ring-2 ring-slate-400 bg-white text-white w-[200px] relative overflow-hidden cursor-pointer p-2.5 rounded-[50px] border-0 hover:opacity-90 hover:shadow-xl"
    >
        <span class="liquid"></span>
        <span class="btn-txt">{{ text }}</span>
    </button>
</template>

<style lang="css" scoped>
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
    font-size: 28px;
    font-weight: 600;
    color: #35556a;
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
</style>
