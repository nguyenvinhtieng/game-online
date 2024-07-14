// types/vue-shim.d.ts
import { Socket } from 'socket.io-client';

declare module 'vue/types/vue' {
  interface Vue {
    $socket: Socket;
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $socket: Socket;
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $socket: Socket;
  }
}
