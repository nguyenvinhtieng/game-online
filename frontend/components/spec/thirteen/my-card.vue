<template>
  <div class="flex gap-5 w-full items-center justify-center px-9" v-if="me">
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
    <div
      class="flex flex-1 flex-wrap justify-center items-center"
      v-if="me.cards.length > 0"
    >
      <div
        :class="
          cn(
            'relative justify-center h-[110px] max-w-full',
            device.isMobile && 'h-[55px]'
          )
        "
        :style="`width: ${
          (me.cards.length - 1) * (device.isMobile ? 15 : 30) +
          (device.isMobile ? 40 : 80)
        }px;`"
      >
        <img
          v-for="(card, index) in me.cards"
          :src="`/images/card/meow/${card.value}_${card.suit}.svg`"
          :alt="`Card ${card.value} ${card.suit}`"
          :class="
            cn(
              'w-20 shadow-lg absolute top-0',
              card.isSelected && 'top-[-10px]',
              device.isMobile && 'w-10'
            )
          "
          :style="`z-index: ${index}; left: ${index * 30}px;`"
          :key="index"
          @click="toggleCardSelected(index)"
        />
      </div>
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
        :disabled="!isCardValid"
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
import {
  getCardListType,
  checkIsValidWithPrevTurn,
} from "~/utils/game/thirteen/check-logic";
const { $socket } = useNuxtApp();
const thirteenStore = useThirteenStore();
const me = thirteenStore.getMe;
const device = useDevice();
const isCardValid = ref(false);
const updateCardValidity = () => {
  const allCard = thirteenStore.getMe?.cards || [];
  const mySelectedCards = thirteenStore.getMe?.cards.filter((i) => i.isSelected) || [];
  const type = getCardListType(mySelectedCards || []);
  if (!type) {
    isCardValid.value = false;
    return;
  }
  const prevTurn = thirteenStore.getPrevTurn[thirteenStore.getPrevTurn.length - 1];
  if (!prevTurn && thirteenStore.winHistory.length == 0) {
    // Need have first card in mySelectedCards
    if (
      mySelectedCards[0].suit != allCard[0].suit ||
      mySelectedCards[0].value != allCard[0].value ||
      mySelectedCards[0].weight != allCard[0].weight
    ) {
      isCardValid.value = false;
    } else {
      isCardValid.value = true;
    }
    return;
  }
  if (prevTurn?.id == (thirteenStore.getMe?.id || "")) {
    isCardValid.value = true;
    return;
  }
  const isValid = checkIsValidWithPrevTurn(mySelectedCards || [], prevTurn?.cards);
  if (!isValid) {
    isCardValid.value = false;
    return;
  }
  isCardValid.value = true;
};
watch(
  () => thirteenStore.getMe?.cards,
  () => {
    updateCardValidity();
  },
  { deep: true }
);

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
