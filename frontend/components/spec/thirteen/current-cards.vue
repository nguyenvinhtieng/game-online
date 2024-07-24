<template>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-1/2">
    <div
      :class="
        cn('relative justify-center h-[110px] max-w-full', device.isMobile && 'h-[55px]')
      "
      :style="`width: ${
        (prevTurn[prevTurn.length - 1].cards.length - 1) * (device.isMobile ? 15 : 30) +
        (device.isMobile ? 40 : 80)
      }px;`"
    >
      <img
        v-for="(card, index) in prevTurn[prevTurn.length - 1].cards"
        :src="`/images/card/meow/${card.value}_${card.suit}.svg`"
        :alt="`Card ${card.value} ${card.suit}`"
        :class="cn('w-20 shadow-lg absolute top-0', device.isMobile && 'w-10')"
        :style="`z-index: ${index}; left: ${index * 30}px;`"
        :key="index"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThirteenStore } from "~/store/module/thirteen";

const thirteenStore = useThirteenStore();
const device = useDevice();

const { prevTurn } = storeToRefs(thirteenStore);
</script>

<style scoped lang="scss"></style>
