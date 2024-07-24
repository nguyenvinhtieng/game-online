<template>
  <span class="text-xs">Bắt đầu sau {{ gameStartCountdown }} giây</span>
</template>

<script setup lang="ts">
import { useThirteenStore } from "~/store/module/thirteen";
const thirteenStore = useThirteenStore();
const gameStartCountdown = ref<number | string>("vài");
const { gameStartAt } = storeToRefs(thirteenStore);
onMounted(() => {
  if (gameStartAt?.value) {
    const startTime = new Date(gameStartAt.value);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remainingTime = Math.max(0, Math.floor((startTime.getTime() - now) / 1000));
      gameStartCountdown.value = remainingTime;
      if (remainingTime <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    onUnmounted(() => {
      clearInterval(interval);
    });
  }
});
</script>

<style scoped lang="scss"></style>
