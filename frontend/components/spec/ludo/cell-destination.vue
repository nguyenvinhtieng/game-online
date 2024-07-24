<template>
  <div
    :class="cn('w-full h-full relative')"
    :style="{ 'grid-row-start': props.data.y, 'grid-column-start': props.data.x }"
  >
    <div :class="cn('w-full h-full rounded-2xl', cellBackground)"></div>
  </div>
</template>

<script setup lang="ts">
import type { LudoDestination } from "~/types/game.ludo";

const props = defineProps<{
  data: LudoDestination;
}>();
const cellBackground = computed(() => {
  switch (props.data.color) {
    case "red":
      return "bg-red-500/30";
    case "blue":
      return "bg-blue-500/30";
    case "green":
      return "bg-green-500/30";
    case "yellow":
      return "bg-yellow-500/30";
    default:
      return "bg-red-500/30";
  }
});
</script>

<style scoped lang="scss"></style>
