import { defineStore } from "pinia";
export type UserData = {
    name: string;
};
export const useUserStore = defineStore("user", {
  state: () : UserData => ({
    name: generateRandomName(),
  }),
  actions: {
    setName(name: string) {
      this.name = name;
    },
  },
  getters: {
    getName(): string {
      return this.name;
    },
  },
});
