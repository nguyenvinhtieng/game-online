import { ThirteenCard } from "../utils/get-card-thirteen";

export type GameType = 'thirteen'
export type Status = 'waiting' | 'playing' | 'finished'
export type UserStatus = 'ready' | 'unready'
export type PlayerThirteen = {
    id: string;
    name: string;
    cards: ThirteenCard[];
    score: number;
    status: UserStatus;
    turn?: string;
    position: number
}
export type ThirteenGame = {
    id: string;
    players: PlayerThirteen[];
    host: string;
    status: Status;
    turn?: string;
    gameStartAt?: Date;
    createdAt: Date;
}