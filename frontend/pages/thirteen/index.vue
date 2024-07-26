<template>
  <div class="flex items-center justify-center flex-col gap-5 md:gap-10 h-dvh">
    <img
      src="/images/game-thumbnail/thirteen.png"
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
    <NuxtLink
      to="/"
      class="text-primary md:text-sm text-xs cursor-pointer font-semibold flex gap-2 items-center"
    >
      <span>Trang chủ</span>
    </NuxtLink>
  </div>
</template>
<script setup lang="ts">
import { PlayIcon, CircleHelp } from "lucide-vue-next";
const { $router } = useNuxtApp();
const device = useDevice();

const handleClick = () => {
  $router.push("/thirteen/list");
};

definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
