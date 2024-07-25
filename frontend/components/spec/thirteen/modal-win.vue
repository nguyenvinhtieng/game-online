<template>
  <div class="fixed inset-0 bg-black bg-opacity-0 flex justify-center items-center z-50">
    <div
      :class="`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl flex flex-col justify-center items-center gap-5 p-10 border border-primary after:content-[''] after:absolute after:-inset-28 after:bg-[url('/images/win.svg')] after:z-0 ${
        device.isMobile ? 'p-5' : 'p-10'
      }`"
    >
      <div
        class="z-[1] relative flex gap-10 items-center justify-center animation-zoom-out"
      >
        <div>
          <IconCup />
        </div>
        <div class="flex-1 flex flex-col gap-3">
          <p class="text-primary font-semibold">Người chiến thắng</p>
          <h1 class="text-4xl font-bold">{{ winnerName }}</h1>
          <span
            class="px-3 py-1 bg-primary rounded-xl text-white font-semibold text-4xl w-fit"
            >+{{ settings?.winScore }}</span
          >
        </div>
      </div>
      <span class="text-[#808080] text-sm font-light">Tự đóng (5)</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useThirteenStore, type Player } from "~/store/module/thirteen";

const device = useDevice();
const thirteenStore = useThirteenStore();
const { winner, players, settings } = storeToRefs(thirteenStore);

const winnerName = computed(() => {
  let winnerId = winner?.value;
  let w = players.value.find((player: Player) => player.id === winnerId);
  return w?.name || "";
});
</script>
