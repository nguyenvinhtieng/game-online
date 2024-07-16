<template>
  <div>
    <div class="text-neutral-600 text-sm text-center">
      <div class="flex gap-2">
        <span
          :contenteditable="isChangeName"
          ref="nameSpan"
          :class="{ 'border-b border-dashed border-neutral-500': isChangeName }"
          >{{ player.name }}</span
        >
        <div v-if="player.id == ($socket as Socket).id">
          <UserRoundPenIcon
            :size="16"
            class="cursor-pointer hover:opacity-80 transition-all"
            title="Đổi tên"
            @click="setIsChangeName(true)"
            v-if="!isChangeName"
          />
          <SaveIcon
            :size="16"
            class="cursor-pointer hover:opacity-80 transition-all"
            title="Lưu"
            @click="saveName"
            v-else
          >
            Lưu
          </SaveIcon>
        </div>
      </div>
      <span class="text-xs">( {{ player.score }} điểm)</span>
      <br />
    </div>
  </div>
  <div class="relative w-fit" v-if="player.cards.length > 0">
    <img src="/images/card/after.png" alt="" class="max-w-16 object-cover" />
    <span
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-6 h-6 text-sm bg-white/70 rounded-full font-semibold"
    >
      {{ player.cards.length }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { UserRoundPenIcon, SaveIcon } from "lucide-vue-next";
const props = defineProps(["player"]);
const { $socket } = useNuxtApp();
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useThirteenStore } from "~/store/module/thirteen";
import { useUserStore } from "~/store/module/user";
const userStore = useUserStore();
const thirteenStore = useThirteenStore();
const nameSpan = ref<HTMLElement | null>(null);
const isChangeName = ref(false);

function setIsChangeName(status: boolean) {
  isChangeName.value = status;
}
function saveName() {
  if (nameSpan.value) {
    const newName = nameSpan.value.innerText.trim();
    if (newName.length > 0 && newName.length <= 20) {
      setIsChangeName(false);
      ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.CHANGE_NAME, {
        name: newName,
        roomId: thirteenStore.getId,
      });
      userStore.setName(newName);
    } else {
      //
      alert("Tên phải từ 1 đến 20 ký tự");
      nameSpan.value.innerText = userStore.getName;
    }
  }
}
</script>

<style scoped lang="scss"></style>
