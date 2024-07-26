<template>
  <header
    class="flex w-full gap-3 justify-start md:justify-center items-center flex-nowrap"
  >
    <div class="flex md:justify-center justify-start items-center gap-3 w-full md:w-fit">
      <button
        class="w-12 h-12 rounded-full bg-[#FAFAFA] hover:bg-neutral-100 active:bg-neutral-100 transition-all flex items-center justify-center"
        @click="() => $router.back()"
      >
        <ArrowLeft class="w-6 h-6" />
      </button>
      <button @click="() => copyToClipboard(id)">
        <span class="font-normal"
          >ID Phòng: <strong class="ml-2">#{{ id }}</strong></span
        >
      </button>
    </div>
  </header>
</template>
<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
const { $router } = useNuxtApp();
const device = useDevice();
import { useTictactoeStore } from "~/store/module/tictactoe";
import copyToClipboard from "~/utils/copy-to-clipboard";

const tictactoeStore = useTictactoeStore();
const { id } = storeToRefs(tictactoeStore);
</script>
<style scoped lang="scss"></style>
