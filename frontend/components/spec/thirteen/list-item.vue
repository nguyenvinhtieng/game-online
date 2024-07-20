<template>
  <tr class="border-b border-dashed border-[#E6E6E6]">
    <td class="py-5">#{{ room.id }}</td>
    <td class="py-5">
      <div class="md:flex items-center gap-6 hidden">
        <IconChairFull v-for="i in room.players.length" :key="i" />
        <IconChairEmpty v-for="i in 4 - room.players.length" :key="i" />
      </div>
      <div class="md:hidden">{{ room.players.length || 0 }} / 4</div>
    </td>
    <td class="py-5">{{ room.settings?.winScore }}</td>
    <td class="py-5">
      <NuxtLink :to="`/game/thirteen/${room.id}`">
        <BaseButton variant="default" color="primary" shape="square" size="sm">
          <template v-slot:child> Vào phòng </template>
        </BaseButton>
      </NuxtLink>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { ThirteenGameRoomItem } from "~/store/module/thirteen";

const props = defineProps<{
  room: ThirteenGameRoomItem;
}>();
</script>
