import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import generateRedisKey, { RedisKeys } from '../../utils/generate-redis-ket';
import redisClient from '../../configs/redisClient';
import { PlayerThirteen, ThirteenGame, UserStatus } from '../../types/game.thirteen.type';
import getCardThirteen, { ThirteenCard, sampleThirteenCard } from '../../utils/get-card-thirteen';
import shuffleArray from '../../utils/shuffle-array';
import { suitOrder } from '../../constants/cards';

const handleThirteenGame = (socket: Socket, io: Server) => {
    const timers: Record<string, NodeJS.Timeout> = {}
    const timersTurn: Record<string, NodeJS.Timeout> = {}
    const TIME_PREPARE_START_GAME = 5
    const TIME_TURN = 30
    socket.on('disconnect', async () => {
        // Get list of room
        const redisKey = generateRedisKey('thirteen')
        const roomsRedis = await redisClient.get(redisKey.list);
        const rooms: number[] = JSON.parse(roomsRedis || '[]');
        let isRoomListChange = false;
        // Loop rooms
        rooms.forEach(async (roomId) => {
            const { room, redisKeys : redisRoomKeys } = await getRoomDataAndKey(roomId.toString())
            if(!room) return
            // Check have this user in room in all position
            const userLeave = room.players?.find(player => player.id == socket.id)
            if (userLeave) {
                room.players = room.players?.filter(player => player.id != socket.id)
                if(room.status == 'waiting') {
                    room.gameStartAt = undefined
                    io.to(redisRoomKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                        gameStartAt: undefined
                    });
                }
                socket.leave(redisRoomKeys.detail);
                await redisClient.set(redisRoomKeys.detail, JSON.stringify(room));
                io.to(redisRoomKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.USER_LEAVE, {
                    id: socket.id,
                });
                isRoomListChange = true;
            }
            // Check have any user in socket room or not => delete room
            const roomSockets = io.sockets.adapter.rooms.get(redisRoomKeys.detail);
            if (!roomSockets || roomSockets.size == 0) {
                rooms.splice(rooms.indexOf(roomId), 1);
                await redisClient.set(redisKey.list, JSON.stringify(rooms));
                await redisClient.del(redisRoomKeys.detail);
                isRoomListChange = true;
            }
        });
        if(isRoomListChange) {
            let result = await getThirteenList()
            io.to('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
        }
        socket.leave('thirteen-register-list');
    });

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.REGISTER_LIST, async () => {
        socket.join('thirteen-register-list');
        let result = await getThirteenList()
        io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.UNREGISTER_LIST, async () => {
        socket.leave('thirteen-register-list');
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.JOIN, async (payload: {id: string}) => {
        const { id } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(id)
        if(!room || Object.keys(room).length == 0) {
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                notValidRoom: 'no-valid'
            });
            return;
        } else {
            socket.join(redisKeys.detail);
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, getRoomDataWithHideCard(room, socket.id));
        }
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.PICK_POSITION, async (payload: {id: string, position: number, name: string}) => {
        const { id, position, name } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(id)
        if(timers[redisKeys.detail]) {
            clearTimeout(timers[redisKeys.detail])
            delete timers[redisKeys.detail]
        }
        if(!room) return;
        let myIndex = room.players?.findIndex(player => player.id == socket.id)
        if (myIndex != -1) {
            room.players[myIndex].position = Number(position)
        } else {
            room.players?.push({
                id: socket.id,
                name,
                cards: [],
                score: 0,
                status: 'unready',
                position: Number(position)
            })
            room.gameStartAt = undefined;
        }
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            players: room.players,
            gameStartAt: room.gameStartAt
        });
        let result = await getThirteenList()
        io.to('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.CHANGE_NAME, async (payload: {name: string, roomId: string}) => {
        const { name, roomId } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if(!room) return;
        const myIndex = room.players.findIndex(player => player.id == socket.id)
        if (myIndex != -1) {
            room.players[myIndex].name = name
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                players: room.players
            });
            let result = await getThirteenList()
            io.to('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
        }
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS, async ({
        roomId,
        status,
    }: {roomId: string, status: UserStatus}) => {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if(timers[redisKeys.detail]) {
            clearTimeout(timers[redisKeys.detail])
            delete timers[redisKeys.detail]
        }
        if(!room) return;
        const index = room.players?.findIndex(player => player.id == socket.id)
        if(index == -1) return;
        room.players[index].status = status
        const isAllReady = room.players.every(player => player.status == 'ready')
        if(isAllReady) {
            const time = new Date();
            time.setSeconds(time.getSeconds() + TIME_PREPARE_START_GAME);
            room.gameStartAt = time
            timers[redisKeys.detail] = setTimeout(()=> {
                startGame(roomId)
            }, TIME_PREPARE_START_GAME * 1000)
        } else {
            room.gameStartAt = undefined;
        }
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            gameStartAt: room.gameStartAt || null
        });
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS, {
            id: socket.id,
            status: status
        });
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.POST_CARD, async (payload: {
        roomId: string,
        cards: ThirteenCard[]
    }) => {
        if(!payload.cards || payload.cards.length == 0 || !payload.roomId) return;
        const { room, redisKeys } = await getRoomDataAndKey(payload.roomId)
        if(!room) return;
        const myIndex = room.players?.findIndex(player => player.id == socket.id)
        if(myIndex == -1) return;
        if(room.turn != socket.id) return;
        const myCards = room.players[myIndex].cards || []
        // Check user have post my card or not
        const isValidMyCard = checkCardsHaveInCards(myCards, payload.cards)
        if(!isValidMyCard) return;
        // Get card valid to post
        const cardListType = getCardListType(payload.cards)
        if(!cardListType) return;

        // Check with prev turn to allow post card
        let prevTurn = room.prevTurn[room.prevTurn.length - 1]
        const isValidCardWithPrevTurn = checkIsValidWithPrevTurn(payload.cards, prevTurn?.id == socket.id ? prevTurn?.cards : undefined)
        if(!isValidCardWithPrevTurn) return;
        console.log('CARD VALID')
        timersTurn[redisKeys.detail] && clearTimeout(timersTurn[redisKeys.detail])
        room.prevTurn.push({
            id: socket.id,
            cards: payload.cards
        })
        room.players[myIndex].cards = myCards.filter(card => !payload.cards.some(c => c.suit == card.suit && c.weight == card.weight && c.value == card.value))
        room.turn = room.players[(myIndex + 1) % room.players.length].id
        
        if(room.players[myIndex].cards.length == 0) { // Finish game
            room.status = 'finished'
            room.gameStartAt = undefined
            room.players[myIndex].score += 1
            io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                players: room.players,
                turn: room.turn,
                prevTurn: room.prevTurn,
            });
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            return;
        }
        console.log('POST CARD')
        const time = new Date();
        time.setSeconds(time.getSeconds() + TIME_TURN);
        room.turnTimeout = time
        timersTurn[redisKeys.detail] = setTimeout(() => {
            room.turn = room.players[(myIndex + 1) % room.players.length].id
            io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                turn: room.turn,
            });
        }, TIME_TURN * 1000)

        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            turn: room.turn,
            prevTurn: room.prevTurn,
            turnTimeout: room.turnTimeout,
        });

        // Send card data
        console.log('SEND CARD DATA')
        await sendCardData(payload.roomId)
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.SKIP_TURN, async ({roomId}:{roomId: string}) => {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if(!room) return;
        if(room.turn != socket.id) return;
        const myIndex = room.players?.findIndex(player => player.id == socket.id)
        if(myIndex == -1) return;
        const prevTurn = room.prevTurn[room.prevTurn.length - 1]
        if(prevTurn?.id == socket.id) return;
        timersTurn[redisKeys.detail] && clearTimeout(timersTurn[redisKeys.detail])
        room.turn = room.players[(myIndex + 1) % room.players.length].id
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            turn: room.turn,
        });
    })

    async function startGame(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        const cards = shuffleArray(getCardThirteen())
        let firstCardUser: ThirteenCard[] = []
        if(!room) return;
        room.players = room.players?.map(player => {
            let myCards = cards.splice(-13, 13);
            myCards = myCards.sort((a, b) => {
                const valueDifference = a.weight - b.weight;
                if (valueDifference !== 0) return valueDifference;
                return suitOrder[a.suit] - suitOrder[b.suit];
            });
            firstCardUser.push(myCards[0])
            return {
                ...player,
                cards: myCards
            }
        })
        room.gameStartAt = undefined
        room.status = 'playing'
        
        // Calc turn
        let minIndex = 0;
        let minCard = firstCardUser[0];
        for (let i = 1; i < firstCardUser.length; i++) {
            if (firstCardUser[i].weight < minCard.weight || (firstCardUser[i].weight == minCard.weight && suitOrder[firstCardUser[i].suit] < suitOrder[minCard.suit])) {
                minIndex = i;
                minCard = firstCardUser[i];
            }
        }
        room.turn = room.players[minIndex].id
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            gameStartAt: room.gameStartAt,
            status: room.status,
            turn: room.turn
        });
        await sendCardData(roomId)
    }

    async function sendCardData(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if(!room) return;
        const playersId: string[] = room.players?.map(p => p.id)
        // Loop Player
        room.players.forEach((player: PlayerThirteen) => {
            const dataPlayers: PlayerThirteen[] = []
            room.players.forEach((player1: PlayerThirteen) => {
                if(player.id == player1.id) {
                    dataPlayers.push(player)
                } else {
                    dataPlayers.push({
                        ...player1,
                        cards: player1.cards?.map(() => sampleThirteenCard)
                    })
                }
            })
            io.to(player.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_CARD, dataPlayers)
        })

        const playerWithHideCard: PlayerThirteen[] = []
        room.players.forEach(player => {
            playerWithHideCard.push({
                ...player,
                cards: player.cards?.map(() => sampleThirteenCard)
            })
        })

        // Send to all user join room except playersId
        const socketIds = io.sockets.adapter.rooms.get(redisKeys.detail)
        if (socketIds) {
            // Remove playersId from socketIds
            playersId.forEach(id => {
                socketIds.delete(id);
            });
        
            const viewer: string[] = Array.from(socketIds);
            viewer.forEach(socketId => {
                io.to(socketId).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_CARD, playerWithHideCard)
            });
        }
    }
};

function checkIsValidWithPrevTurn(cards: ThirteenCard[], prevTurn?: ThirteenCard[], ) {
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
function getCardListType(cards: ThirteenCard[]) : CardListType | false {
    if (cards.length == 1) return CardListType.SINGLE;
    if (cards.length == 2) {
        if (cards[0].weight == cards[1].weight) return CardListType.PAIR;
    }
    if (cards.length == 3) {
        const isAllCardHaveSameWeight = cards.every(card => card.weight == cards[0].weight);
        if (isAllCardHaveSameWeight) return CardListType.THREE;
    }
    if (cards.length == 4) {
        const isAllCardHaveSameWeight = cards.every(card => card.weight == cards[0].weight);
        if (isAllCardHaveSameWeight) return CardListType.FOUR;
    }
    cards.sort((a, b) => a.weight - b.weight);
    let isStraight = true;
    for (let i = 1; i < cards.length; i++) {
        if (cards[i].weight - cards[i - 1].weight != 1) {
            isStraight = false;
            break;
        }
    }
    if (isStraight) return CardListType.STRAIGHT;
    
    // Check Đôi thông
    if (cards.length % 2 == 0) {
        let isPairStraight = true;
        for (let i = 0; i < cards.length; i += 2) {
            if (cards[i].weight != cards[i + 1].weight) {
                isPairStraight = false;
                break;
            }
            if (i + 2 < cards.length && cards[i].weight - cards[i + 2].weight != 1) {
                isPairStraight = false;
                break;
            }
        }
        if (isPairStraight) return CardListType.PAIR_STRAIGHT;
    }

    return false;
}

function checkCardsHaveInCards(cards: ThirteenCard[], cardsIn: ThirteenCard[]) {
    let isValid = true;
    cardsIn.forEach(card => {
        const index = cards.findIndex(c => c.suit == card.suit && c.weight == card.weight && c.value == card.value);
        if (index == -1) {
            isValid = false;
        }
    })
    return isValid;
}

async function getRoomDataAndKey(roomId: string) : Promise<{room?: ThirteenGame, redisKeys: RedisKeys }> {
    const redisKeys = generateRedisKey('thirteen', roomId);
    const roomInfo = await redisClient.get(redisKeys.detail);
    if(!roomInfo) return { redisKeys }
    const room: ThirteenGame = JSON.parse(roomInfo);
    return {
        room,
        redisKeys
    }
}

function getRoomDataWithHideCard(room: ThirteenGame, mySocketId?: string) : ThirteenGame {
    const dataPlayers: PlayerThirteen[] = []
    room.players.forEach((player: PlayerThirteen) => {
        if(player.id == mySocketId) {
            dataPlayers.push(player)
        } else {
            dataPlayers.push({
                ...player,
                cards: player.cards?.map(() => sampleThirteenCard)
            })
        }
    })
    return {
        ...room,
        players: dataPlayers
    }

}

export async function getThirteenList() {
    const redisKey = generateRedisKey('thirteen');
    const roomsRedis = await redisClient.get(redisKey.list);
    const rooms: number[] = JSON.parse(roomsRedis || '[]');
    let result = [];
    for (let i = 0; i < rooms.length; i++) {
        const { room } = await getRoomDataAndKey(rooms[i].toString())
        if(!room) continue;
        result.push({
            id: room.id,
            players: room.players?.map(player => player.name),
            createdAt: room.createdAt,
            settings: room.settings,
        });
    }
    return result;
}
export default handleThirteenGame;