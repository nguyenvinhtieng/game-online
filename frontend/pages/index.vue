<template>
  <div>
    <h1>Game List</h1>
    <NuxtLink to="/thirteen"> Tiến lên </NuxtLink>
    <NuxtLink to="/ludo"> Cờ cá ngựa </NuxtLink>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
