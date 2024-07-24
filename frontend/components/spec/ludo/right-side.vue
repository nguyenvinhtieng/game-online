<template>
  <div class="flex flex-col justify-center items-center w-full h-full p-10">
    <div>
      <p class="font-semibold text-black/50 text-center">ID: #{{ id }}</p>
      <p class="mt-2 font-semibold text-black/50 text-center">Thời lượng trận đấu</p>
      <h2 class="mt-2 font-semibold text-4xl text-black/50 text-center">15:00:00</h2>
    </div>
    <div class="flex-1 flex flex-col justify-center items-center gap-8">
      <div class="w-full flex flex-col gap-1">
        <p v-if="status == 'waiting'">Hãy chọn vào màu của bạn bên bàn cờ</p>
        <div
          v-for="player in playerList"
          :key="player.position"
          class="flex items-center gap-2"
        >
          <template
            v-if="ludoStore.getPlayerByPosition(player.position || 1)?.id == ($socket as Socket).id"
          >
            <span :class="cn('w-5 h-3 bg-red-500', player.className)"></span>
            <p
              :contenteditable="isChangeName"
              ref="nameSpan"
              :class="
                cn(
                  ludoStore.getPlayerByPosition(player.position || 1)?.status ==
                    'ready' && 'text-green-500 font-semibold'
                )
              "
            >
              {{ ludoStore.getPlayerByPosition(player.position || 1)?.name || "" }}
            </p>
            <span class="text-xs text-neutral-400">(Bạn)</span>
            <div v-if="status == 'waiting'">
              <button
                :class="
                  cn(
                    'w-5 h-5 rounded-full transition-all bg-primary md:hover:bg-primary-600 active:bg-primary-800 text-white flex items-center justify-center'
                  )
                "
                @click="saveName"
              >
                <SaveIcon :class="cn('w-3 h-3')" v-if="isChangeName" />
                <PenIcon :class="cn('w-3 h-3')" v-else />
              </button>
            </div>
          </template>
          <template v-else>
            <span :class="cn('w-5 h-3 bg-red-500', player.className)"></span>
            <p
              :class="
                cn(
                  ludoStore.getPlayerByPosition(player.position || 1)?.status ==
                    'ready' && 'text-green-500 font-semibold'
                )
              "
            >
              {{ ludoStore.getPlayerByPosition(player.position || 1)?.name || "" }}
            </p>
          </template>
        </div>
      </div>
      <template v-if="status == 'playing'">
        <p class="font-semibold text-center">Lượt chơi của</p>
        <h2 class="text-2xl font-semibold text-[#FF2F2F] text-center">
          {{ ludoStore.getPlayerById(turn || "")?.name }}
        </h2>
        <p>{{ dice?.value || null }}</p>
      </template>
      <template
        v-if="status == 'waiting' && players.length > 1 && ludoStore.getPlayerById(($socket as Socket).id || '') "
      >
        <BaseButton
          variant="outline"
          color="primary"
          shape="square"
          size="md"
          @click="handleToggleReady"
        >
          <template v-slot:child>
            <div>
              <p
                v-if="ludoStore.getPlayerById(($socket as Socket).id || '')?.status == 'unready'"
              >
                Sẵn sàng
              </p>
              <p v-else>Huỷ sẵn sàng</p>
              <div v-if="gameStartAt" class="text-xs">
                <span class="text-xs"
                  >Bắt đầu sau <BaseCountDown :targetTime="gameStartAt" /> giây</span
                >
              </div>
            </div>
          </template>
        </BaseButton>
      </template>
      <BaseButton
        v-if="turn == ($socket as Socket).id"
        variant="default"
        color="primary"
        shape="square"
        size="md"
        :disabled="isRolling || !isShowRoll"
        :style="{ display: isRolling || !isShowRoll ? 'none' : 'block' }"
        @click="roll"
      >
        <template v-slot:child> Quay Xúc Xắc </template>
      </BaseButton>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PenIcon, SaveIcon } from "lucide-vue-next";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useLudoStore } from "~/store/module/ludo";
import { useUserStore } from "~/store/module/user";
import type { UserStatus } from "~/types/game.ludo";
const { $socket } = useNuxtApp();
const ludoStore = useLudoStore();
const userStore = useUserStore();
const { turn, status, id, gameStartAt, players, dice, movableChess } = storeToRefs(
  ludoStore
);
const playerList = [
  { position: 1, className: "bg-red-500" },
  { position: 2, className: "bg-blue-500" },
  { position: 3, className: "bg-green-500" },
  { position: 4, className: "bg-yellow-500" },
];
const nameSpan = ref<HTMLElement[] | null>(null);
const isChangeName = ref(false);
const isRolling = ref(false);
const ROLLING_TIME = 5;
const isShowRoll = computed(() => {
  if (movableChess.value.length > 0) {
    return false;
  }
  return true;
});
function handleToggleReady() {
  const userStatus: UserStatus =
    ludoStore.getPlayerById(($socket as Socket).id || "")?.status == "unready"
      ? "ready"
      : "unready";
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.LUDO.UPDATE_PLAYER_STATUS, {
    roomId: id.value,
    status: userStatus,
  });
}
function setIsChangeName(status: boolean) {
  isChangeName.value = status;
}
function saveName() {
  if (!isChangeName.value) {
    setIsChangeName(true);
    return;
  }
  if (nameSpan.value) {
    let newName = nameSpan.value[0].innerText.trim();
    if (newName.includes("\n")) {
      nameSpan.value[0].innerText = newName.replace("\n", "");
    }
    if (newName == userStore.getName) {
      setIsChangeName(false);
      return;
    }
    if (newName.length > 0 && newName.length <= 20) {
      setIsChangeName(false);
      ($socket as Socket).emit(SOCKET_EVENTS.GAME.LUDO.CHANGE_NAME, {
        name: newName,
        roomId: ludoStore.getId,
      });
      userStore.setName(newName);
    } else {
      showToast("Tên không được để trống hoặc không quá 20 ký tự", "error");
      nameSpan.value[0].innerText = userStore.getName;
    }
  }
}
function roll() {
  if (isRolling.value) return;
  isRolling.value = true;
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.LUDO.ROLL, {
    id: id.value,
  });
  setTimeout(() => {
    isRolling.value = false;
  }, ROLLING_TIME * 1000);
}
</script>
