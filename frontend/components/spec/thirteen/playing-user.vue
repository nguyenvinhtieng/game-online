<template>
  <div v-if="player.player" :class="wrapperClass">
    <SpecThirteenUser
      v-if="player.player.id !== ($socket as Socket).id"
      :player="player.player"
    />

    <div class="relative w-fit" v-if="player.player.id !== ($socket as Socket).id">
      <img src="/images/card/after.png" alt="" class="max-w-16 object-cover" />
      <span
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-6 h-6 text-sm bg-white/70 rounded-full font-semibold"
        >{{ player.player.cards.length }}</span
      >
    </div>

    <div
      v-if="player.player.id === ($socket as Socket).id"
      class="flex gap-[2px] justify-center"
    >
      <div
        v-for="card in player.player.cards"
        :key="card.value + card.suit"
        class="max-w-32"
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
import type { Player } from "~/store/module/thirteen";
const { $socket } = useNuxtApp();
const props = defineProps<{
  player: { player: Player; position: number };
  wrapperClass: string;
}>();
const { player, wrapperClass } = props;
</script>

<style scoped lang="scss"></style>
