<template>
  <NuxtLink
    :to="game.link"
    class="flex flex-col items-center justify-start md:w-[20%] md:hover:bg-white md:hover:shadow-2xl p-3 rounded-[48px] group-hover:opacity-10 hover:!opacity-100 hover:!scale-110 transition-all duration-300"
  >
    <img :src="game.thumbnail" :alt="game.name" class="w-full aspect-square" />
    <p class="text-lg font-semibold flex-1 -mt-2">{{ game.name }}</p>
  </NuxtLink>
</template>
<script setup lang="ts">
import { type GameItem } from "~/constants/games";

const props = defineProps<{
  game: GameItem;
}>();
</script>
