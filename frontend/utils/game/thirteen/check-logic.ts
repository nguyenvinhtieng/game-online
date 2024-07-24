import type { CardSuit } from "~/constants";
import type { ThirteenCard } from "~/store/module/thirteen";
export const suitOrder: Record<CardSuit, number> = {
    'hearts': 4,
    'diamonds': 3,
    'clubs': 2,
    'spades': 1
};
export function checkIsValidWithPrevTurn(cards: ThirteenCard[], prevTurn?: ThirteenCard[], ) {
    if(!prevTurn) return true;
    const cardListType = getCardListType(cards)
    const prevTurnCardListType = getCardListType(prevTurn)
    if(!cardListType || !prevTurnCardListType) return false;

    // Kiểm tra trùm bài
    if (prevTurnCardListType == CardListType.SINGLE && prevTurn[0].weight == 16 
        && (cardListType == CardListType.FOUR || cardListType == CardListType.PAIR_STRAIGHT)) { // Trùm 1 con 2
        return true;
    }
    if (prevTurnCardListType == CardListType.PAIR && prevTurn[0].weight == 16 
        && (cardListType == CardListType.FOUR || (cardListType == CardListType.PAIR_STRAIGHT && cards.length >= 8))) { // Trùm 2 con 2 bằng 4 đôi thông hoặc tứ quý
        return true;
    }
    // Kiểm tra trường hợp trước là 3 đôi thông và hiện tại là tứ quý
    if(prevTurnCardListType == CardListType.PAIR_STRAIGHT && prevTurn.length == 6 && cardListType == CardListType.FOUR) {
        return true;
    }
    // Trường hợp trước là tứ quý và hiện tại là 4 đôi thông trở lên
    if(prevTurnCardListType == CardListType.FOUR && cardListType == CardListType.PAIR_STRAIGHT && cards.length >= 8) {
        return true;
    }
    // Kiểm tra loại bài
    if (cardListType != prevTurnCardListType) return false;
    // Kiểm tra số lượng bài
    if (cards.length != prevTurn.length) return false;
    // Kiểm tra quân lớn nhất mỗi bên
    const largestCardOfPrevTurn = prevTurn[prevTurn.length - 1];
    const largestCardOfCurrentTurn = cards[cards.length - 1];
    if (largestCardOfCurrentTurn.weight < largestCardOfPrevTurn.weight) return false;
    if (largestCardOfCurrentTurn.weight == largestCardOfPrevTurn.weight && suitOrder[largestCardOfCurrentTurn.suit] <= suitOrder[largestCardOfPrevTurn.suit]) return false;
    return true;
}
enum CardListType {
    SINGLE = 'SINGLE',
    PAIR = 'PAIR',
    THREE = 'THREE',
    FOUR = 'FOUR',
    STRAIGHT = 'STRAIGHT',
    PAIR_STRAIGHT = 'PAIR_STRAIGHT',
}
export function getCardListType(cards: ThirteenCard[]) : CardListType | false {
    if (cards.length == 0) return false;
    if (cards.length == 1) return CardListType.SINGLE;
    if (cards.length == 2) {
        if (cards[0].weight == cards[1].weight) return CardListType.PAIR;
        else return false;
    }
    if (cards.length == 3) {
        const isAllCardHaveSameWeight = cards.every(card => card.weight == cards[0].weight);
        if (isAllCardHaveSameWeight) return CardListType.THREE;
    }
    if (cards.length == 4) {
        const isAllCardHaveSameWeight = cards.every(card => card.weight == cards[0].weight);
        if (isAllCardHaveSameWeight) return CardListType.FOUR;
    }
    let isStraight = true;
    for (let i = 1; i < cards.length; i++) {
        if (cards[i].weight - cards[i - 1].weight != 1) {
            isStraight = false;
            break;
        }
    }
    if (isStraight) return CardListType.STRAIGHT;
    
    // Check Đôi thông
    if (cards.length % 2 == 0 && cards.length >= 6) {
        let isPairStraight = true;
        for (let i = 0; i < cards.length; i += 2) {
            if (cards[i].weight != cards[i + 1].weight) {
                isPairStraight = false;
                break;
            }
            if(i >= 2 && cards[i].weight - cards[i - 2].weight != 1) {
                isPairStraight = false;
                break;
            }
        }
        if (isPairStraight) return CardListType.PAIR_STRAIGHT;
    }

    return false;
}