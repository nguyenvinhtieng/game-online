<template>
  <div class="w-full h-full bg-[url('/images/bg.jpg')] min-h-lvh">
    <div class="home-layout__container">
      <Suspense>
        <NuxtPage />
      </Suspense>
    </div>
    <div
      v-if="showRequireRotate"
      class="z-10 fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-neutral-950 text-neutral-100 flex-col"
    >
      <img src="/images/rotate.gif" alt="Rotate Screen" class="w-[80%]" />
      <p class="px-2 text-center">
        Vui lòng xoay màn hình ngang để trải nghiệm trò chơi tốt hơn
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDevice } from "#imports";
import type { Socket } from "socket.io-client";
import { onMounted, ref } from "vue";
import { SOCKET_EVENTS } from "~/constants";
const { $socket, $router } = useNuxtApp();

const device = useDevice();
// Create ref to show modal rotate screen
const showRequireRotate = ref(false);
onMounted(() => {
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.CREATED,
    (payload: { roomId: string; type: string }) => {
      $router.push(`/${payload.type}/${payload.roomId}`);
    }
  );

  onUnmounted(() => {
    ($socket as Socket).off(SOCKET_EVENTS.GAME.CREATED);
  });
});
</script>
<style scoped lang="scss">
.home-layout {
  &__container {
    max-width: var(--container-width);
    margin: 0 auto;
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
    min-height: 100vh;
  }
}
</style>
