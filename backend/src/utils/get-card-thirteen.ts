import CARDS, { Card, CardValue } from "../constants/cards";
export type ThirteenCard = Card & {weight: number}
const valueMapWeight: Record<CardValue, number> = {
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "j": 11,
    'q': 12,
    'k': 13,
    'a': 14,
    '2': 16 
}
export default function getCardThirteen(): ThirteenCard[] {
    return CARDS.map(card => {
        return {
            ...card,
            weight: valueMapWeight[card.value]
        }
    })
}