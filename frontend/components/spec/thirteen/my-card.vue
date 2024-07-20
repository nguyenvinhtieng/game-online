<template>
  <div class="flex gap-5 w-full items-center px-9" v-if="me">
    <span
      v-if="thirteenStore.turn == me.id && thirteenStore.getTurnTimeout"
      :class="
        cn(
          'w-20 h-20 rounded-full border-2 border-white flex items-center justify-center font-semibold text-4xl text-white',
          device.isMobile && 'w-10 h-10 text-lg'
        )
      "
    >
      <BaseCountDown :targetTime="thirteenStore.getTurnTimeout" />
    </span>
    <div class="relative flex flex-1 flex-wrap justify-center">
      <img
        v-for="(card, index) in me.cards"
        :src="`/images/card/meow/${card.value}_${card.suit}.svg`"
        alt="Card After"
        :class="
          cn(
            'w-20 shadow-lg relative',
            card.isSelected && 'top-[-10px]',
            device.isMobile && 'w-10'
          )
        "
        :style="`z-index: ${index};`"
        :key="index"
        @click="toggleCardSelected(index)"
      />
    </div>
    <div
      :class="cn('w-28 flex flex-col gap-5', device.isMobile && 'gap-1')"
      v-if="thirteenStore.turn == me.id"
    >
      <BaseButton
        variant="default"
        color="primary"
        shape="square"
        size="sm"
        :disabled="!checkValidateCard"
        @click="postCard"
        :class="cn(device.isMobile && '!px-3 !py-1 w-full')"
      >
        <template v-slot:child>Đánh</template>
      </BaseButton>
      <BaseButton
        variant="default"
        color="white"
        shape="square"
        size="sm"
        @click="skipTurn"
        :class="cn(device.isMobile && '!px-3 !py-1 w-full')"
        v-if="thirteenStore.getLatestTurn?.id != me.id"
      >
        <template v-slot:child>Bỏ lượt</template>
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThirteenStore } from "~/store/module/thirteen";
import { SOCKET_EVENTS } from "~/constants";
import type { Socket } from "socket.io-client";
const { $socket } = useNuxtApp();
const thirteenStore = useThirteenStore();
const me = thirteenStore.getMe;
const device = useDevice();
function checkValidateCard() {
  return true;
}

function toggleCardSelected(index: number) {
  thirteenStore.toggleCardSelected(index);
}
function postCard() {
  const selectedCard = thirteenStore.getMe?.cards.filter((c) => c.isSelected);
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.POST_CARD, {
    roomId: thirteenStore.getId,
    cards: selectedCard,
  });
}
function skipTurn() {
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.SKIP_TURN, {
    roomId: thirteenStore.getId,
  });
}
</script>

<style scoped lang="scss"></style>
