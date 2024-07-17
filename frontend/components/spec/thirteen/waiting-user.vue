<template>
  <SpecThirteenUser v-if="props?.player?.player" :player="props?.player?.player" />
  <SpecThirteenChoosePosition v-else :position="props?.player?.position" />
</template>

<script setup lang="ts">
const props = defineProps(["player"]);
</script>

<style scoped lang="scss"></style>
