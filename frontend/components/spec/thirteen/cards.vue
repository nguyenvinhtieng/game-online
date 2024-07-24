<template>
  <div>
    <!-- TOP -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center"
      v-if="props.players[0] && props.players[0]?.cards?.length"
    >
      <SpecThirteenUserCard position="right" :player="props.players[0]" />
    </div>
    <!-- LEFT -->
    <div
      class="absolute top-1/2 left-0 -translate-y-1/2 flex items-center justify-center"
      v-if="props.players[1] && props.players[1]?.cards?.length"
    >
      <SpecThirteenUserCard position="right" :player="props.players[1]" />
    </div>
    <!-- RIGHT -->
    <div
      class="absolute top-1/2 right-0 -translate-y-1/2 flex items-center justify-center"
      v-if="props.players[3] && props.players[3]?.cards?.length"
    >
      <SpecThirteenUserCard position="left" :player="props.players[3]" />
    </div>
    <!-- BOTTOM -->
    <div
      class="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-full"
      v-if="props.players[2] && props.players[2]?.cards?.length"
    >
      <SpecThirteenMyCard v-if="me" />
      <SpecThirteenUserCard v-else position="right" :player="props.players[2]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThirteenStore, type Player } from "~/store/module/thirteen";
const props = defineProps<{
  players: (Player | undefined)[]
}>();
const thirteenStore = useThirteenStore();
const { me } = storeToRefs(thirteenStore)
</script>

<style scoped lang="scss"></style>
