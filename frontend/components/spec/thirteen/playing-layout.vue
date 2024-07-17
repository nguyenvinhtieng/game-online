<template>
  <div
    v-for="(player, index) in sortedPlayers"
    :key="index"
    :class="positionClass[index]"
  >
    <SpecThirteenUser v-if="player.player" :player="player.player" />
    <SpecThirteenChoosePosition v-else :position="player.position" />
  </div>
  <!-- Ready -->
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <SpecThirteenReadyButton />
    <!-- Countdown start at -->
    <SpecThirteenCountDownStart v-if="thirteenStore.getGameStartAt" />
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { computed } from "vue";
import { useThirteenStore, type Player } from "~/store/module/thirteen";
const thirteenStore = useThirteenStore();
const { $socket } = useNuxtApp();

const players = computed(() => thirteenStore.getPlayers);
const socketId = ($socket as Socket).id;
const sortedPlayers = computed(() => {
  let playerSorted: { player: Player; position: number }[] = [];
  let myIndex = -1;

  Object.keys(players.value).some((key) => {
    if (players.value[key].id === socketId) {
      myIndex = Number(key);
      return true;
    }
    return false;
  });
  if (myIndex !== -1) {
    const adjustedIndex = (index: number) => (index + 4) % 4;

    playerSorted = [
      {
        player: players.value[adjustedIndex(myIndex - 2)],
        position: adjustedIndex(myIndex - 2),
      },
      {
        player: players.value[adjustedIndex(myIndex - 1)],
        position: adjustedIndex(myIndex - 1),
      },
      { player: players.value[myIndex], position: myIndex },
      {
        player: players.value[adjustedIndex(myIndex + 1)],
        position: adjustedIndex(myIndex + 1),
      },
    ];
  } else {
    playerSorted = [
      { player: players.value[0], position: 0 },
      { player: players.value[1], position: 1 },
      { player: players.value[2], position: 2 },
      { player: players.value[3], position: 3 },
    ];
  }

  return playerSorted;
});



const positionClass = [
  "absolute top-1 left-1/2 -translate-x-1/2 justify-center flex flex-col items-center", // Top
  "absolute top-1/2 left-1 -translate-y-1/2 justify-center flex flex-col items-center gap-2 md:flex-row", // Left
  "absolute bottom-1 left-1 right-1 flex gap-[2px] justify-center", // Bottom
  "absolute top-1/2 right-1 -translate-y-1/2 justify-center flex flex-col items-center gap-2 md:flex-row", // Right
];
</script>

<style scoped lang="scss"></style>
