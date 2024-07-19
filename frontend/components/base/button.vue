<template>
  <button
    :class="
      cn(
        buttonVariants({
          variant: props.variant,
          size: props.size,
          color: props.color,
          shape: props.shape,
          className: props.className,
        })
      )
    "
  >
    <slot name="startIcon"></slot>

    <slot name="child"></slot>
  </button>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { cn } from "~/utils/cn";
import { cva } from "class-variance-authority";

const props = defineProps<{
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  shape?: "default" | "square";
  className?: string;
  startIcon?: string;
}>();

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 transition-all disabled:pointer-events-none disabled:opacity-75 font-medium",
  {
    variants: {
      variant: {
        default: "color-primary",
        outline: "border border-input hover:bg-accent",
        ghost: "bg-transparent",
      },
      color: {
        default:
          "text-neutral-600 bg-neutral-100 md:hover:bg-neutral-200 md:active:bg-neutral-300",
        primary: "text-white bg-primary md:hover:bg-primary-600 md:active:bg-primary-700",
        secondary: "text-white bg-blue-500 md:hover:bg-blue-600 md:active:bg-blue-700",
        white: "text-primary bg-white md:hover:bg-neutral-100 md:active:bg-neutral-200",
      },
      size: {
        ss: "py-1 px-2",
        xs: "py-2 px-3",
        sm: "py-3 px-4",
        md: "py-3 px-5",
        lg: "px-7 py-4",
      },
      shape: {
        square: "rounded-xl",
        default: "rounded-full",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "primary",
        className:
          "border-primary text-primary md:hover:bg-primary md:hover:text-white bg-white",
      },
      {
        variant: "outline",
        color: "default",
        className:
          "border-primary text-primary md:hover:bg-primary md:hover:text-white bg-transparent",
      },
      {
        variant: "ghost",
        color: "default",
        className:
          "bg-transparent text-neutral-700 md:hover:bg-neutral-50 active:!bg-neutral-100",
      },
      {
        variant: "ghost",
        color: "primary",
        className:
          "bg-transparent text-primary md:hover:bg-primary-200 active:!bg-primary-300",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "lg",
      color: "primary",
      shape: "default",
    },
  }
);
</script>

<style scoped lang="scss"></style>
