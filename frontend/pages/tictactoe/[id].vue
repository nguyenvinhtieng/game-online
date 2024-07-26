<template>
  <div class="flex items-center justify-center flex-col gap-1 h-dvh">
    <SpecTictactoeHeader />
    <!-- Ready button -->
    <SpecTictactoeReadyButton />
    <div v-if="status == 'playing'" class="md:block hidden">
      <CircleIcon
        :width="40"
        :height="40"
        class="text-blue-500"
        v-if="players.find((p) => p.id == turn).position == PlayerTypeEnum.O"
      />
      <XIcon :width="40" :height="40" class="text-red-500" v-else />
    </div>
    <div
      class="flex-1 w-full overflow-hidden flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10"
    >
      <SpecTictactoePlayer :player="playersSorted[0]" />
      <div
        class="md:h-[80%] h-fit w-full max-w-[800px] md:w-fit aspect-square grid grid-cols-3 grid-rows-3 relative"
      >
        <SpecTictactoeCell v-for="i in cell" :key="i" :position="i" />
      </div>
      <SpecTictactoePlayer :player="playersSorted[1]" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { CircleIcon, XIcon } from "lucide-vue-next";
import { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants/socket-event";
import type { ToastMessage } from "~/interfaces/message.interface";
import { useTictactoeStore } from "~/store/module/tictactoe";
import { useUserStore } from "~/store/module/user";
import { type Player, PlayerTypeEnum } from "~/types/game.tictactoe";
import type { TicTacToeGame, TicTacToePosition } from "~/types/game.tictactoe";
const { $socket, $router } = useNuxtApp();
const tictactoeStore = useTictactoeStore();
const userStore = useUserStore();
const { players, status, turn } = storeToRefs(tictactoeStore);
const { name } = storeToRefs(userStore);
const route = useRoute();
const roomId = route.params.id;
const cell: TicTacToePosition[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const token_key = "tictactoe_token";
const playersSorted = computed(() => {
  let playerO = players.value.find((p: Player) => p.position === PlayerTypeEnum.O);
  let playerX = players.value.find((p: Player) => p.position === PlayerTypeEnum.X);
  return [playerO, playerX];
});
onMounted(() => {
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.TICTACTOE.JOIN, {
    id: roomId,
    name: name.value,
  });
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.TICTACTOE.DATA,
    (payload: TicTacToeGame & { notValidRoom?: string }) => {
      if (payload.hasOwnProperty("notValidRoom")) $router.push("/");
      if (payload.hasOwnProperty("id")) tictactoeStore.setIdRoom(payload.id);
      if (payload.hasOwnProperty("players")) tictactoeStore.setPlayers(payload.players);
      if (payload.hasOwnProperty("status")) tictactoeStore.setStatus(payload.status);
      if (payload.hasOwnProperty("host")) tictactoeStore.setHost(payload.host);
      if (payload.hasOwnProperty("turn")) tictactoeStore.setTurn(payload.turn);
      if (payload.hasOwnProperty("gameStartAt"))
        tictactoeStore.setGameStartAt(payload.gameStartAt);
      if (payload.hasOwnProperty("winner")) tictactoeStore.setWinner(payload.winner);
      if (payload.hasOwnProperty("winnerRoute"))
        tictactoeStore.setWinnerRoute(payload.winnerRoute);
      if (payload.hasOwnProperty("moves")) tictactoeStore.setMoves(payload.moves);
    }
  );
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.TICTACTOE.USER_TOKEN,
    ({ token }: { token: string }) => {
      localStorage.setItem(token_key, token);
    }
  );

  ($socket as Socket).on(SOCKET_EVENTS.TOAST_MESSAGE, (toastMessage: ToastMessage) => {
    showToast(toastMessage.message, toastMessage.type);
  });
  let token = localStorage.getItem(token_key);
  if (token) {
    ($socket as Socket).emit(SOCKET_EVENTS.GAME.TICTACTOE.RE_CONNECT, { roomId, token });
  }
});
onUnmounted(() => {
  ($socket as Socket).off(SOCKET_EVENTS.GAME.TICTACTOE.DATA);
  ($socket as Socket).off(SOCKET_EVENTS.GAME.TICTACTOE.USER_TOKEN);
  ($socket as Socket).off(SOCKET_EVENTS.TOAST_MESSAGE);
});
definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
