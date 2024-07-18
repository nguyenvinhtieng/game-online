<template>
  <div
    v-if="player"
    :class="
      wrapperClass + `${thirteenStore.getTurn == player.id ? ' p-5 bg-blue-100' : ''}`
    "
  >
    <SpecThirteenUser v-if="player.id !== ($socket as Socket).id" :player="player" />
    <div
      class="relative w-fit"
      v-if="player.id !== ($socket as Socket).id && player.cards.length > 0"
    >
      <img src="/images/card/after.png" alt="" class="max-w-16 object-cover" />
      <span
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-6 h-6 text-sm bg-white/70 rounded-full font-semibold"
        >{{ player.cards.length }}</span
      >
    </div>

    <!-- Case me -->
    <div
      v-if="player.id === ($socket as Socket).id"
      class="flex gap-[2px] justify-center"
    >
      <div
        v-for="(card, index) in thirteenStore.getMe?.cards"
        :key="card.value + card.suit"
        :class="`max-w-32 relative ${card.isSelected ? '-top-3' : ''}`"
        @click="toggleCardSelected(index)"
      >
        <img
          :src="`/images/card/${card.value}_${card.suit}.png`"
          alt=""
          class="w-full object-cover"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { useThirteenStore, type Player } from "~/store/module/thirteen";
const { $socket } = useNuxtApp();
const props = defineProps<{
  player?: Player;
  wrapperClass: string;
}>();
const { player, wrapperClass } = props;
const thirteenStore = useThirteenStore()
function toggleCardSelected(index: number) {
  thirteenStore.toggleCardSelected(index);
}
</script>

<style scoped lang="scss"></style>
