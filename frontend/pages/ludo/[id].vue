<template>
  <div class="w-full h-dvh md:flex md:flex-row items-center justify-center gap-10">
    <!-- Board -->
    <div
      class="ludo-board md:mt-0 mt-10 aspect-square md:h-[85%] w-full h-fit md:w-fit grid grid-cols-11 grid-rows-11 md:gap-3 gap-1"
    >
      <SpecLudoCell v-for="route in ludo_routes" :key="route.index" :data="route" />
      <SpecLudoCellDestination
        v-for="route in ludo_destination"
        :key="route.index + route.color"
        :data="route"
      />
      <SpecLudoChess
        v-for="chess in chesses"
        :key="chess.x.toString() + chess.y.toString()"
        :chess="chess"
      />
      <SpecLudoModalWin v-if="winner" />

      <!-- Home Area -->
      <SpecLudoHomeArea v-for="i in 4" :index="i" :key="i" />

      <SpecLudoCup />
    </div>
    <div class="md:w-[400px] md:h-full">
      <SpecLudoRightSide />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SOCKET_EVENTS, ludo_destination, ludo_routes } from "~/constants";
import type { Socket } from "socket.io-client";
import { useLudoStore } from "~/store/module/ludo";
import type { Chess, LudoGame } from "~/types/game.ludo";
import type { ToastMessage } from "~/interfaces/message.interface";
const { $socket, $router } = useNuxtApp();
const route = useRoute();
const roomId = route.params.id;
const token_key = "ludo_token";
const ludoStore = useLudoStore();
const { chesses, winner } = storeToRefs(ludoStore);
onMounted(() => {
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.LUDO.JOIN, { id: roomId });
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.LUDO.DATA,
    (payload: LudoGame & { notValidRoom?: string }) => {
      console.log(payload);
      if (payload.hasOwnProperty("notValidRoom")) $router.push("/");
      if (payload.hasOwnProperty("id")) ludoStore.setIdRoom(payload.id);
      if (payload.hasOwnProperty("players")) ludoStore.setPlayers(payload.players);
      if (payload.hasOwnProperty("status")) ludoStore.setStatus(payload.status);
      if (payload.hasOwnProperty("host")) ludoStore.setHost(payload.host);
      if (payload.hasOwnProperty("turn")) ludoStore.setTurn(payload.turn);
      if (payload.hasOwnProperty("gameEndAt")) ludoStore.setGameEndAt(payload.gameEndAt);
      if (payload.hasOwnProperty("gameStartAt"))
        ludoStore.setGameStartAt(payload.gameStartAt);
      if (payload.hasOwnProperty("winner")) ludoStore.setWinner(payload.winner);
      if (payload.hasOwnProperty("chesses")) ludoStore.setChesses(payload.chesses);
      if (payload.hasOwnProperty("dice")) ludoStore.setDice(payload?.dice);
    }
  );
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.LUDO.USER_TOKEN,
    ({ token }: { token: string }) => {
      localStorage.setItem(token_key, token);
    }
  );
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.LUDO.MOVABLE_CHESS,
    ({ chesses }: { chesses: Chess[] }) => {
      ludoStore.setMovableChess(chesses || []);
    }
  );
  ($socket as Socket).on(SOCKET_EVENTS.TOAST_MESSAGE, (toastMessage: ToastMessage) => {
    showToast(toastMessage.message, toastMessage.type);
  });
  let token = localStorage.getItem(token_key);
  if (token) {
    ($socket as Socket).emit(SOCKET_EVENTS.GAME.LUDO.RE_CONNECT, {
      roomId,
      token,
    });
  }
  onBeforeUnmount(() => {
    ($socket as Socket).off(SOCKET_EVENTS.GAME.LUDO.DATA);
    ($socket as Socket).off(SOCKET_EVENTS.GAME.THIRTEEN.USER_TOKEN);
    ($socket as Socket).off(SOCKET_EVENTS.GAME.LUDO.MOVABLE_CHESS);
    ($socket as Socket).off(SOCKET_EVENTS.TOAST_MESSAGE);
  });
});

definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>

<style scoped></style>
