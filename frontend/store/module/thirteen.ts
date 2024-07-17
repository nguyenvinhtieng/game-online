import { defineStore } from "pinia";
import type { CardSuit, CardValue } from "~/constants";
export type Status = "waiting" | "playing" | "finished";
export type UserStatus = 'ready' | 'unready'
export type ThirteenCard = {
  suit: CardSuit,
  value: CardValue,
  weight: number
}
export type Player = {
  id: string;
  index: number;
  name: string;
  cards: ThirteenCard[];
  status: UserStatus;
  score: number;
};
export type PlayerList = Record<string, Player>;
export type GameData = {
  id: string;
  players: PlayerList;
  host: string;
  status: Status;
  me?: Player;
  gameStartAt?: Date;
};
export const useThirteenStore = defineStore("thirteen", {
  state: (): GameData => ({
    id: "",
    players: {},
    status: "waiting" as Status,
    host: "",
    me: undefined,
    gameStartAt: undefined,
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
    setMe(me?: Player) {
      this.me = me;
    },
    setGameStartAt(gameStartAt?: Date) {
      this.gameStartAt = gameStartAt
    }
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
    getMe(): Player | undefined {
      return this.me;
    },
    getGameStartAt() : Date | undefined {
      return this.gameStartAt;
    }
  },
});
