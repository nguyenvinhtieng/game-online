<template>
  <svg
    :width="props.width || 41"
    :height="props.height || 60"
    viewBox="0 0 41 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 5C3 2.23858 5.23858 0 8 0H33C35.7614 0 38 2.23858 38 5V30C38 32.7614 35.7614 35 33 35H8C5.23858 35 3 32.7614 3 30V5Z"
      fill="#D91F26"
    />
    <path
      d="M13.8665 37.5C12.1965 37.5 10.6368 38.3337 9.70908 39.7223L1.17186 52.5C-0.737093 55.8333 1.6491 60 5.46701 60H35.533C39.3509 60 41.7371 55.8333 39.8281 52.5L31.2909 39.7223C30.3632 38.3337 28.8035 37.5 27.1335 37.5H13.8665Z"
      fill="#D91F26"
    />
  </svg>
</template>
<script setup lang="ts">
const props = defineProps<{
  width?: number;
  height?: number;
}>();
</script>
