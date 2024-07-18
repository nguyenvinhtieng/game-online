<template>
  <div class="w-full h-full relative">
    <div
      v-for="(data, index) in sortedPlayers"
      :key="index"
      :class="positionClass[index]"
    >
      <SpecThirteenWaitingUser v-if="thirteenStore.getStatus == 'waiting'" :data="data" />
      <SpecThirteenPlayingUser
        v-if="thirteenStore.getStatus == 'playing'"
        :player="data.player"
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
  type GameData,
type UserStatus,
} from "~/store/module/thirteen";
import type { Socket } from "socket.io-client";
const thirteenStore = useThirteenStore();
($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.JOIN, { id: roomId });

($socket as Socket).on(
  SOCKET_EVENTS.GAME.THIRTEEN.DATA,
  (payload: GameData & { notValidRoom: string }) => {
    console.log('Received data', payload)
    const {id, players, host, status, gameStartAt, turn} = payload
    if (payload.hasOwnProperty('notValidRoom')) $router.push('/');
    if (payload.hasOwnProperty('id')) thirteenStore.setIdRoom(id);
    if (payload.hasOwnProperty('players')) {
      thirteenStore.setPlayers(players)
      let me = players.find(player => player.id == ($socket as Socket).id)
      me && thirteenStore.setMe(me)
    };
    if (payload.hasOwnProperty('host')) thirteenStore.setHost(host);
    if (payload.hasOwnProperty('status')) thirteenStore.setStatus(status);
    if (payload.hasOwnProperty('gameStartAt')) thirteenStore.setGameStartAt(gameStartAt)
    if (payload.hasOwnProperty('turn')) thirteenStore.setTurn(turn)
  }
);
($socket as Socket).on(
  SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS,
  (payload: {id: string, status: UserStatus}) => {
    thirteenStore.setPlayerStatus(payload.id, payload.status)
  }
);
($socket as Socket).on(
  SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_CARD,
  (players: Player[]) => {
    players.forEach(player => {
      thirteenStore.setCardUser(player.id, player.cards)
      if(player.id == ($socket as Socket).id) thirteenStore.setMe(player)
    })
  }
);

// On Game data change
const players = computed(() => thirteenStore.getPlayers);
const socketId = ($socket as Socket).id;
const sortedPlayers = computed(() => {
  let playerSorted: { player?: Player; position: number }[] = [];
  let me = players.value.find((player) => player.id === socketId);
  if (me) {
    const adjustedIndex = (index: number) => (index + 4) % 4;
    const getUserAtPosition = (position: number) => {
      return  players.value.find((player) => player.position == position)
    }
    playerSorted = [
      {
        player: getUserAtPosition(adjustedIndex(me.position - 2)),
        position: adjustedIndex(me.position - 2),
      },
      {
        player: getUserAtPosition(adjustedIndex(me.position - 1)),
        position: adjustedIndex(me.position - 1),
      },
      { player: me, position: me.position },
      {
        player: getUserAtPosition(adjustedIndex(me.position + 1)),
        position: adjustedIndex(me.position + 1),
      },
    ];
  } else {
    playerSorted = [
      { player: players.value.find((player) => player.position == 0), position: 0 },
      { player: players.value.find((player) => player.position == 1), position: 1 },
      { player: players.value.find((player) => player.position == 2), position: 2 },
      { player: players.value.find((player) => player.position == 3), position: 3 },
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
