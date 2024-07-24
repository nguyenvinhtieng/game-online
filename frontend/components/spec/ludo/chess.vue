<template>
  <div
    :class="cn('w-full h-full relative')"
    :style="{ 'grid-row-start': props.chess.y, 'grid-column-start': props.chess.x }"
  >
    <div
      :class="
        cn(
          'flex items-center justify-center relative',
          isMovableChess && 'cursor-pointer hover:opacity-40'
        )
      "
      @click="moveChess"
    >
      <IconCat :fill="hexColor" :width="40" :height="40" />
      <div
        v-if="isMovableChess"
        class="absolute top-0 left-1/2 !-translate-x-1/2 flex items-center justify-center"
      >
        <div
          class="w-0 h-0 border-l-8 border-l-transparent border-t-8 border-r-8 border-r-transparent animate-bounce"
          :style="{ 'border-top-color': hexColor }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants/socket-event";
import { useLudoStore } from "~/store/module/ludo";
import type { Chess, Player } from "~/types/game.ludo";
const ludoStore = useLudoStore();
const { id, movableChess } = storeToRefs(ludoStore);

const props = defineProps<{ chess: Chess }>();
const { $socket } = useNuxtApp();
const isMovableChess = computed(() => {
  return movableChess.value.some(
    (chess: Chess) => chess.x === props.chess.x && chess.y === props.chess.y
  );
});
function moveChess() {
  if (!isMovableChess) return;
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.LUDO.MOVE_CHESS, {
    chess: props.chess,
    id: id.value,
  });
}
const hexColor = computed(() => {
  switch (props.chess.color) {
    case "red":
      return "#FF2F2F";
    case "blue":
      return "#2F8FFF";
    case "green":
      return "#2FFF50";
    case "yellow":
      return "#FFEA2F";
    default:
      return "#FF2F2F";
  }
});
</script>

<style scoped lang="scss"></style>
