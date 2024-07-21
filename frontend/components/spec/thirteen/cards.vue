<template>
  <!-- TOP -->
  <div
    class="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center"
    v-if="players[0] && players[0]?.cards?.length"
  >
    <SpecThirteenUserCard position="right" :player="players[0]" />
  </div>
  <!-- LEFT -->
  <div
    class="absolute top-1/2 left-0 -translate-y-1/2 flex items-center justify-center"
    v-if="players[1] && players[1]?.cards?.length"
  >
    <SpecThirteenUserCard position="right" :player="players[1]" />
  </div>
  <!-- RIGHT -->
  <div
    class="absolute top-1/2 right-0 -translate-y-1/2 flex items-center justify-center"
    v-if="players[3] && players[3]?.cards?.length"
  >
    <SpecThirteenUserCard position="left" :player="players[3]" />
  </div>
  <!-- BOTTOM -->
  <div
    class="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-full"
    v-if="players[2] && players[2]?.cards?.length"
  >
    <SpecThirteenMyCard v-if="thirteenStore.getMe?.cards" />
    <SpecThirteenUserCard v-else position="right" :player="players[2]" />
  </div>
</template>

<script setup lang="ts">
import { UserRoundPlusIcon } from "lucide-vue-next";
const { $socket } = useNuxtApp();
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useThirteenStore, type Player } from "~/store/module/thirteen";
import { useUserStore } from "~/store/module/user";
const props = defineProps<{
  players: (Player | undefined)[]
}>();
const userStore = useUserStore();
const thirteenStore = useThirteenStore();
</script>

<style scoped lang="scss"></style>
