<template>
  <div class="flex gap-5 w-full items-center justify-center px-9" v-if="me">
    <span
      v-if="turn == me.id && turnTimeout"
      :class="
        cn(
          'w-20 h-20 rounded-full border-2 border-white flex items-center justify-center font-semibold text-4xl text-white',
          device.isMobile && 'w-10 h-10 text-lg'
        )
      "
    >
      <BaseCountDown :targetTime="turnTimeout" />
    </span>
    <div
      class="flex flex-1 flex-wrap justify-center items-center relative"
      v-if="me.cards?.length > 0"
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
              'w-20 shadow-[-4px_4px_12px_0_rgba(0,0,0,0.5)] absolute top-0',
              card.isSelected && 'top-[-10px]',
              device.isMobile && 'w-10'
            )
          "
          :style="`z-index: ${index}; left: ${index * 30}px;`"
          :key="index"
          @click="toggleCardSelected(index)"
        />
      </div>
      <span
        v-if="notification"
        :class="
          cn(
            'z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-md  font-semibold animation-zoom-out origin-center bg-white whitespace-nowrap',
            device.isMobile && 'text-xs',
            notification.type == 'success' && 'text-green-500',
            notification.type == 'error' && 'text-primary'
          )
        "
      >
        {{ notification.message }}
      </span>
    </div>

    <div
      :class="cn('w-28 flex flex-col gap-5', device.isMobile && 'gap-1')"
      v-if="turn == me.id"
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
        v-if="thirteenStore.getLatestTurn?.id != me.id && prevTurnStore.length != 0"
      >
        <template v-slot:child>Bỏ lượt</template>
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThirteenStore, type MyCard } from "~/store/module/thirteen";
import { SOCKET_EVENTS } from "~/constants";
import type { Socket } from "socket.io-client";
import {
  getCardListType,
  checkIsValidWithPrevTurn,
} from "~/utils/game/thirteen/check-logic";
import { computed, ref } from "vue";
const { $socket } = useNuxtApp();
const thirteenStore = useThirteenStore();
const device = useDevice();
const { me, prevTurn: prevTurnStore, winHistory, id, turn, turnTimeout } = storeToRefs(thirteenStore);

type Notification = {
  id: string;
  message: string;
  type: 'error' | 'success'
}
const notification = ref<Notification | null>(null);

const isCardValid = computed(() => {
  const allCard = me?.value?.cards || [];
  const mySelectedCards = me?.value?.cards.filter((i: MyCard) => i.isSelected) || [];
  const type = getCardListType(mySelectedCards || []);
  if (!type) {
    return false;
  }
  const prevTurn = prevTurnStore.value[prevTurnStore.value.length - 1];
  if (!prevTurn && winHistory.value.length == 0) {
    // Need have first card in mySelectedCards
    if (
      mySelectedCards[0].suit != allCard[0].suit ||
      mySelectedCards[0].value != allCard[0].value ||
      mySelectedCards[0].weight != allCard[0].weight
    ) {
      return false;
    } else {
      return true;
    }
  }
  if (prevTurn?.id == (me?.value?.id || "")) {
    return true;
  }
  const isValid = checkIsValidWithPrevTurn(mySelectedCards || [], prevTurn?.cards);
  if (!isValid) {
    return false;
  }
  return true;
});

function toggleCardSelected(index: number) {
  thirteenStore.toggleCardSelected(index);
}
function postCard() {
  const selectedCard = me?.value?.cards.filter((c: MyCard) => c.isSelected);
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.POST_CARD, {
    roomId: id.value,
    cards: selectedCard,
  });
}
function skipTurn() {
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.SKIP_TURN, {
    roomId: id.value,
  });
}
onMounted(() => {
  ($socket as Socket).on(SOCKET_EVENTS.GAME.THIRTEEN.USER_NOTIFICATION, ({notifications}: {
    notifications: Notification[]
  }) => {
    const n = notifications.find((notification) => notification.id == me?.value?.id);
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
