<template>
  <div class="w-full h-full relative">
    <!-- Player: 1 -->
    <div
      class="absolute top-1 left-1/2 -translate-x-1/2 justify-center flex flex-col items-center"
    >
      <div>
        <p class="text-neutral-600 text-sm">
          Tieng <span class="text-xs">(13 điểm)</span>
        </p>
      </div>
      <div class="relative w-fit">
        <img src="/images/card/after.png" alt="" class="max-w-16 object-cover" />
        <span
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-6 h-6 text-sm bg-white/70 rounded-full font-semibold"
          >7</span
        >
      </div>
    </div>

    <!-- Player: 2 -->
    <div
      class="absolute top-1/2 left-1 -translate-y-1/2 justify-center flex flex-col items-center gap-2 md:flex-row"
    >
      <div>
        <p class="text-neutral-600 text-sm text-center">
          Tieng <br />
          <span class="text-xs">(13 điểm)</span>
        </p>
      </div>
      <div class="relative w-fit">
        <img src="/images/card/after.png" alt="" class="max-w-16 object-cover" />
        <span
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-6 h-6 text-sm bg-white/70 rounded-full font-semibold"
          >7</span
        >
      </div>
    </div>

    <!-- Player: 3 -->
    <div
      class="absolute top-1/2 right-1 -translate-y-1/2 justify-center flex flex-col items-center gap-2 md:flex-row"
    >
      <div>
        <p class="text-neutral-600 text-sm text-center">
          Tieng <br />
          <span class="text-xs">(13 điểm)</span>
        </p>
      </div>
      <div class="relative w-fit">
        <img src="/images/card/after.png" alt="" class="max-w-16 object-cover" />
        <span
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-6 h-6 text-sm bg-white/70 rounded-full font-semibold"
          >7</span
        >
      </div>
    </div>

    <!-- Player: Me -->
    <div class="absolute bottom-1 left-1 right-1 flex gap-[2px] justify-center">
      <div v-for="index in 13" :key="index" class="max-w-32">
        <img src="/images/card/a_hearts.png" alt="" class="w-full object-cover" />
      </div>
    </div>

    <!-- <div class="w-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <img src="/images/card/after.png" alt="" class="w-full" />
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { CARDS } from "~/constants/cards";
const route = useRoute();
// console.log(route.params.id);
// console.log(CARDS.length);
definePageMeta({
  layout: "play-game",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>

<!-- ♦ Diamonds : Chất rô
♥ Hearts : Chất cơ
♣ Clubs : Chất nhép
♠ Spade : Chất bích -->
