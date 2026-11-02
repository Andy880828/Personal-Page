<script setup>
// 定義 emit
const emit = defineEmits(['onToggle']);
const onToggle = () => {
    emit('onToggle', true);
};
</script>
<template>
    <div class="relative text-zinc-100 flex flex-col justify-center items-center [&>div:last-child]:mt-5">
        <div class="flex justify-center items-center gap-32 text-5xl z-50">
            <a
                href="https://www.facebook.com/people/%E6%9E%97%E6%95%AC%E5%8B%9B/pfbid0zu3HuzQ6gFtLzC57gRiKSMiQKBY6b5Tj9zJmYn7UvUqx7b2P11smR9yTbqVtA4a3l/"
                target="_blank"
                ><i class="fa-brands fa-facebook cursor-pointer"></i
            ></a>
            <a href="https://github.com/Andy880828" target="_blank"><i class="fa-brands fa-square-github"></i></a>
            <button @click="onToggle"><i class="fa-solid fa-envelope cursor-pointer"></i></button>
        </div>
        <div class="text-2xl">&copy;2024 CHING-HSUN LIN</div>
    </div>
</template>

<style lang="css" scoped></style>
