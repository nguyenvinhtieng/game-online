export type GameType = 'thirteen'

export type ThirteenGame = {
    id: string;
    players: string[];
    host: string;
    status: 'waiting' | 'playing' | 'finished';
}