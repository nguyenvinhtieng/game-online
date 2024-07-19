<template>
  <div
    :class="`flex gap-3 items-center justify-center ${
      direction == 'vertical' && 'flex-col'
    }`"
  >
    <div class="flex items-center justify-center w-20 h-20 rounded-xl">
      <IconPlayerReady v-if="player.status == 'ready'" />
      <IconPlayer v-else />
    </div>
    <div
      :class="`flex gap-2 items-start flex-col ${
        direction == 'vertical' && 'items-center'
      }`"
    >
      <div v-if="player.id == ($socket as Socket).id" class="flex gap-3 items-center">
        <p class="text-primary font-semibold">
          <span
            :contenteditable="isChangeName"
            ref="nameSpan"
            :class="{
              'border-b border-dashed border-neutral-500': isChangeName,
            }"
            >{{ player.name }}</span
          >
          <span class="text-neutral-600 text-sm font-normal pl-[2px]">(You)</span>
        </p>
        <button
          class="w-8 h-8 rounded-full transition-all bg-primary md:hover:bg-primary-600 active:bg-primary-800 text-white flex items-center justify-center"
          v-if="thirteenStore.getStatus == 'waiting'"
          @click="saveName"
        >
          <SaveIcon class="w-4 h-4" v-if="isChangeName" />
          <PenIcon class="w-4 h-4" v-else />
        </button>
      </div>
      <p v-else class="font-semibold">{{ player.name }}</p>
      <span class="text-white bg-primary rounded-xl font-semibold py-1 px-3">{{
        player.score || 0
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { PenIcon, SaveIcon } from "lucide-vue-next";
import { useThirteenStore, type Player } from "~/store/module/thirteen";
import { useUserStore } from "~/store/module/user";
import { SOCKET_EVENTS } from "~/constants";

const { $socket } = useNuxtApp();
const props = defineProps<{
  direction?: "vertical" | "horizontal";
  player: Player;
}>();
console.log({props});
const { direction } = props;

const userStore = useUserStore();
const thirteenStore = useThirteenStore();
const nameSpan = ref<HTMLElement | null>(null);
const isChangeName = ref(false);

function setIsChangeName(status: boolean) {
  isChangeName.value = status;
}
function saveName() {
  if (!isChangeName.value) {
    setIsChangeName(true);
    return;
  }
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
