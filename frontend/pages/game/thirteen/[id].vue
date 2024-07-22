<template>
  <div
    :class="
      cn(
        'w-full h-dvh relative flex flex-col py-2 md:py-5 gap-2 md:gap-5',
        device.isMobile && 'py-2 gap-2 md:py-2 md:gap-2'
      )
    "
  >
    <SpecThirteenHeader />
    <BaseConfetti
      v-if="thirteenStore.getWinner && thirteenStore.getStatus == 'finished'"
    />
    <SpecThirteenModalWin
      v-if="thirteenStore.getWinner && thirteenStore.getStatus == 'finished'"
    />
    <div
      :class="
        cn(
          'flex-1 overflow-hidden relative flex flex-col md:gap-5 gap-2',
          device.isMobile && 'gap-2 md:gap-2'
        )
      "
    >
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
      <div
        :class="
          cn(
            'flex justify-center items-center flex-1 md:gap-5 gap-2',
            device.isMobile && 'gap-2 md:gap-2'
          )
        "
      >
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
          :class="
            cn(
              'flex-1 relative bg-primary-900 rounded-[100px] h-full border-[20px] border-primary-800',
              device.isMobile && 'border-[10px] rounded-3xl'
            )
          "
        >
          <SpecThirteenReadyButton />
          <SpecThirteenPositionNumber
            :positions="sortedPlayers.map((i) => i.position)"
            v-if="thirteenStore.getStatus == 'waiting'"
          />
          <SpecThirteenCards
            v-if="thirteenStore.getStatus == 'playing'"
            :players="sortedPlayers.map((i) => i.player)"
          />
          <SpecThirteenCurrentCards
            v-if="
              thirteenStore.getStatus != 'waiting' && thirteenStore.getPrevTurn.length > 0
            "
          />
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
  </div>
</template>
<script setup lang="ts">
import { SOCKET_EVENTS } from "~/constants";
const route = useRoute();
const roomId = route.params.id;
const { $socket, $router } = useNuxtApp();
const device = useDevice();
import { computed } from "vue";
import {
  useThirteenStore,
  type Player,
  type GameData,
type UserStatus,
} from "~/store/module/thirteen";
import type { Socket } from "socket.io-client";
import type { ToastMessage } from "~/interfaces/message.interface";

const thirteenStore = useThirteenStore();
const token_key = 'THIRTEEN:GAME:TOKEN'
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

onMounted(() => {
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.JOIN, { id: roomId });
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.THIRTEEN.DATA,
    (payload: GameData & { notValidRoom?: string }) => {
      if (payload.hasOwnProperty('notValidRoom')) $router.push('/');
      if (payload.hasOwnProperty('id')) thirteenStore.setIdRoom(payload.id);
      if (payload.hasOwnProperty('host')) thirteenStore.setHost(payload.host);
      if (payload.hasOwnProperty('status')) thirteenStore.setStatus(payload.status);
      if (payload.hasOwnProperty('gameStartAt')) thirteenStore.setGameStartAt(payload.gameStartAt)
      if (payload.hasOwnProperty('turnTimeout')) thirteenStore.setTurnTimeout(payload.turnTimeout)
      if (payload.hasOwnProperty('turn')) thirteenStore.setTurn(payload.turn)
      if (payload.hasOwnProperty('settings')) thirteenStore.setSettings(payload.settings)
      if (payload.hasOwnProperty('prevTurn')) thirteenStore.setPrevTurn(payload.prevTurn)
      if (payload.hasOwnProperty('winner')) thirteenStore.setWinner(payload.winner)
      if (payload.hasOwnProperty('winHistory')) thirteenStore.setWinHistory(payload.winHistory)
      if (payload.hasOwnProperty('players')) {
        thirteenStore.setPlayers(payload.players)
        let me = payload.players.find(player => player.id == ($socket as Socket).id)
        me && thirteenStore.setMe(me)
      };
    }
  );
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.THIRTEEN.USER_TOKEN,
    ({token}: {token:string}) => {
      localStorage.setItem(token_key, token)
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
        if(player.id == ($socket as Socket).id) {
          thirteenStore.setMe(player)
          thirteenStore.updateMyCards(player.cards);
        } else {
          thirteenStore.setCardUser(player.id, player.cards)
        }
      })
    }
  );
  ($socket as Socket).on(
    SOCKET_EVENTS.TOAST_MESSAGE,
    (toastMessage: ToastMessage) => {
      showToast(toastMessage.message, toastMessage.type)
    }
  );
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME_NOTIFICATION,
    ({message}: {message: string}) => {
      showGameNotification(message)
    }
  );

  let token = localStorage.getItem(token_key)
  if(token) {
    ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.RE_CONNECT, {roomId, token})
  }
});

onUnmounted(() => {
  ($socket as Socket).off(SOCKET_EVENTS.GAME.THIRTEEN.DATA);
  ($socket as Socket).off(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS);
  ($socket as Socket).off(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_CARD);
  ($socket as Socket).off(SOCKET_EVENTS.TOAST_MESSAGE);
  ($socket as Socket).off(SOCKET_EVENTS.GAME_NOTIFICATION);
});


definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>

<!-- ♦ Diamonds : Chất rô
♥ Hearts : Chất cơ
♣ Clubs : Chất nhép
♠ Spade : Chất bích -->
