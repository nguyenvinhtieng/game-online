<template></template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";

// Define props
const props = defineProps<{
  x?: number;
  y?: number;
}>();

// Define the ref for the interval ID
const confettiInterval = ref<number | null>(null);

// Function to start confetti
const startConfetti = () => {
  const confetti = useNuxtApp().$confetti;
  confettiInterval.value = window.setInterval(() => {
    confetti({
      particleCount: 200, // Increase particle count
      startVelocity: 20, // Adjust start velocity for slower particles
      spread: 360,
      origin: { x: props.x || 0.5, y: props.y || 0.5 }, // Use props x and y
      ticks: 100, // Increase ticks for longer animation duration
      zIndex: 1000,
      colors: [
        "#bb0000",
        "#ffffff",
        "#ff6347",
        "#4682b4",
        "#32cd32",
        "#ffd700",
        "#ff69b4",
        "#8a2be2",
        "#00ff00",
        "#00ffff",
        "#ff4500",
        "#800080",
      ],
    });
  }, 1000); // Adjust the interval as needed
};

// Start confetti on component mount
startConfetti();

// Function to stop confetti
const stopConfetti = () => {
  if (confettiInterval.value !== null) {
    clearInterval(confettiInterval.value);
    confettiInterval.value = null;
  }
};

// Clean up the interval on component unmount
onBeforeUnmount(() => {
  stopConfetti();
});
</script>
