
export type LudoColor = "red" | "green" | "blue" | "yellow";
export type Status = "waiting" | "playing" | "finished";
export type UserStatus = 'ready' | 'unready' | 'disconnect';
export type ChessStatus = 'home' | 'playing' | 'arrived'
export type LudoPosition = 1 | 2 | 3 | 4;
export type Dice = 1 | 2 | 3 | 4 | 5 | 6
export type DiceData = {
  seek: number,
  value: Dice
}
export type LudoRouteCell = {
  x: number;
  y: number;
  index: number;
  isStartPlace?: boolean;
  isEndPlace?: boolean;
  color: LudoColor;
}
export type LudoDestination = Omit<LudoRouteCell, 'isStartPlace' |'isEndPlace'>
export type Chess = {
  x: number,
  y: number,
  color: LudoColor,
  status: ChessStatus,
  arrivedAt?: number,
}
export type Player = {
  id: string;
  name: string;
  status: UserStatus;
  position: LudoPosition;
};

export type LudoGame = {
  id: string;
  players: Player[];
  status: Status;
  host: string;
  turn?: string;
  gameStartAt?: string;
  gameEndAt?: string;
  winner?: string;
  chesses: Chess[];
  dice?: DiceData
};