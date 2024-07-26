import { defineStore } from "pinia";
import type { TicTacToeGame, Player, Status, TicTacToeMove, TicTacToePosition } from '~/types/game.tictactoe';
export const useTictactoeStore = defineStore("tictactoe", {
  state: (): TicTacToeGame => ({
    id: '',
    players: [],
    status: "waiting",
    host: '',
    turn: undefined,
    gameStartAt: undefined,
    winner: undefined,
    winnerRoute: [],
    moves: []
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
    setGameStartAt(gameStartAt?: string) {
      this.gameStartAt = gameStartAt;
    },
    setWinner(winner?: string) {
      this.winner = winner;
    },
    setWinnerRoute(winnerRoute: TicTacToePosition[]) {
      this.winnerRoute = winnerRoute;
    },
    setMoves(moves: TicTacToeMove[]) {
      this.moves = moves;
    },
  },
  getters: {
    getIdRoom(): string {
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
    getTurn(): string | undefined {
      return this.turn;
    },
    getGameStartAt(): string | undefined {
      return this.gameStartAt;
    },
    getWinner(): string | undefined {
      return this.winner;
    },
    getWinnerRoute(): TicTacToePosition[] {
      return this.winnerRoute;
    },
    getMoves(): TicTacToeMove[] {
      return this.moves;
    },
  },
});
