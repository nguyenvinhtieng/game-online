<template>
  <div
    :class="`flex gap-3 items-center justify-center ${
      props.direction == 'vertical' && 'flex-col'
    }`"
  >
    <div
      :class="
        cn(
          'flex items-center justify-center md:w-20 md:h-20 w-10 h-10 border border-primary rounded-xl text-primary border-dashed md:hover:bg-primary transition-all cursor-pointer hover:text-white hover:border-white',
          device.isMobile && 'w-8 h-8 md:w-8 md:h-8'
        )
      "
      @click="choosePosition"
    >
      <PlusIcon />
    </div>
    <p class="font-normal text-xs md:text-sm italic text-neutral-500">Ghế trống</p>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { PlusIcon } from "lucide-vue-next";
import { useThirteenStore, type Player } from "~/store/module/thirteen";
import { useUserStore } from "~/store/module/user";
import { SOCKET_EVENTS } from "~/constants";
const device = useDevice();
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
