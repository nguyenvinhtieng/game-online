<template>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-1/2">
    <div class="relative flex w-full flex-wrap gap-y-1 justify-center">
      <img
        v-for="(card, index) in thirteenStore.getPrevTurn[
          thirteenStore.getPrevTurn.length - 1
        ].cards"
        :src="`/images/card/meow/${card.value}_${card.suit}.svg`"
        alt="Card After"
        :class="cn('w-20 shadow-lg relative', device.isMobile && 'w-10')"
        :style="`z-index: ${index};`"
        :key="index"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThirteenStore } from "~/store/module/thirteen";

const thirteenStore = useThirteenStore();
const device = useDevice();
</script>

<style scoped lang="scss"></style>
