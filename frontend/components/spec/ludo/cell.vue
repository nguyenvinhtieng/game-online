<template>
  <div
    :class="cn('w-full h-full relative')"
    :style="{ 'grid-row-start': props.data.y, 'grid-column-start': props.data.x }"
  >
    <div
      :class="
        cn(
          'w-full h-full rounded-full border-4',
          cellBorder,
          cellBackground,
          props.data.isEndPlace && 'border-opacity-20'
        )
      "
    ></div>

    <div class="absolute inset-0" v-if="props.data.isEndPlace">
      <ArrowBigUp :class="cn('w-full h-full', arrowColor)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowBigUp } from "lucide-vue-next";
import type { LudoRouteCell } from "~/types/game.ludo";
const props = defineProps<{
  data: LudoRouteCell;
}>();
const cellBackground = computed(() => {
  if (!props.data.isStartPlace) return "bg-white";
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
const cellBorder = computed(() => {
  switch (props.data.color) {
    case "red":
      return "border-red-500";
    case "blue":
      return "border-blue-500";
    case "yellow":
      return "border-yellow-500";
    case "green":
      return "border-green-500";
    default:
      return "border-red-500";
  }
});
const arrowColor = computed(() => {
  switch (props.data.color) {
    case "red":
      return "text-red-500 fill-red-500 rotate-90";
    case "blue":
      return "text-blue-500 fill-blue-500 rotate-180";
    case "green":
      return "text-green-500 fill-green-500 -rotate-90";
    case "yellow":
      return "text-yellow-500 fill-yellow-500";
    default:
      return "text-red-500 fill-red-500";
  }
});
</script>

<style scoped lang="scss"></style>
