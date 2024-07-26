<template>
  <div>
    <h1 class="pt-10 text-lg text-center opacity-50">Các trò chơi đang hoạt động</h1>
    <div
      class="w-full md:flex md:items-stretch md:justify-center gap-5 mt-10 grid grid-cols-2 group"
    >
      <SpecGameItem v-for="game in GAMES" :game="game" :key="game.link" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { GAMES } from "~/constants";

definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
