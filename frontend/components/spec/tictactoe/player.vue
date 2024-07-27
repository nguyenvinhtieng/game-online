<template>
  <div class="flex md:flex-col flex-row gap-2 items-center justify-center w-[200px]">
    <template v-if="props.player">
      <CircleIcon
        :width="40"
        :height="40"
        class="text-blue-500"
        v-if="props.player.position == PlayerTypeEnum.O"
      />
      <XIcon
        :width="40"
        :height="40"
        class="text-red-500"
        v-else-if="props.player.position == PlayerTypeEnum.X"
      />
      <div class="text-center flex gap-1 items-center justify-center whitespace-nowrap">
        <span
          class="text-2xl font-semibold text-primary"
          :contenteditable="isChangeName"
          ref="nameSpan"
          >{{ props.player.name }}</span
        >

        <template v-if="props.player.id == ($socket as Socket).id">
          <span class="text-neutral-500 text-xs">( Bạn )</span>
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
      </div>
      <p class="flex gap-1">
        Điểm: <span class="font-semibold">{{ props.player.score }}</span>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { XIcon, CircleIcon, SaveIcon, PenIcon } from "lucide-vue-next";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useTictactoeStore } from "~/store/module/tictactoe";
import { useUserStore } from "~/store/module/user";
import type { Player } from "~/types/game.tictactoe";
import { PlayerTypeEnum } from "~/types/game.tictactoe";
const tictactoeStore = useTictactoeStore();
const { status, id } = storeToRefs(tictactoeStore);
const userStore = useUserStore();
const { $socket } = useNuxtApp();
const nameSpan = ref<HTMLElement[] | null>(null);
const isChangeName = ref(false);
const props = defineProps<{
  player?: Player;
}>();
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
      ($socket as Socket).emit(SOCKET_EVENTS.GAME.TICTACTOE.CHANGE_NAME, {
        name: newName,
        roomId: id.value,
      });
      userStore.setName(newName);
    } else {
      showToast("Tên không được để trống hoặc không quá 20 ký tự", "error");
      nameSpan.value[0].innerText = userStore.getName;
    }
  }
}
</script>

<style scoped lang="scss"></style>
