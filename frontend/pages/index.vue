<template>
  <div class="flex items-center justify-center flex-col gap-10 h-lvh">
    <img src="/images/game-thumbnail/thirteen.svg" alt="Meow Game" class="w-80" />
    <BaseButton
      variant="outline"
      color="primary"
      shape="square"
      size="md"
      @click="handleClick"
    >
      <template v-slot:startIcon> <PlayIcon :size="16" /> </template>
      <template v-slot:child> Bắt đầu chơi </template>
    </BaseButton>
    <p class="text-primary text-sm cursor-pointer font-semibold flex gap-2 items-center">
      <CircleHelp :size="16" /><span>Cách chơi</span>
    </p>
  </div>
</template>
<script setup lang="ts">
import { PlayIcon, CircleHelp } from "lucide-vue-next";
const { $router } = useNuxtApp();
const handleClick = () => {
  $router.push("/game/thirteen");
};
definePageMeta({
  layout: "home",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
