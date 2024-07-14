export type GAMES_TYPE = 'thirteen';

interface GameItem {
    thumbnail: string;
    name: string;
    description?: string;
    link: string;
    type: GAMES_TYPE;
}


export const GAMES: GameItem[] = [
    {
        thumbnail: '/images/game-thumbnail/tien-len.png',
        name: 'Bài Tiến lên',
        description: 'Chơi bài tiến lên miền nam',
        link: '/game/thirteen',
        type: 'thirteen'
    }
];