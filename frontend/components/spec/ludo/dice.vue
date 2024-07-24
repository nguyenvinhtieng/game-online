<template>
  <div class="scene w-16 h-16 mx-auto text-center">
    <div class="cube" :class="{ rolling: isRolling }" :style="transformStyle">
      <div class="flex items-center justify-center text-lg w-full h-full face face1">
        1
      </div>
      <div class="flex items-center justify-center text-lg w-full h-full face face2">
        2
      </div>
      <div class="flex items-center justify-center text-lg w-full h-full face face3">
        3
      </div>
      <div class="flex items-center justify-center text-lg w-full h-full face face4">
        4
      </div>
      <div class="flex items-center justify-center text-lg w-full h-full face face5">
        5
      </div>
      <div class="flex items-center justify-center text-lg w-full h-full face face6">
        6
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { useLudoStore } from "~/store/module/ludo";
import type { Dice } from "~/types/game.ludo";
const ludoStore = useLudoStore();
// const  = storeToRefs(ludoStore);
const isRolling = ref(false);
const result = ref<Dice>(1);
const { $socket } = useNuxtApp();
const faceAngles: Record<Dice, string> = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateX(-90deg) rotateY(0deg)",
  3: "rotateX(0deg) rotateY(90deg)",
  4: "rotateX(0deg) rotateY(-90deg)",
  5: "rotateX(90deg) rotateY(0deg)",
  6: "rotateX(180deg) rotateY(0deg)",
};

const transformStyle = computed(() => {
  return {
    transform: faceAngles[result.value as Dice],
  };
});

const rollDice = (seeks: Dice[], value: Dice) => {
  let numSeek = seeks.length;
  isRolling.value = true;
  let index = 0;
  ludoStore.setDicing(true);
  const interval = setInterval(() => {
    result.value = seeks[index];
    index++;
    if (index >= numSeek) {
      clearInterval(interval);
      result.value = value; // Final result
      isRolling.value = false;
      setTimeout(() => {
        ludoStore.setDicing(false);
      }, 1000);
    }
  }, 1000); // Change face every 1000ms
};

onMounted(() => {
  ($socket as Socket).on(
    SOCKET_EVENTS.GAME.LUDO.DICE,
    ({ dice, seeks }: { dice: Dice; seeks: Dice[] }) => {
      console.log({ dice, seeks });
      rollDice(seeks, dice);
    }
  );
  onBeforeUnmount(() => {
    ($socket as Socket).off(SOCKET_EVENTS.GAME.LUDO.DICE);
  });
});
</script>

<style scoped>
.scene {
  perspective: 320px;
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(0deg) rotateY(0deg);
  transition: transform 1s;
}

.face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #f3f3f3;
  box-sizing: border-box;
  border-radius: 10px;
}

.face img {
  width: 100%;
  height: 100%;
}

.face1 {
  transform: rotateY(0deg) translateZ(32px);
}
.face2 {
  transform: rotateX(90deg) translateZ(32px);
}
.face3 {
  transform: rotateY(90deg) translateZ(32px);
}
.face4 {
  transform: rotateY(-90deg) translateZ(32px);
}
.face5 {
  transform: rotateX(-90deg) translateZ(32px);
}
.face6 {
  transform: rotateX(180deg) translateZ(32px);
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
}
</style>
