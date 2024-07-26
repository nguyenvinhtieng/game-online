<template>
  <div class="flex items-center justify-center flex-col gap-5 md:gap-10 h-dvh">
    <img
      src="/images/game-thumbnail/ludo.svg"
      alt="Meow Game"
      :class="cn('w-[70%] max-w-80', device.isMobile && 'max-w-40')"
    />
    <BaseButton
      variant="outline"
      color="primary"
      shape="square"
      size="md"
      @click="handleClick"
    >
      <template v-slot:startIcon> <PlayIcon :size="16" fill="currentColor" /> </template>
      <template v-slot:child> Bắt đầu chơi </template>
    </BaseButton>
  </div>
</template>
<script setup lang="ts">
import { PlayIcon, CircleHelp } from "lucide-vue-next";
const { $router } = useNuxtApp();
const device = useDevice();

const handleClick = () => {
  $router.push("/ludo/list");
};

definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
