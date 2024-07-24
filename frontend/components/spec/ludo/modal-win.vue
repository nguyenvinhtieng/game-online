<template>
  <div class="fixed inset-0 bg-black bg-opacity-0 flex justify-center items-center z-50">
    <div
      :class="`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl flex flex-col justify-center items-center gap-5 p-10 border border-primary after:content-[''] after:absolute after:-inset-28 after:bg-[url('/images/win.svg')] after:z-0 ${
        device.isMobile ? 'p-5' : 'p-10'
      }`"
    >
      <div class="z-[1] relative flex gap-10 items-center justify-center">
        <div>
          <IconCup />
        </div>
        <div class="flex-1 flex flex-col gap-3">
          <p class="text-primary font-semibold">Người chiến thắng</p>
          <h1 class="text-4xl font-bold">{{ winnerName }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useLudoStore } from "~/store/module/ludo";
import type { Player } from "~/types/game.ludo";

const device = useDevice();
const ludoStore = useLudoStore();
const { winner, players } = storeToRefs(ludoStore);
// Get winner name from thirteenStore.getWinner

const winnerName = computed(() => {
  let w = players.value.find((p: Player) => p.id === winner?.value);
  return w?.name || "";
});
</script>
