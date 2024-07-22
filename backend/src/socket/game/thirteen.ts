import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import generateRedisKey, { RedisKeys } from '../../utils/generate-redis-ket';
import redisClient from '../../configs/redisClient';
import { PlayerThirteen, ThirteenGame, UserStatus } from '../../types/game.thirteen.type';
import getCardThirteen, { ThirteenCard, sampleThirteenCard } from '../../utils/get-card-thirteen';
import shuffleArray from '../../utils/shuffle-array';
import { suitOrder } from '../../constants/cards';
import jwt from 'jsonwebtoken';
const jwtKey = process.env.JWT_SECRET || 'jwt-key';
const handleThirteenGame = (socket: Socket, io: Server) => {
    const timers: Record<string, NodeJS.Timeout> = {}
    const timersTurn: Record<string, NodeJS.Timeout> = {}
    const TIME_PREPARE_START_GAME = 5
    const TIME_TURN = 3
    socket.on('disconnect', async () => {
        // Get list of room
        const redisKey = generateRedisKey('thirteen')
        const roomsRedis = await redisClient.get(redisKey.list);
        const rooms: number[] = JSON.parse(roomsRedis || '[]');
        let isRoomListChange = false;
        // Loop rooms
        rooms.forEach(async (roomId) => {
            const { room, redisKeys: redisRoomKeys } = await getRoomDataAndKey(roomId.toString())
            if (!room) return
            // rooms.splice(rooms.indexOf(roomId), 1);
            // await redisClient.set(redisKey.list, JSON.stringify(rooms));
            // await redisClient.del(redisRoomKeys.detail);
            // return;
            // Check have this user in room in all position
            const userLeave = room.players?.find(player => player.id == socket.id)
            if (userLeave) {
                if (room.status == 'waiting' || room.status == 'finished') {
                    room.players = room.players?.filter(player => player.id != socket.id)
                    room.gameStartAt = undefined
                    io.in(redisRoomKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                        gameStartAt: undefined,
                        players: room.players || []
                    });
                    await redisClient.set(redisRoomKeys.detail, JSON.stringify(room));
                    isRoomListChange = true;
                } else if(room.status == 'playing') {
                    const userLeaveIndex = room.players.findIndex(player => player.id == socket.id)
                    room.players[userLeaveIndex].status = 'disconnect'
                    if (room.turn == socket.id) {
                        await nextTurn(roomId.toString())
                    }
                    await redisClient.set(redisRoomKeys.detail, JSON.stringify(room));
                    io.in(redisRoomKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS,  {
                        id: socket.id,
                        status: 'disconnect'
                    })
                }
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
        if (isRoomListChange) {
            let result = await getThirteenList()
            io.in('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
        }
        socket.leave('thirteen-register-list');
    });

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.RE_CONNECT, async (payload: { roomId: string, token: string }) => {
        const { roomId, token } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if (!room) return;
        jwt.verify(token, jwtKey, async (err, decoded) => {
            if (err || !decoded) return;
            if(typeof decoded == 'string') return;
            const userId = decoded.id;
            const index = room.players.findIndex(player => player.id == userId)
            const user = room.players[index]
            if (!user || user.status != 'disconnect') return;
            // Change id to new socket id
            room.players[index].status = 'ready';
            room.players[index].id = socket.id
            room.prevTurn = room.prevTurn.map(turn => {
                return {
                    ...turn,
                    id: turn.id == userId ? socket.id : turn.id
                }
            })
            room.winHistory = room.winHistory.map(w => {
                return w == userId ? socket.id : w
            })
            room.turn = room.turn == userId ? socket.id : room.turn
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                players: room.players,
                prevTurn: room.prevTurn,
                winHistory: room.winHistory,
                turn: room.turn,
            });
            let newToken = jwt.sign({ id: socket.id }, jwtKey, {
                expiresIn: '1h'
            })
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.USER_TOKEN, {
                token: newToken
            });
            await sendCardData(roomId)
        });
        
    })


    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.REGISTER_LIST, async () => {
        socket.join('thirteen-register-list');
        let result = await getThirteenList()
        io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.UNREGISTER_LIST, async () => {
        socket.leave('thirteen-register-list');
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.JOIN, async (payload: { id: string }) => {
        const { id } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(id)
        if (!room || Object.keys(room).length == 0) {
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                notValidRoom: 'no-valid'
            });
        } else {
            socket.join(redisKeys.detail);
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, getRoomDataWithHideCard(room, socket.id));
        }
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.PICK_POSITION, async (payload: { id: string, position: number, name: string }) => {
        const { id, position, name } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(id)
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Phòng không tồn tại', type: 'error' })
            return;
        };
        let myIndex = room.players?.findIndex(player => player.id == socket.id)
        if (myIndex != -1) {
            room.players[myIndex].position = Number(position)
        } else {
            // Check position have user or not
            const isPositionHaveUser = room.players?.some(player => player.position == Number(position))
            if (isPositionHaveUser) return
            room.players?.push({
                id: socket.id,
                name,
                cards: [],
                score: 0,
                status: 'unready',
                position: Number(position)
            })
            if (timers[redisKeys.detail]) {
                clearTimeout(timers[redisKeys.detail])
                delete timers[redisKeys.detail]
            }
            room.gameStartAt = undefined;
            // Generate token
            const token = jwt.sign({ id: socket.id }, jwtKey, {
                expiresIn: '1h'
            })
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.USER_TOKEN, {
                token: token
            });
        }
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            players: room.players,
            gameStartAt: room.gameStartAt
        });
        let result = await getThirteenList()
        io.in('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.CHANGE_NAME, async (payload: { name: string, roomId: string }) => {
        const { name, roomId } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Phòng không tồn tại', type: 'error' })
            return;
        }
        const myIndex = room.players.findIndex(player => player.id == socket.id)
        if (myIndex != -1) {
            room.players[myIndex].name = name
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                players: room.players
            });
            let result = await getThirteenList()
            io.in('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
        }
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS, async ({
        roomId,
        status,
    }: { roomId: string, status: UserStatus }) => {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if (timers[redisKeys.detail]) {
            clearTimeout(timers[redisKeys.detail])
            delete timers[redisKeys.detail]
        }
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Phòng không tồn tại', type: 'error' })
            return;
        }
        const index = room.players?.findIndex(player => player.id == socket.id)
        if (index == -1) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Bạn không phải là thành viên của phòng này', type: 'error' })
            return;
        }
        room.players[index].status = status
        const isAllReady = room.players.every(player => player.status == 'ready')
        if (isAllReady) {
            const time = new Date();
            time.setSeconds(time.getSeconds() + TIME_PREPARE_START_GAME);
            room.gameStartAt = time
            timers[redisKeys.detail] = setTimeout(() => {
                startGame(roomId)
            }, TIME_PREPARE_START_GAME * 1000)
        } else {
            room.gameStartAt = undefined;
        }
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            gameStartAt: room.gameStartAt || null
        });
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS, {
            id: socket.id,
            status: status
        });
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.POST_CARD, async (payload: { roomId: string, cards: ThirteenCard[] }) => {
        if (!payload.cards || payload.cards.length == 0 || !payload.roomId) return;
        const { room, redisKeys } = await getRoomDataAndKey(payload.roomId)
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Phòng không tồn tại!', type: 'error' })
            return;
        }
        const myIndex = room.players?.findIndex(player => player.id == socket.id)
        if (myIndex == -1) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Bạn không phải là thành viên của phòng này', type: 'error' })
            return;
        };
        if (room.turn != socket.id) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Đây không phải là lượt đánh của bạn!', type: 'error' })
            return;
        };
        const myCards = room.players[myIndex].cards || []
        // Check user have post my card or not
        const isValidMyCard = checkCardsHaveInCards(myCards, payload.cards)
        if (!isValidMyCard) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Bài không hợp lệ', type: 'error' })
            return;
        }
        // Check card valid to post
        const cardListType = getCardListType(payload.cards)
        
        if (!cardListType) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Bài không hợp lệ', type: 'error' })
            return;
        }

        // Case First turn, check have lowest card
        if (room.prevTurn.length == 0 && room.winHistory.length == 0) {
            // Need to be have first card
            if (payload.cards[0].suit != room.players[myIndex].cards[0].suit || payload.cards[0].weight != room.players[myIndex].cards[0].weight) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Bạn cần phải đánh quân nhỏ nhất', type: 'error' })
                return;
            }
        }
        

        // Check with prev turn to allow post card
        let prevTurn = room.prevTurn[room.prevTurn.length - 1]
        const isValidCardWithPrevTurn = checkIsValidWithPrevTurn(payload.cards, prevTurn?.id != socket.id ? prevTurn?.cards : undefined)
        if (!isValidCardWithPrevTurn) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Bài không hợp lệ', type: 'error' })
            return;
        }
        if (timersTurn[redisKeys.detail]) {
            clearTimeout(timersTurn[redisKeys.detail])
            delete timersTurn[redisKeys.detail]
        }
        switch (cardListType) { // Show notification
            case CardListType.FOUR:
            case CardListType.PAIR_STRAIGHT:
                if (cardListType == CardListType.FOUR) {
                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME_NOTIFICATION, {
                        message: 'Tứ quý'
                    })
                } else {
                    const num = payload.cards.length / 2
                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME_NOTIFICATION, {
                        message: num + ' Đôi thông'
                    })
                }
                let score = 0;
                let cardTurnHave2;
                let tmpPrevTurn = [...room.prevTurn]
                while(tmpPrevTurn.length > 0) {
                    let prev = tmpPrevTurn.pop()
                    if(!prev) break;
                    let typePrev = getCardListType(prev.cards)
                    if(typePrev == CardListType.PAIR_STRAIGHT) {
                        continue;
                    } else if(prev.cards.every(card => card.weight == 16)) {
                        cardTurnHave2 = prev.cards;
                        break;
                    } else {
                        break;
                    }
                }

                if(cardTurnHave2) {
                    cardTurnHave2.forEach(card => {
                        if (card.suit == 'hearts' || card.suit == 'diamonds') {
                            score += room.settings.winScore
                        } else {
                            score += room.settings.winScore / 2
                        }
                    })
                }

                const prevIndex = room.players?.findIndex(player => player.id == prevTurn.id)
                if(score != 0 && prevIndex && prevIndex != myIndex) {
                    room.players[myIndex].score += score;
                    room.players[prevIndex].score = room.players[prevIndex].score - score < 0 ? 0 : room.players[prevIndex].score - score;
                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.USER_NOTIFICATION, {
                        notifications: [
                            {
                                id: room.players[myIndex].id,
                                message: `+${score}`,
                                type: 'success'
                            },
                            {
                                id: room.players[prevIndex].id,
                                message: `-${score}`,
                                type: 'error'
                            }
                        ]
                    })

                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_USERS_SCORE, 
                        room.players.map(i => {
                        return {id: i.id, score: i.score}
                    }))
                }

                break;
            case CardListType.PAIR:
                if (payload.cards[0].value == '2')
                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME_NOTIFICATION, {
                        message: 'Đôi heo'
                    })
                break;
            case CardListType.THREE:
                if (payload.cards[0].value == '2')
                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME_NOTIFICATION, {
                        message: 'Ba con heo'
                    })
                break;
            default:
                break;
        }

        room.players[myIndex].cards = myCards.filter(card => !payload.cards.some(c => c.suit == card.suit && c.weight == card.weight && c.value == card.value))

        if (room.players[myIndex].cards.length != 0) { // Not win
            const myPosition = room.players[myIndex].position
            const positions = room.players.map(player => player.position).sort((a, b) => a - b)
            const nextPosition = positions.find(position => position > myPosition) || positions[0]
            const nextPlayer = room.players.find(player => player.position == nextPosition)
            room.turn = nextPlayer?.id
        }


        room.prevTurn.push({
            id: socket.id,
            cards: payload.cards
        })


        // Change turn to user have next position on list players
        // const time = new Date();
        // time.setSeconds(time.getSeconds() + TIME_TURN);
        // room.turnTimeout = time
        // timersTurn[redisKeys.detail] = setTimeout(async () => {
        //     await nextTurn(payload.roomId)
        // }, TIME_TURN * 1000)
        room.turnTimeout = undefined

        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            prevTurn: room.prevTurn,
            turn: room.turn,
            turnTimeout: room.turnTimeout || null,
        });

        // Save
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        // Send card data
        await sendCardData(payload.roomId)


        if (room.players[myIndex].cards.length == 0) { // Finish game
            setTimeout(async () => {
                const { room: room1, redisKeys } = await getRoomDataAndKey(room.id)
                if (!room1) return;
                room1.status = 'finished'
                room1.gameStartAt = undefined
                room1.players[myIndex].score += room1.settings.winScore
                room1.winner = room1.players[myIndex].id
                room1.winHistory.push(room1.players[myIndex].id)
                room1.players = room1.players.filter(player => player.status != 'disconnect')
                io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                    players: room1.players,
                    prevTurn: room1.prevTurn,
                    status: room1.status,
                    gameStartAt: room1.gameStartAt,
                    winner: room1.winner,
                    winHistory: room1.winHistory
                });
                await redisClient.set(redisKeys.detail, JSON.stringify(room1));

                setTimeout(async () => {
                    const time = new Date();
                    time.setSeconds(time.getSeconds() + TIME_PREPARE_START_GAME);
                    const { room: room2, redisKeys } = await getRoomDataAndKey(room.id)
                    if (!room2) return;
                    room2.gameStartAt = time
                    timers[redisKeys.detail] = setTimeout(() => {
                        startGame(room2.id)
                    }, TIME_PREPARE_START_GAME * 1000)
                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                        gameStartAt: room2.gameStartAt || null,
                        status: 'waiting'
                    });
                }, 5000)
            }, 2000)
        }
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.SKIP_TURN, async ({ roomId }: { roomId: string }) => {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Phòng không tồn tại!', type: 'error' })
            return;
        }
        if (room.turn != socket.id) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Đây không phải là lượt đánh của bạn!', type: 'error' })
            return;
        }
        const myIndex = room.players?.findIndex(player => player.id == socket.id)
        if (myIndex == -1) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Bạn không phải là người chơi của phòng này!', type: 'error' })
            return;
        }
        const prevTurn = room.prevTurn[room.prevTurn.length - 1]
        if (prevTurn?.id == socket.id || room.prevTurn.length == 0) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Không thể qua lượt!', type: 'error' })
            return;
        }
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.USER_NOTIFICATION, {
            notifications: [
                {
                    id: room.players[myIndex].id,
                    message: `Bỏ lượt`,
                    type: 'error'
                }
            ]
        })
        await nextTurn(roomId);
    })

    async function nextTurn(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Phòng không tồn tại!', type: 'error' })
            return;
        }
        const currentTurn = room.turn
        const myIndex = room.players?.findIndex(player => player.id == currentTurn)
        if (myIndex == -1) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, { message: 'Bạn không phải là người chơi của phòng này!', type: 'error' })
            return;
        }
        if (timersTurn[redisKeys.detail]) {
            // console.log('Clear time out at next')
            clearTimeout(timersTurn[redisKeys.detail])
            delete timersTurn[redisKeys.detail]
        }
        const myPosition = room.players[myIndex].position
        const positions = room.players.map(player => player.position).sort((a, b) => a - b)
        const nextPosition = positions.find(position => position > myPosition) || positions[0]
        const nextPlayer = room.players.find(player => player.position == nextPosition)
        room.turn = nextPlayer?.id

        // if (room.prevTurn[room.prevTurn.length - 1]?.id != nextPlayer?.id) {
        //     const time = new Date();
        //     time.setSeconds(time.getSeconds() + TIME_TURN);
        //     room.turnTimeout = time
        //     timersTurn[redisKeys.detail] = setTimeout(async () => {
        //         console.log('Running timeout next::', room.players[myIndex].name)
        //         await nextTurn(roomId)

        //     }, TIME_TURN * 1000)
        // } else {
        //     room.turnTimeout = undefined
        // }
        room.turnTimeout = undefined

        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            turn: room.turn,
            turnTimeout: room.turnTimeout || null,
        });
    }

    async function startGame(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        const cards = shuffleArray(getCardThirteen())
        let firstCardUser: ThirteenCard[] = []
        if (!room) return;
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
        const isAFirstGame = room.winHistory.length == 0;
        if (isAFirstGame) {
            let minIndex = 0;
            let minCard = firstCardUser[0];
            for (let i = 1; i < firstCardUser.length; i++) {
                if (firstCardUser[i].weight < minCard.weight || (firstCardUser[i].weight == minCard.weight && suitOrder[firstCardUser[i].suit] < suitOrder[minCard.suit])) {
                    minIndex = i;
                    minCard = firstCardUser[i];
                }
            }
            room.turn = room.players[minIndex].id
        } else {
            room.turn = room.winHistory[room.winHistory.length - 1]
        }
        room.prevTurn = []
        room.winner = undefined;
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            gameStartAt: room.gameStartAt || null,
            status: room.status,
            turn: room.turn,
            winner: null,
            prevTurn: room.prevTurn,
        });
        await sendCardData(roomId)
    }

    async function sendCardData(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if (!room) return;
        const playersId: string[] = room.players?.map(p => p.id)
        // Loop Player
        room.players.forEach((player: PlayerThirteen) => {
            const dataPlayers: PlayerThirteen[] = []
            room.players.forEach((player1: PlayerThirteen) => {
                if (player.id == player1.id) {
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
        const socketIdsCopy = new Set(socketIds)
        if (socketIds) {
            // Remove playersId from socketIds
            playersId.forEach(id => {
                socketIdsCopy.delete(id);
            });

            const viewer: string[] = Array.from(socketIdsCopy);
            viewer.forEach(socketId => {
                io.to(socketId).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_CARD, playerWithHideCard)
            });
        }
    }
};

function checkIsValidWithPrevTurn(cards: ThirteenCard[], prevTurn?: ThirteenCard[]) {
    if (!prevTurn) return true;
    const cardListType = getCardListType(cards)
    const prevTurnCardListType = getCardListType(prevTurn)
    if (!cardListType || !prevTurnCardListType) return false;

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

function checkCardIs2(cards: ThirteenCard[]) {
    return cards.every(card => card.weight == 16)
}


function getCardListType(cards: ThirteenCard[]): CardListType | false {
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
    if (cards.length % 2 == 0) {
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

async function getRoomDataAndKey(roomId: string): Promise<{ room?: ThirteenGame, redisKeys: RedisKeys }> {
    const redisKeys = generateRedisKey('thirteen', roomId);
    const roomInfo = await redisClient.get(redisKeys.detail);
    if (!roomInfo) return { redisKeys }
    const room: ThirteenGame = JSON.parse(roomInfo);
    return {
        room,
        redisKeys
    }
}

function getRoomDataWithHideCard(room: ThirteenGame, mySocketId?: string): ThirteenGame {
    const dataPlayers: PlayerThirteen[] = []
    room.players.forEach((player: PlayerThirteen) => {
        if (player.id == mySocketId) {
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
        if (!room) continue;
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