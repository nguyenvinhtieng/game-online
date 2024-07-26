<template>
  <div class="">
    <!-- <SpecThirteenListItem v-for="room in rooms" :room="room" /> -->
    <header
      class="flex w-full gap-3 justify-start md:justify-center items-center py-5 flex-wrap md:flex-nowrap flex-col md:flex-row"
    >
      <div
        class="flex md:justify-center justify-start items-center gap-3 w-full md:w-fit"
      >
        <button
          class="w-12 h-12 rounded-full bg-[##FAFAFA] hover:bg-neutral-100 active:bg-neutral-100 transition-all flex items-center justify-center"
          @click="back"
        >
          <ArrowLeft class="w-6 h-6" />
        </button>
        <img src="/images/game-thumbnail/thirteen.svg" alt="logo" class="w-14 h-14" />
        <p class="font-semibold">Meow Lên</p>
      </div>
      <!-- Search -->
      <form
        action=""
        class="flex-1 flex items-center justify-center gap-3 h-14 rounded-xl border border-[#E6E6E6] bg-white px-4 w-full"
      >
        <SearchIcon class="w-6 h-6 text-neutral-800" />
        <input
          type="text"
          class="w-full h-full flex-1 py-3 md:py-0 outline-none bg-transparent"
          placeholder="Tìm ID phòng"
          @change="searchRoom"
        />
      </form>

      <BaseButton
        variant="outline"
        color="primary"
        shape="square"
        size="lg"
        @click="createRoom"
        class="w-full md:w-fit"
      >
        <template v-slot:startIcon> <PlusIcon :size="24" /> </template>
        <template v-slot:child> Tạo bàn mới </template>
      </BaseButton>
    </header>

    <main>
      <!-- Table -->
      <table class="w-full mt-5">
        <thead class="text-[#808080]">
          <tr>
            <th class="text-left">ID <span class="hidden md:inline">phòng</span></th>
            <th class="text-left">Số người</th>
            <th class="text-left">Điểm</th>
            <th class="text-left">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <SpecThirteenListItem v-for="room in rooms" :room="room" />
          <!-- Case empty -->
          <tr v-if="!rooms.length">
            <td class="py-5" colspan="4">
              <p class="text-center text-[#808080]">Không có phòng nào</p>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>
<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "~/constants";
import { ArrowLeft, SearchIcon, PlusIcon } from "lucide-vue-next";
const { $socket, $router } = useNuxtApp();
import { type ThirteenGameRoomItem } from '~/store/module/thirteen'

const isCreatingRoom = ref(false);

const rooms = ref<ThirteenGameRoomItem[]>([]);
function back() {
  $router.back();
}
function createRoom() {
  if (isCreatingRoom.value) return;
  isCreatingRoom.value = true;
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.CREATE, {
    type: "thirteen",
  });
}
function searchRoom() {

}
($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.REGISTER_LIST);
($socket as Socket).on(SOCKET_EVENTS.GAME.THIRTEEN.LIST, (list: ThirteenGameRoomItem[]) => {
  rooms.value = list.filter((room) => room.id);
});


onUnmounted(() => {
  ($socket as Socket).emit(SOCKET_EVENTS.GAME.THIRTEEN.UNREGISTER_LIST);
  ($socket as Socket).off(SOCKET_EVENTS.GAME.THIRTEEN.LIST);
});

definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
