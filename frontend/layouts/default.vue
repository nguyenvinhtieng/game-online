<template>
  <div class="w-full h-full bg-[url('/images/bg.jpg')] min-h-lvh">
    <div class="home-layout__container">
      <Suspense>
        <NuxtPage />
      </Suspense>
    </div>
    <div
      v-if="showRequireRotate"
      class="z-10 fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-neutral-950 text-neutral-100 flex-col"
    >
      <img src="/images/rotate.gif" alt="Rotate Screen" class="w-[80%]" />
      <p class="px-2 text-center">
        Vui lòng xoay màn hình ngang để trải nghiệm trò chơi tốt hơn
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDevice } from "#imports";
import { onMounted, ref } from "vue";
const device = useDevice();
// Create ref to show modal rotate screen
const showRequireRotate = ref(false);
onMounted(() => {
  if (device.isMobile && window.screen.orientation.type === "portrait-primary") {
    showRequireRotate.value = true;
  }

  // Listen to orientation change
  window.addEventListener("orientationchange", () => {
    if (window.screen.orientation.type === "portrait-primary") {
      showRequireRotate.value = true;
    } else {
      showRequireRotate.value = false;
    }
  });
});
</script>
<style scoped lang="scss">
.home-layout {
  &__container {
    max-width: var(--container-width);
    margin: 0 auto;
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
    min-height: 100vh;
  }
}
</style>
