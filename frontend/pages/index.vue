<template>
  <div>
    <h1 class="pt-10 text-lg font-semibold text-center">Các trò chơi đang hoạt động</h1>
    <div class="w-full max-w-[300px] mx-auto flex flex-col gap-3 mt-10">
      <NuxtLink
        to="/thirteen"
        class="flex items-center justify-center gap-2 transition-all p-3 rounded-lg hover:bg-neutral-100"
      >
        <img src="/images/game-thumbnail/thirteen.svg" alt="Thirteen" class="w-20 h-20" />
        <p class="text-lg font-semibold flex-1">Tiến lên</p>
      </NuxtLink>
      <NuxtLink
        to="/ludo"
        class="flex items-center justify-center gap-2 transition-all p-3 rounded-lg hover:bg-neutral-100"
      >
        <img src="/images/game-thumbnail/ludo.png" alt="Ludo" class="w-20 h-20" />
        <p class="text-lg font-semibold flex-1">Cờ cá ngựa</p>
      </NuxtLink>

      <SpecLudoDiceTest />
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
