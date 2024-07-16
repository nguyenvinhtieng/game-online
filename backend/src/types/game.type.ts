export type GameType = 'thirteen'
export type Status = 'waiting' | 'playing' | 'finished'
export type ThirteenGame = {
    id: string;
    players: Record<string, {
        id: string;
        index: number;
        name: string;
        cards: string[];
        score: number;
        status: Status;
    }>;
    host: string;
    status: Status;
    createdAt: Date;
}