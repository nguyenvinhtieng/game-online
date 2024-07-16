<template>
  <div
    @click="choosePosition"
    class="flex flex-col justify-center items-center hover:bg-neutral-200 bg-neutral-100 p-3 cursor-pointer"
  >
    <span>Chọn Ghế {{ props.position + 1 }}</span>
    <UserRoundPlusIcon />
  </div>
</template>

<script setup lang="ts">
import { UserRoundPlusIcon } from "lucide-vue-next";
const props = defineProps(["position"]);
const { $socket } = useNuxtApp();
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useThirteenStore } from "~/store/module/thirteen";
import { useUserStore } from "~/store/module/user";
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
