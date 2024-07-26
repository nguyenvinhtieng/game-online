<template>
  <div
    v-if="status == 'waiting' && me && players.length > 1"
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
  >
    <BaseButton
      variant="outline"
      color="primary"
      shape="square"
      size="md"
      @click="toggleReady"
    >
      <template v-slot:child>
        <div>
          <p v-if="me?.status == 'unready'">Sẵn sàng</p>
          <p v-else>Huỷ sẵn sàng</p>
          <div v-if="gameStartAt" class="text-xs">
            <span class="text-xs"
              >Bắt đầu sau <BaseCountDown :targetTime="gameStartAt" /> giây</span
            >
          </div>
        </div>
      </template>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useTictactoeStore } from "~/store/module/tictactoe";
import type { Player, UserStatus } from "~/types/game.tictactoe";
const tictactoeStore = useTictactoeStore();
const { id, gameStartAt, status, players } = storeToRefs(tictactoeStore);
const { $socket } = useNuxtApp();
const me = computed(() =>
  players.value.find((p: Player) => p.id === ($socket as Socket).id)
);
const toggleReady = () => {
  const status: UserStatus = me.value?.status == "unready" ? "ready" : "unready";
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.TICTACTOE.UPDATE_PLAYER_STATUS, {
    roomId: id.value,
    status: status,
  });
};
</script>

<style scoped lang="scss"></style>
