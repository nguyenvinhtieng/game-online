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
  name: string;
  cards: ThirteenCard[];
  status: UserStatus;
  score: number;
  position: number;
};
export type MePlayer = Omit<Player, "cards"> & {
  cards: (ThirteenCard & {
    isSelected?: boolean
  })[]
}
export type GameData = {
  id: string;
  players: Player[];
  host: string;
  status: Status;
  me?: MePlayer;
  gameStartAt?: string;
  turn?: string;
};
export const useThirteenStore = defineStore("thirteen", {
  state: (): GameData => ({
    id: "",
    players: [],
    status: "waiting" as Status,
    host: "",
    me: undefined,
    gameStartAt: undefined,
    turn: undefined,
  }),
  actions: {
    setIdRoom(id: string) {
      this.id = id;
    },
    setPlayers(players: Player[]) {
      this.players = players;
    },
    setStatus(status: Status) {
      this.status = status;
    },
    setHost(host: string) {
      this.host = host;
    },
    setMe(me?: MePlayer) {
      this.me = me;
    },
    setTurn(turn?: string) {
      this.turn = turn;
    },
    setGameStartAt(gameStartAt?: string) {
      this.gameStartAt = gameStartAt
    },
    getPlayer(id: string): Player | undefined {
      return this.players.find((player) => player.id === id);
    },
    getPlayerIndex(id: string) : number {
      return this.players.findIndex((player) => player.id === id);
    },
    setPlayerStatus(id: string, status: UserStatus) {
      const playerIndex = this.getPlayerIndex(id);
      if(playerIndex === -1) return;
      this.players[playerIndex].status = status;
    },
    setCardUser(id: string, cards?: ThirteenCard[]) {
      const playerIndex = this.getPlayerIndex(id);
      if(playerIndex === -1) return;
      this.players[playerIndex].cards = cards || [];
    },
    toggleCardSelected(cardIndex: number) {
      if(!this.me) return;
      this.me.cards[cardIndex].isSelected = !this.me.cards[cardIndex].isSelected;
    }
  },
  getters: {
    getId(): string {
      return this.id;
    },
    getPlayers(): Player[] {
      return this.players;
    },
    getStatus(): Status {
      return this.status;
    },
    getHost(): string {
      return this.host;
    },
    getMe(): MePlayer | undefined {
      return this.me;
    },
    getGameStartAt() : string | undefined {
      return this.gameStartAt;
    },
    getTurn() : string | undefined {
      return this.turn;
    },
  },
});
