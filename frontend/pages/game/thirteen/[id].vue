<template>
  <div class="w-full h-full relative">
    <div
      v-for="(player, index) in sortedPlayers"
      :key="index"
      :class="positionClass[index]"
    >
      <SpecThirteenWaitingUser
        v-if="thirteenStore.getStatus == 'waiting'"
        :player="player"
      />
      <SpecThirteenPlayingUser
        v-if="thirteenStore.getStatus == 'playing'"
        :player="player"
        :wrapperClass="wrapperClass[index]"
      />
    </div>

    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      v-if="thirteenStore.getStatus == 'waiting'"
    >
      <SpecThirteenReadyButton />
      <SpecThirteenCountDownStart v-if="thirteenStore.getGameStartAt" />
    </div>

    <!-- My score -->
    <div class="absolute top-1 right-1 text-lg font-semibold" v-if="thirteenStore.me">
      Điểm của tôi: {{ thirteenStore.me?.score || 0 }} điểm
    </div>
  </div>
</template>
<script setup lang="ts">
import { SOCKET_EVENTS } from "~/constants";
const route = useRoute();
const roomId = route.params.id;
const { $socket, $router } = useNuxtApp();
import { computed } from "vue";
import {
  useThirteenStore,
  type Player,
  type Status,
  type GameData,
  type PlayerList,
} from "~/store/module/thirteen";
import type { Socket } from "socket.io-client";
const thirteenStore = useThirteenStore();
($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.JOIN, { id: roomId });

($socket as Socket).on(
  SOCKET_EVENTS.GAME.THIRTEEN.DATA,
  (payload: GameData) => {
    if(Object.keys(payload).length == 0 ) $router.push('/');
    const {id, players, host, status, gameStartAt} = payload
    if (id) thirteenStore.setIdRoom(id);
    if (players) {
      thirteenStore.setPlayers(players)
      let me = undefined;
      Object.keys(players).map(key=>{
        if(players[key].id == ($socket as Socket).id) me = players[key];
      })
      thirteenStore.setMe(me)
    };
    if (host) thirteenStore.setHost(host);
    if (status) thirteenStore.setStatus(status);
    if(gameStartAt) thirteenStore.setGameStartAt(new Date(gameStartAt))
  }
);

// On Game data change
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
const wrapperClass = [
  "flex gap-1 flex-col justify-center items-center", //Top
  "flex gap-1 justify-center items-center", //Left
  "flex gap-1 flex-col-reverse justify-center items-center", //Bottom
  "flex gap-1 flex-row-reverse justify-center items-center", //Left
]

definePageMeta({
  layout: "play-game",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>

<!-- ♦ Diamonds : Chất rô
♥ Hearts : Chất cơ
♣ Clubs : Chất nhép
♠ Spade : Chất bích -->
