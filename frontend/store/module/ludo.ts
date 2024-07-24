import type { DiceData } from './../../types/game.ludo';
import { defineStore } from "pinia";
import type { Chess, LudoGame, Player, Status } from "~/types/game.ludo";
export const useLudoStore = defineStore("ludo", {
  state: (): LudoGame & { movableChess: Chess[], isDicing?: boolean} => ({
    id: "",
    players: [],
    status: "waiting" as Status,
    host: "",
    turn: undefined,
    gameEndAt: undefined,
    gameStartAt: undefined,
    winner: undefined,
    chesses: [],
    dice: undefined,
    movableChess: [],
    isDicing: false,
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
    setTurn(turn?: string) {
      this.turn = turn;
    },
    setGameEndAt(gameEndAt?: string) {
      this.gameEndAt = gameEndAt;
    },
    setGameStartAt(gameStartAt?: string) {
      this.gameStartAt = gameStartAt
    },
    setWinner(winner?: string) {
      this.winner = winner;
    },
    setChesses(chesses: Chess[]) {
      this.chesses = chesses;
    },
    getPlayerByPosition(position: number) : Player | undefined {
      return this.players.find(player => player.position === position);
    },
    getPlayerById(id: string) : Player | undefined {
      return this.players.find(player => player.id === id);
    },
    setDice(dice?: DiceData) {
      this.dice = dice;
    },
    setDicing(isDicing: boolean) {
      this.isDicing = isDicing;
    },
    setMovableChess(chesses: Chess[]) {
      this.movableChess = chesses;
    },
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
    getTurn() : string | undefined {
      return this.turn;
    },
    getGameEndAt() : string | undefined {
      return this.gameEndAt;
    },
    getGameStartAt() : string | undefined {
      return this.gameStartAt;
    },
    getWinner() : string | undefined {
      return this.winner;
    },
    getChesses() : Chess[] {
      return this.chesses;
    }
  },
});
