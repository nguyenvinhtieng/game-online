export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardValue = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'j' | 'q' | 'k' | 'a';
export type Card = {
    suit: CardSuit,
    value: CardValue,
}

const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const values: CardValue[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];

const CARDS: Card[] = [];

export const suitOrder: Record<CardSuit, number> = {
    'hearts': 4,
    'diamonds': 3,
    'clubs': 2,
    'spades': 1
};

for (const suit of suits) {
    for (const value of values) {
        CARDS.push({ suit, value });
    }
}

export default CARDS;
