<template>
  <div class="relative" v-if="player.cards.length > 0">
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
    <!-- Count down -->
    <div
      v-if="player.id == thirteenStore.getTurn && thirteenStore.getTurnTimeout"
      :class="`w-10 h-10 absolute border-2 border-white text-white rounded-full flex items-center justify-center font-semibold ${
        classes[props.position]
      }`"
    >
      <BaseCountDown :targetTime="thirteenStore.getTurnTimeout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThirteenStore, type Player } from "~/store/module/thirteen";
import { useUserStore } from "~/store/module/user";
const device = useDevice()
const props = defineProps<{
  position: "right" | "left";
  player: Player;
}>();
const classes: Record<"left" | "right", string> = {
  left: "top-1/2 -translate-x-full -left-5 -translate-y-1/2",
  right: "top-1/2 translate-x-full -right-5 -translate-y-1/2",
};
const userStore = useUserStore();
const thirteenStore = useThirteenStore();
</script>

<style scoped lang="scss"></style>
