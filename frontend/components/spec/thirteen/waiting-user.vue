<template>
  <SpecThirteenUser v-if="props?.data?.player" :player="props?.data?.player" />
  <SpecThirteenChoosePosition v-else :position="props?.data?.position" />
</template>

<script setup lang="ts">
const props = defineProps(["data"]);
</script>

<style scoped lang="scss"></style>
