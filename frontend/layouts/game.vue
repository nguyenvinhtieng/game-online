<template>
  <div class="w-full h-full bg-[url('/images/bg.jpg')] min-h-lvh">
    <div class="game-layout__container">
      <Suspense>
        <NuxtPage />
      </Suspense>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.game-layout {
  &__container {
    max-width: 1300px;
    margin: 0 auto;
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
    min-height: 100vh;
  }
}
</style>
