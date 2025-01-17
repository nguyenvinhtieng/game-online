import { ThirteenCard } from "../utils/get-card-thirteen";

export type Status = 'waiting' | 'playing' | 'finished'
export type UserStatus = 'ready' | 'unready' | 'disconnect'
export type SettingThirteenGame = {
    maxPlayers?: number;
    winScore: number;
    turnTimeout: number;
}
export type PlayerThirteen = {
    id: string;
    name: string;
    cards: ThirteenCard[];
    score: number;
    status: UserStatus;
    turn?: string;
    position: number;
}
export type ThirteenGame = {
    id: string;
    players: PlayerThirteen[];
    host: string;
    status: Status;
    turn?: string;
    gameStartAt?: Date;
    turnTimeout?: Date;
    createdAt: Date;
    prevTurn: {
        id: string;
        cards: ThirteenCard[];
    }[],
    settings: SettingThirteenGame;
    winner?: string;
    winHistory: string[]
}