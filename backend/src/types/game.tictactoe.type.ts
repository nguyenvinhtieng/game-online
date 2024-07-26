export type Status = "waiting" | "playing" | "finished";
export type UserStatus = 'ready' | 'unready' | 'disconnect';
export type TicTacToePosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export enum PlayerTypeEnum {
  X = 'x',
  O = 'o',
}
export type PlayerType = PlayerTypeEnum.X | PlayerTypeEnum.O
export type Player = {
  id: string;
  name: string;
  status: UserStatus;
  position: PlayerType;
  score: number;
};
export type TicTacToeMove = {
  position: TicTacToePosition,
  id: string,
}
export type TicTacToeGame = {
  id: string;
  players: Player[];
  status: Status;
  host: string;
  turn?: string;
  gameStartAt?: string;
  winner?: string;
  winnerRoute: number[]
  moves: TicTacToeMove[]
};