<template>
  <div
    v-if="thirteenStore.getMe && Object.keys(thirteenStore.getPlayers).length > 1"
    @click="toggleReady"
    class="p-3 bg-blue-200 cursor-pointer hover:bg-blue-100"
  >
    <span v-if="thirteenStore.getMe.status == 'unready'">Sẵn sàng</span>
    <span v-else>Huỷ sẵn sàng</span>
  </div>
</template>

<script setup lang="ts">
import { debounce } from "lodash";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useThirteenStore, type UserStatus } from "~/store/module/thirteen";

const thirteenStore = useThirteenStore();
const { $socket } = useNuxtApp();
const toggleReady = debounce(() => {
  const status: UserStatus = thirteenStore.getMe?.status == "unready" ? 'ready' : 'unready';
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS, {
    roomId: thirteenStore.getId,
    status: status,
  });
}, 300);
</script>

<style scoped lang="scss"></style>
