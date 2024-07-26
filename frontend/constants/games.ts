export type GAMES_TYPE = 'thirteen' | 'ludo' | 'tictactoe';

export type GameItem = {
    thumbnail: string;
    name: string;
    link: string;
    type: GAMES_TYPE;
}


export const GAMES: GameItem[] = [
    {
        thumbnail: '/images/game-thumbnail/thirteen.png',
        name: 'Meow Lên',
        link: '/thirteen',
        type: 'thirteen'
    },
    {
        thumbnail: '/images/game-thumbnail/ludo.png',
        name: 'Đua mèo',
        link: '/ludo',
        type: 'ludo'
    },
    {
        thumbnail: '/images/game-thumbnail/tictactoe.png',
        name: 'Ít Ô',
        link: '/tictactoe',
        type: 'tictactoe'
    }
];