<template>
  <main class="play-game-layout__container">
    <Suspense>
      <NuxtPage />
    </Suspense>
  </main>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.play-game-layout {
  &__container {
    max-width: var(--container-width);
    margin: 0 auto;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
}
</style>
