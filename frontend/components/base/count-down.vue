<template>
  <span>{{ countDown }}</span>
</template>

<script setup lang="ts">
const countDown = ref<number | string>("__");
const props = defineProps<{
  targetTime?: string | Date;
}>();
onMounted(() => {
  if (props.targetTime) {
    const startTime = new Date(props.targetTime);
    const now = new Date().getTime();
    const remainingTime = Math.max(0, Math.floor((startTime.getTime() - now) / 1000));
    countDown.value = remainingTime;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remainingTime = Math.max(0, Math.floor((startTime.getTime() - now) / 1000));
      countDown.value = remainingTime;
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
