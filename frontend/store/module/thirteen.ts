import { defineStore } from "pinia";
export type Status = "waiting" | "playing" | "finished";

export type Player = {
  id: string;
  index: number;
  name: string;
  cards: string[];
  status: Status;
};
export type PlayerList = Record<string, Player>;
export type GameData = {
  id: string;
  players: PlayerList;
  host: string;
  status: "waiting" | "playing" | "finished";
};
export const useThirteenStore = defineStore("thirteen", {
  state: (): GameData => ({
    id: "",
    players: {},
    status: "waiting" as Status,
    host: "",
  }),
  actions: {
    setIdRoom(id: string) {
      this.id = id;
    },
    setPlayers(players: PlayerList) {
      this.players = players;
    },
    setStatus(status: Status) {
      this.status = status;
    },
    setHost(host: string) {
      this.host = host;
    },
  },
  getters: {
    getId(): string {
      return this.id;
    },
    getPlayers(): PlayerList {
      return this.players;
    },
    getStatus(): Status {
      return this.status;
    },
    getHost(): string {
      return this.host;
    },
  },
});
