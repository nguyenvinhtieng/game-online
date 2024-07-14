<template>
  <header>
    <nav class="bg-white border-b border-neutral-100 px-4 py-2">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <nuxt-link :to="ROUTES.HOME">
          <span class="text-lg font-semibold">OnlineGame</span>
        </nuxt-link>
        <div v-if="headerItems.length > 0">
          <ul class="flex gap-2">
            <li v-for="item in headerItems" :key="item.id">
              <nuxt-link
                :to="item.link"
                :class="
                  twMerge(
                    'px-4 py-2 rounded-md text-neutral-900 transition-all hover:bg-blue-100 active:bg-blue-200',
                    item.link === $route.path
                      ? '!bg-blue-500 !text-white cursor-default'
                      : ''
                  )
                "
                >{{ item.title }}</nuxt-link
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>
<script setup lang="ts">
import { headerItems } from "~/constants/header-items";
import { ROUTES } from "~/constants/routes";
import { twMerge } from "tailwind-merge";
</script>
<style scoped lang="scss"></style>
