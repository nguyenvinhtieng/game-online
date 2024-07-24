<template>
  <div class="relative">
    <img
      src="/images/card/meow/after.svg"
      alt="Card After"
      :class="cn('w-16', device.isMobile && 'w-8')"
    />
    <span
      class="w-1/2 aspect-square absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-primary font-semibold flex items-center justify-center rounded-sm"
    >
      {{ player.cards.length || 0 }}
    </span>
    <span
      v-if="notification"
      :class="
        cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-md  font-semibold animation-zoom-out origin-center bg-white whitespace-nowrap',
          device.isMobile && 'text-xs',
          notification.type == 'success' && 'text-green-500',
          notification.type == 'error' && 'text-primary'
        )
      "
    >
      {{ notification.message }}
    </span>
    <!-- Count down -->
    <div
      v-if="player.id == turn && turnTimeout"
      :class="`w-10 h-10 absolute border-2 border-white text-white rounded-full flex items-center justify-center font-semibold ${
        classes[props.position]
      }`"
    >
      <BaseCountDown :targetTime="turnTimeout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useThirteenStore, type Player } from "~/store/module/thirteen";
type Notification = {
  id: string;
  message: string;
  type: 'error' | 'success'
}

const device = useDevice()
const props = defineProps<{
  position: "right" | "left";
  player: Player;
}>();
const classes: Record<"left" | "right", string> = {
  left: "top-1/2 -translate-x-full -left-5 -translate-y-1/2",
  right: "top-1/2 translate-x-full -right-5 -translate-y-1/2",
};
const thirteenStore = useThirteenStore();
const {turn, turnTimeout} = storeToRefs(thirteenStore);
const { $socket } = useNuxtApp();
const notification = ref<Notification | null>(null);

onMounted(() => {
  ($socket as Socket).on(SOCKET_EVENTS.GAME.THIRTEEN.USER_NOTIFICATION, ({notifications}: {
    notifications: Notification[]
  }) => {
    const n = notifications.find((notification) => notification.id == props.player.id);
    if (n) {
      notification.value = n;
      setTimeout(() => {
        notification.value = null;
      }, 2000);
    }
  });
  onUnmounted(() => {
    ($socket as Socket).off(SOCKET_EVENTS.GAME.THIRTEEN.USER_NOTIFICATION);
  });
});
</script>

<style scoped lang="scss"></style>
