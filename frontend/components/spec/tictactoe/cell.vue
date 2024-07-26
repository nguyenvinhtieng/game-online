<template>
  <div
    :class="
      cn(
        'border border-neutral-100 bg-white cursor-not-allowed',
        !type && status == 'playing' && 'hover:bg-blue-100 cursor-pointer',
        winCell
      )
    "
    @click="handleClick"
  >
    <CircleIcon
      width="100%"
      height="100%"
      class="text-blue-500"
      v-if="type == PlayerTypeEnum.O"
    />
    <XIcon
      width="100%"
      height="100%"
      class="text-red-500"
      v-else-if="type == PlayerTypeEnum.X"
    />
  </div>
</template>

<script setup lang="ts">
import { XIcon, CircleIcon } from "lucide-vue-next";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useTictactoeStore } from "~/store/module/tictactoe";
import { PlayerTypeEnum, type Player, type TicTacToeMove, type TicTacToePosition } from "~/types/game.tictactoe";
const props = defineProps<{
  position?: TicTacToePosition;
}>();
const { $socket } = useNuxtApp();
const ticTacToeStore = useTictactoeStore();
const {moves, players, id, winner, winnerRoute, status} = storeToRefs(ticTacToeStore);
const type = computed(() => {
  const m = moves.value.find((m: TicTacToeMove) => m.position === props.position);
  if (!m) return undefined;
  return players.value.find((p: Player) => p.id === m.id)?.position;
});
const handleClick = () => {
  if (type.value || ticTacToeStore.status !== 'playing') return;
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.TICTACTOE.TIC, {
    roomId: id.value,
    position: props.position,
  });
}

const winCell = computed(()=> {
  if (winnerRoute.value.length == 0 || !props.position) return '';
  const isWinCell = winnerRoute.value.includes(props.position);
  if(!isWinCell) return '';
  return players.value.find((p: Player) => p.id === winner?.value)?.position === PlayerTypeEnum.X ? 'pulse-red' : 'pulse-blue';
})
</script>

<style scoped lang="scss"></style>
