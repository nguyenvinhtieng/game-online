<template>
  <header v-if="device.isMobile" class="">
    <div class="absolute top-1 left-1 flex items-center justify-center gap-1">
      <button
        class="w-6 h-6 rounded-full bg-[##FAFAFA] hover:bg-neutral-100 active:bg-neutral-100 transition-all flex items-center justify-center"
        @click="() => $router.back()"
      >
        <ArrowLeft class="w-6 h-6" />
      </button>
      <p class="text-xs">Phòng: #{{ id }} - {{ settings?.winScore || 0 }} điểm</p>
    </div>
  </header>
  <header
    class="flex w-full gap-3 justify-start md:justify-center items-center flex-nowrap"
    v-else
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
    <div class="flex-1 flex items-center justify-end gap-3">
      <p class="whitespace-nowrap">Điểm thắng:</p>
      <p class="text-primary text-2xl font-extrabold">
        {{ settings?.winScore || 0 }}
      </p>
    </div>
  </header>
</template>
<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
const { $router } = useNuxtApp();
const device = useDevice();
import { useThirteenStore } from "~/store/module/thirteen";
import copyToClipboard from "~/utils/copy-to-clipboard";

const thirteenStore = useThirteenStore();
const { id, settings } = storeToRefs(thirteenStore);
</script>
<style scoped lang="scss"></style>
