// plugins/socket.io.ts
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');
export default defineNuxtPlugin((app) => {
  // console.log('Connecting to socket.io server', app.$config.public.NUXT_API);
  // const socket = io(app.$config.public.NUXT_API);
  app.provide('socket', socket);
});
