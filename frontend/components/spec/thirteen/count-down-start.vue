<template>
  <div>Ván đấu sẽ bắt đầu sau {{ gameStartCountdown }} giây nữa</div>
</template>

<script setup lang="ts">
import { useThirteenStore } from "~/store/module/thirteen";
const thirteenStore = useThirteenStore();
const gameStartCountdown = ref<number | string>("vài");
onMounted(() => {
  const startTime = thirteenStore.getGameStartAt;
  if (startTime instanceof Date) {
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
