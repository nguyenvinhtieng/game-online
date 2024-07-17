import { ThirteenCard } from "../utils/get-card-thirteen";

export type GameType = 'thirteen'
export type Status = 'waiting' | 'playing' | 'finished'
export type UserStatus = 'ready' | 'unready'
export type ThirteenGame = {
    id: string;
    players: Record<string, {
        id: string;
        index: number;
        name: string;
        cards: ThirteenCard[];
        score: number;
        status: UserStatus;
    }>;
    host: string;
    status: Status;
    gameStartAt?: Date;
    createdAt: Date;
}