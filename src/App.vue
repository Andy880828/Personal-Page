<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import emailjs from '@emailjs/browser';
import Loader from './components/Layout/LoaderComponent.vue';
import FooterComponent from '@/components/Layout/FooterComponent.vue';
import NavComponent from './components/Layout/NavComponent.vue';
import LogoComponent from './components/Layout/LogoComponent.vue';
// 控制modal
const isModalVisible = ref(false);
const onToggle = () => {
    isModalVisible.value = !isModalVisible.value;
};
const sendEmail = () => {
    const form = document.querySelector('#form');
    emailjs
        .sendForm('service_uhk8dgb', 'personal_page', form, {
            publicKey: 'zFWZ8gmCOI6hd493I',
        })
        .then(
            () => {
                isModalVisible.value = false;
                console.log('發送成功!');
            },
            (error) => {
                isModalVisible.value = false;
                console.log('發送失敗...', error.text);
            }
        );
};
</script>

<template>
    <Loader />
    <div class="wrapper">
        <!-- Modal -->
        <section v-if="isModalVisible">
            <!-- Backdrop -->
            <div @click="onToggle" class="fixed inset-0 bg-black/50 z-40"></div>

            <!-- Modal -->
            <div class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="w-full max-w-lg relative rounded-xl shadow-lg">
                        <!-- Content -->
                        <section class="bg-gray-600/50 backdrop-blur-md rounded-xl">
                            <button
                                @click="onToggle"
                                class="absolute bg-gray-200 right-4 top-4 rounded-full p-1 hover:bg-gray-100 transition-colors"
                            >
                                <i class="fa-solid fa-xmark text-gray-500"></i>
                            </button>
                            <div class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
                                <div class="grid grid-cols-1 gap-x-16 gap-y-8">
                                    <div class="rounded-lg bg-white px-4 py-5 shadow-lg lg:col-span-3 lg:px-8">
                                        <p class="text-gray-800 text-xl font-semibold text-center">使用資訊媒體聯繫</p>
                                        <div
                                            class="flex justify-center items-center gap-20 text-5xl mt-4 text-gray-600"
                                        >
                                            <a
                                                href="https://www.facebook.com/people/%E6%9E%97%E6%95%AC%E5%8B%9B/pfbid0zu3HuzQ6gFtLzC57gRiKSMiQKBY6b5Tj9zJmYn7UvUqx7b2P11smR9yTbqVtA4a3l/"
                                                target="_blank"
                                                ><i class="fa-brands fa-facebook cursor-pointer"></i
                                            ></a>
                                            <a href="https://github.com/Andy880828" target="_blank"
                                                ><i class="fa-brands fa-square-github"></i
                                            ></a>
                                        </div>
                                        <p class="text-gray-800 text-xl font-semibold text-center mt-5 mb-3">
                                            或者發送信件
                                        </p>
                                        <form id="form" @submit.prevent="sendEmail" class="space-y-4">
                                            <div>
                                                <label class="sr-only" for="name">姓名</label>
                                                <input
                                                    class="w-full rounded-lg border-2 border-gray-200 p-3 text-sm text-black"
                                                    placeholder="姓名"
                                                    type="text"
                                                    name="user_name"
                                                    required
                                                />
                                            </div>

                                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label class="sr-only" for="email">Email</label>
                                                    <input
                                                        class="w-full rounded-lg border-2 border-gray-200 p-3 text-sm text-black"
                                                        placeholder="Email"
                                                        type="email"
                                                        name="user_email"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label class="sr-only" for="phone">行動電話</label>
                                                    <input
                                                        class="w-full rounded-lg border-2 border-gray-200 p-3 text-sm text-black"
                                                        placeholder="行動電話"
                                                        type="tel"
                                                        name="user_phone"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label class="sr-only text-black" for="message">訊息</label>
                                                <textarea
                                                    class="w-full rounded-lg border-2 border-gray-200 p-3 text-sm text-black"
                                                    placeholder="訊息"
                                                    rows="8"
                                                    name="message"
                                                    required
                                                ></textarea>
                                            </div>

                                            <div class="mt-4 flex justify-center">
                                                <button
                                                    type="submit"
                                                    class="inline-block w-full rounded-lg bg-black px-5 py-3 text-white font-semibold sm:w-auto hover:opacity-60"
                                                >
                                                    寄送郵件
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>
        <LogoComponent></LogoComponent>
        <NavComponent @onToggle="onToggle"></NavComponent>
        <RouterView />
        <!-- footer -->
        <section class="relative bg-gradient-to-b from-[#011b2c] to-[#000000] h-20 md:h-72 z-0">
            <img
                class="absolute bottom-0 w-full brightness-0 hidden md:inline-block"
                src="/src/assets/image/footer.png"
                alt=""
            />
            <div class="absolute bottom-7 left-1/2 transform -translate-x-1/2">
                <FooterComponent @onToggle="onToggle"></FooterComponent>
            </div>
        </section>
    </div>
</template>

<style scoped></style>
