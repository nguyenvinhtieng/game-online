<template>
  <div @click="inscreaseCount">practice:: {{ count }}</div>
</template>

<script setup lang="ts">
import type { RefSymbol } from "@vue/reactivity";

const count = ref<number>(0);

function inscreaseCount() {
  count.value++;
}
</script>

<style scoped lang="scss"></style>
