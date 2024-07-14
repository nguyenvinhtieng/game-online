<template>
  <div class="mt-4">
    <div class="">
      <div class="mb-4 flex items-center justify-between">
        <h5
          class="block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased"
        >
          Danh sách các phòng chơi
        </h5>
        <button
          @click="createRoom"
          class="block font-sans text-sm font-bold leading-normal px-4 py-2 rounded-sm transition-all text-blue-500 antialiased hover:bg-blue-500 hover:text-white"
        >
          Mở bàn mới
        </button>
      </div>

      <form class="max-w-md mx-auto">
        <label
          for="default-search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >Tìm</label
        >
        <div class="relative">
          <div
            class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Tìm mã phòng"
            required
          />
        </div>
      </form>

      <div class="divide-y divide-gray-200">
        <NuxtLink
          to="/game/thirteen/123"
          class="flex items-center justify-between px-0 py-3 transition-all border-b hover:border-neutral-500 cursor-pointer"
        >
          <div class="flex items-center gap-x-3">
            <div>#110</div>
            <div>
              <h6
                class="block font-sans text-base font-semibold leading-relaxed tracking-normal text-blue-gray-900 antialiased"
              >
                Người chơi: Tieng, Test, Moy
              </h6>
              <p
                class="block font-sans text-sm font-light leading-normal text-gray-700 antialiased"
              >
                Đã mở bàn 30 phút trước
              </p>
            </div>
          </div>
          <a
            href="#"
            class="block font-sans text-sm font-bold leading-normal px-4 py-2 rounded-sm transition-all text-blue-500 antialiased hover:bg-blue-500 hover:text-white"
          >
            Vào chơi
          </a>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SOCKET_EVENTS } from "~/constants";
const { $socket } = useNuxtApp();
const isCreatingRoom = ref(false);

function createRoom() {
  if (isCreatingRoom.value) return;
  isCreatingRoom.value = true;
  $socket.emit(SOCKET_EVENTS.GAME.CREATE, {
    type: "thirteen",
  });
}

// on GAME CREATED
$socket.on(SOCKET_EVENTS.GAME.CREATED, (roomId: string) => {
  isCreatingRoom.value = false;
  console.log("GAME CREATED", roomId);
});

definePageMeta({
  layout: "game",
  scrollToTop: true,
});
</script>
<style scoped lang="scss"></style>
