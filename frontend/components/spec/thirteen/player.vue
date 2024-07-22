<template>
  <div
    :class="`flex gap-3 items-center justify-center ${
      direction == 'vertical' && 'flex-col'
    }`"
  >
    <div
      :class="
        cn(
          'flex items-center justify-center w-20 h-20 rounded-xl relative',
          device.isMobile && 'h-10 w-10',
          thirteenStore.getTurn == player.id && 'border-2 border-primary border-dashed'
        )
      "
    >
      <IconPlayerReady
        :width="device.isMobile ? 20 : undefined"
        :height="device.isMobile ? 40 : undefined"
        v-if="player.status == 'ready'"
      />
      <IconPlayer
        :width="device.isMobile ? 20 : undefined"
        :height="device.isMobile ? 40 : undefined"
        v-else
      />
      <span class="absolute inset-3" v-if="props.player.status == 'disconnect'">
        <img src="/images/loading.gif" alt="Loading" class="w-full h-full" />
      </span>
    </div>
    <div
      :class="`flex gap-2 items-start flex-col ${
        direction == 'vertical' && 'items-center'
      }`"
    >
      <div v-if="player.id == ($socket as Socket).id" class="flex gap-3 items-center">
        <p
          :class="cn('text-primary font-semibold text-sm ', device.isMobile && 'text-xs')"
        >
          <span
            :contenteditable="isChangeName"
            ref="nameSpan"
            :class="{
              'border-b border-dashed border-neutral-500': isChangeName,
            }"
            >{{ player.name }}</span
          >
          <span class="text-neutral-600 font-normal pl-[2px]">(You)</span>
        </p>
        <button
          :class="
            cn(
              'w-8 h-8 rounded-full transition-all bg-primary md:hover:bg-primary-600 active:bg-primary-800 text-white flex items-center justify-center',
              device.isMobile && 'w-4 h-4'
            )
          "
          v-if="thirteenStore.getStatus == 'waiting'"
          @click="saveName"
        >
          <SaveIcon
            :class="cn('w-4 h-4', device.isMobile && 'w-2 h-2')"
            v-if="isChangeName"
          />
          <PenIcon :class="cn('w-4 h-4', device.isMobile && 'w-2 h-2')" v-else />
        </button>
      </div>
      <p v-else :class="cn('font-semibold', device.isMobile && 'text-xs')">
        {{ player.name }}
      </p>
      <span
        :class="
          cn(
            'text-white bg-primary rounded-xl font-semibold py-1 px-3',
            device.isMobile && 'px-2 text-xs'
          )
        "
        >{{ player.score || 0 }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { PenIcon, SaveIcon } from "lucide-vue-next";
import { useThirteenStore, type Player } from "~/store/module/thirteen";
import { useUserStore } from "~/store/module/user";
import { SOCKET_EVENTS } from "~/constants";
const device = useDevice();
const { $socket } = useNuxtApp();
const props = defineProps<{
  direction?: "vertical" | "horizontal";
  player: Player;
}>();
const { direction } = props;
const notification = ref<Notification | null>(null);
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
    let newName = nameSpan.value.innerText.trim();
    if (newName.includes("\n")) {
      nameSpan.value.innerText = newName.replace("\n", "");
    }
    if (newName == userStore.getName) {
      setIsChangeName(false);
      return;
    }
    if (newName.length > 0 && newName.length <= 20) {
      setIsChangeName(false);
      ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.CHANGE_NAME, {
        name: newName,
        roomId: thirteenStore.getId,
      });
      userStore.setName(newName);
    } else {
      showToast("Tên không được để trống hoặc không quá 20 ký tự", "error");
      nameSpan.value.innerText = userStore.getName;
    }
  }
}
</script>

<style scoped lang="scss"></style>
