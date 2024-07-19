<template>
  <div
    :class="`flex gap-3 items-center justify-center ${
      props.direction == 'vertical' && 'flex-col'
    }`"
  >
    <div
      class="flex items-center justify-center w-20 h-20 border border-primary rounded-xl text-primary border-dashed hover:bg-primary transition-all cursor-pointer hover:text-white hover:border-white"
      @click="choosePosition"
    >
      <PlusIcon />
    </div>
    <p class="font-normal text-sm italic text-neutral-500">Available</p>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { PlusIcon } from "lucide-vue-next";
import { useThirteenStore, type Player } from "~/store/module/thirteen";
import { useUserStore } from "~/store/module/user";
import { SOCKET_EVENTS } from "~/constants";

const { $socket } = useNuxtApp();
const props = defineProps<{
  direction?: 'vertical' | 'horizontal';
  position: number;
}>();
const userStore = useUserStore();
const thirteenStore = useThirteenStore();
function choosePosition() {
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.PICK_POSITION, {
    id: thirteenStore.getId,
    position: props.position,
    name: userStore.getName,
  });
}
</script>

<style scoped lang="scss"></style>
