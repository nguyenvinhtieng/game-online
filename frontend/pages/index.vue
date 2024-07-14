<template>
  <div class="mt-4">
    <h1 class="text-lg">Các trò chơi trực tuyến đang hoạt động</h1>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-5">
      <NuxtLink
        v-for="game in GAMES"
        :to="game.link"
        :key="game.id"
        class="relative flex flex-col transition-all text-gray-700 border border-neutral-100 bg-white hover:shadow-md bg-clip-border rounded-xl p-3"
      >
        <img
          :src="game.thumbnail"
          :alt="game.name"
          class="w-full object-cover rounded-lg aspect-square"
        />
        <div class="mt-6">
          <h2 class="text-lg font-semibold">{{ game.name }}</h2>
          <p class="text-sm text-gray-500">{{ game.description }}</p>
          <p class="text-xs text-gray-500">100 người đang chơi</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import { GAMES } from "~/constants/games";
definePageMeta({
  layout: "home",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
