// plugins/socket.io.ts
import { io } from 'socket.io-client';

export default defineNuxtPlugin((app) => {
  const socket = io(app.$config.public.NUXT_API)
  app.provide('socket', socket);
});
