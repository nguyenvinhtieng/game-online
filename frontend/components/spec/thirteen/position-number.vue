<template>
  <!-- TOP -->
  <span
    class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center bg-primary text-white font-semibold text-2xl rounded"
  >
    {{ props.positions[0] + 1 }}
  </span>
  <!-- LEFT -->
  <span
    class="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-primary text-white font-semibold text-2xl rounded"
  >
    {{ props.positions[1] + 1 }}
  </span>
  <!-- RIGHT -->
  <span
    class="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-primary text-white font-semibold text-2xl rounded"
  >
    {{ props.positions[3] + 1 }}
  </span>
  <!-- BOTTOM -->
  <span
    class="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center bg-primary text-white font-semibold text-2xl rounded"
  >
    {{ props.positions[2] + 1 }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  positions: number[];
}>();
</script>

<style scoped lang="scss"></style>
