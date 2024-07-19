<template>
  <div class="w-full h-dvh relative flex flex-col py-5 gap-5">
    <header
      class="flex w-full gap-3 justify-start md:justify-center items-center flex-wrap md:flex-nowrap"
    >
      <div
        class="flex md:justify-center justify-start items-center gap-3 w-full md:w-fit"
      >
        <button
          class="w-12 h-12 rounded-full bg-[##FAFAFA] hover:bg-neutral-100 active:bg-neutral-100 transition-all flex items-center justify-center"
          @click="() => $router.back()"
        >
          <ArrowLeft class="w-6 h-6" />
        </button>
        <BaseButton
          variant="default"
          color="primary"
          shape="square"
          size="md"
          @click="() => copyToClipboard('123')"
        >
          <template v-slot:child>
            <span class="font-normal">ID Phòng: <strong class="ml-2">#123</strong></span>
          </template>
        </BaseButton>
      </div>
      <div class="flex-1 flex items-center justify-end gap-3">
        <p>Điểm thắng:</p>
        <p class="text-primary text-2xl font-extrabold">500</p>
      </div>
    </header>

    <div class="flex-1 overflow-hidden relative flex flex-col gap-5">
      <div class="flex justify-center">
        <SpecThirteenPlayer
          v-if="sortedPlayers[0].player"
          :player="sortedPlayers[0].player"
        />
        <SpecThirteenAvailableChair
          v-else-if="thirteenStore.getStatus == 'waiting'"
          :position="sortedPlayers[0].position"
        />
      </div>
      <div class="flex justify-center items-center flex-1 gap-5">
        <div
          :class="`flex justify-center ${
            thirteenStore.getStatus != 'waiting' && sortedPlayers[3].player
          } && 'w-20'`"
        >
          <SpecThirteenPlayer
            v-if="sortedPlayers[1].player"
            :player="sortedPlayers[1].player"
            direction="vertical"
          />
          <SpecThirteenAvailableChair
            v-else-if="thirteenStore.getStatus == 'waiting'"
            :position="sortedPlayers[1].position"
            direction="vertical"
          />
        </div>
        <!-- Board -->
        <div
          class="flex-1 relative bg-primary-900 rounded-[100px] h-full border-[20px] border-primary-800"
        >
          <SpecThirteenReadyButton />
        </div>
        <div
          :class="`flex justify-center ${
            thirteenStore.getStatus != 'waiting' && sortedPlayers[1].player
          } && 'w-20'`"
        >
          <SpecThirteenPlayer
            v-if="sortedPlayers[3].player"
            :player="sortedPlayers[3].player"
            direction="vertical"
          />
          <SpecThirteenAvailableChair
            v-else-if="thirteenStore.getStatus == 'waiting'"
            :position="sortedPlayers[3].position"
            direction="vertical"
          />
        </div>
      </div>
      <div class="flex justify-center">
        <SpecThirteenPlayer
          v-if="sortedPlayers[2].player"
          :player="sortedPlayers[2].player"
        />
        <SpecThirteenAvailableChair
          v-else-if="thirteenStore.getStatus == 'waiting'"
          :position="sortedPlayers[2].position"
        />
      </div>
    </div>
    <!-- <div
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

    <div class="absolute top-1 right-1 text-lg font-semibold" v-if="thirteenStore.me">
      Điểm của tôi: {{ thirteenStore.me?.score || 0 }} điểm
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { SOCKET_EVENTS } from "~/constants";
import {ArrowLeft } from "lucide-vue-next";
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
import copyToClipboard from "~/utils/copy-to-clipboard";

const thirteenStore = useThirteenStore();
($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.JOIN, { id: roomId });

($socket as Socket).on(
  SOCKET_EVENTS.GAME.THIRTEEN.DATA,
  (payload: GameData & { notValidRoom: string }) => {
    if (payload.hasOwnProperty('notValidRoom')) $router.push('/');
    if (payload.hasOwnProperty('id')) thirteenStore.setIdRoom(payload.id);
    if (payload.hasOwnProperty('host')) thirteenStore.setHost(payload.host);
    if (payload.hasOwnProperty('status')) thirteenStore.setStatus(payload.status);
    if (payload.hasOwnProperty('gameStartAt')) thirteenStore.setGameStartAt(payload.gameStartAt)
    if (payload.hasOwnProperty('turn')) thirteenStore.setTurn(payload.turn)
    if (payload.hasOwnProperty('settings')) thirteenStore.setSettings(payload.settings)
    if (payload.hasOwnProperty('players')) {
      thirteenStore.setPlayers(payload.players)
      let me = payload.players.find(player => player.id == ($socket as Socket).id)
      me && thirteenStore.setMe(me)
    };
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
  layout: "game",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>

<!-- ♦ Diamonds : Chất rô
♥ Hearts : Chất cơ
♣ Clubs : Chất nhép
♠ Spade : Chất bích -->
