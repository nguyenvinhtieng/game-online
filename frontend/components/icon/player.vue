<template>
  <svg
    :width="props.width || 41"
    :height="props.height || 60"
    viewBox="0 0 41 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 5C5 3.34315 6.34315 2 8 2H33C34.6569 2 36 3.34315 36 5V30C36 31.6569 34.6569 33 33 33H8C6.34315 33 5 31.6569 5 30V5ZM11.3721 40.8334C11.9287 40.0002 12.8645 39.5 13.8665 39.5H27.1335C28.1355 39.5 29.0713 40.0002 29.628 40.8334L38.1223 53.5469C39.2263 55.5613 37.7669 58 35.533 58H5.46701C3.23312 58 1.77369 55.5613 2.87772 53.5469L11.3721 40.8334Z"
      stroke="black"
      stroke-width="4"
    />
  </svg>
</template>
<script setup lang="ts">
const props = defineProps<{
  width?: number;
  height?: number;
}>();
</script>
