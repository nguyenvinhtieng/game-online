interface Card {
    suit: CardSuit;
    value: CardValue;
    image: string;
}

export type CardValue = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'j' | 'q' | 'k' | 'a';
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const values: CardValue[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];
const cards: Card[] = []
for (const suit of suits) {
    for (const value of values) {
        cards.push({ suit, value, image: `/images/card/${value}_${suit}.png` });
    }
}

export const CARDS = cards;