<template>
  <div
    :class="
      cn(
        'col-span-4 row-span-4 rounded-2xl gap-4 bg-opacity-50 pointer-events-none',
        indexToPosition(props.index),
        gameStatus == 'waiting' &&
          'cursor-pointer hover:bg-opacity-80 bg-opacity-100 pointer-events-auto',
        ludoStore.getPlayerByPosition(props.index) && '!bg-opacity-10 pointer-events-none'
      )
    "
    @click="handleChoosePosition(props.index)"
  ></div>
</template>
<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { storeToRefs } from "pinia";
import { useLudoStore } from "~/store/module/ludo";
import { useUserStore } from "~/store/module/user";

const { $socket } = useNuxtApp();
const route = useRoute();
const roomId = route.params.id;
const ludoStore = useLudoStore();
const userStore = useUserStore();
const { status: gameStatus } = storeToRefs(ludoStore);
const { name } = storeToRefs(userStore);
const props = defineProps<{ index: number }>();
const handleChoosePosition = (index: number) => {
  if (gameStatus.value === "waiting") {
    ($socket as Socket).emit(SOCKET_EVENTS.GAME.LUDO.PICK_POSITION, {
      id: roomId,
      position: index,
      name: name.value,
    });
  }
};
const indexToPosition = (index: number) => {
  switch (index) {
    case 1:
      return "col-start-1 row-start-1 bg-red-500";
    case 2:
      return "col-start-8 row-start-1 bg-blue-500";
    case 3:
      return "col-start-8 row-start-8 bg-green-500";
    case 4:
      return "col-start-1 row-start-8 bg-yellow-500";
    default:
      return "col-start-1 row-start-1 bg-red-500";
  }
};
</script>
