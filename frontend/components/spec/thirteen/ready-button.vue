<template>
  <div
    v-if="
      thirteenStore.getStatus == 'waiting' &&
      thirteenStore.getMe &&
      Object.keys(thirteenStore.getPlayers).length > 1
    "
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  >
    <BaseButton
      variant="outline"
      color="primary"
      shape="square"
      size="md"
      @click="toggleReady"
    >
      <template v-slot:startIcon>
        <PlayIcon v-if="thirteenStore.getMe?.status == 'unready'" :size="16" />
        <XIcon v-else :size="16" />
      </template>
      <template v-slot:child>
        <div>
          <p v-if="thirteenStore.getMe?.status == 'unready'">Sẵn sàng</p>
          <p v-else>Huỷ sẵn sàng</p>
          <div v-if="thirteenStore.getGameStartAt" class="text-xs">
            <SpecThirteenCountDownStart />
          </div>
        </div>
      </template>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useThirteenStore, type UserStatus } from "~/store/module/thirteen";
import { PlayIcon, XIcon } from "lucide-vue-next";
const thirteenStore = useThirteenStore();
const { $socket } = useNuxtApp();
const toggleReady = () => {
  const status: UserStatus = thirteenStore.getMe?.status == "unready" ? 'ready' : 'unready';
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS, {
    roomId: thirteenStore.getId,
    status: status,
  });
}
</script>

<style scoped lang="scss"></style>
