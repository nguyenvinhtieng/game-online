<template>
  <div class="home-layout__container">
    <LayoutHomeHeader />
    <main class="px-2 py-1">
      <Suspense>
        <NuxtPage />
      </Suspense>
    </main>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.home-layout {
  &__container {
    max-width: var(--container-width);
    margin: 0 auto;
    width: 100%;
  }
}
</style>
