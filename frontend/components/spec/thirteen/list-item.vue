<template>
  <NuxtLink
    class="flex items-center justify-between px-0 py-3 transition-all border-b hover:border-neutral-500 cursor-pointer"
    :to="`/game/thirteen/${room.id}`"
  >
    <div class="flex items-center gap-x-3">
      <div>#{{ room.id }}</div>
      <div>
        <h6
          class="block font-sans text-base font-semibold leading-relaxed tracking-normal text-blue-gray-900 antialiased"
        >
          Người chơi: {{ room.players.join(", ") }}
        </h6>
        <p
          class="block font-sans text-sm font-light leading-normal text-gray-700 antialiased"
        >
          Đã mở bàn {{ gameStartedCount }}
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
</template>

<script setup lang="ts">
const props = defineProps<{
  room: {
    id: string;
    players: string[];
    createdAt: string;
  };
}>();
const gameStartedCount = ref<number | string>("vài giây trước");
const room = shallowRef(props.room).value;
onMounted(() => {
  const interval = setInterval(() => {
    const diff = new Date().getTime() - new Date(room.createdAt).getTime();
    const diffInSeconds = Math.floor(diff / 1000);
    if (diffInSeconds < 60) {
      gameStartedCount.value = `${diffInSeconds} giây trước`;
    } else if (diffInSeconds < 3600) {
      gameStartedCount.value = `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else {
      gameStartedCount.value = `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    }
  }, 1000);

  onBeforeUnmount(() => {
    clearInterval(interval);
  });
});
</script>
