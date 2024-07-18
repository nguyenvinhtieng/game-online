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
    const TIME_PREPARE_START_GAME = 5
    socket.on('disconnect', async () => {
        // Get list of room
        const redisKey = generateRedisKey('thirteen')
        const roomsRedis = await redisClient.get(redisKey.list);
        const rooms: number[] = JSON.parse(roomsRedis || '[]');
        let isRoomListChange = false;
        // Loop rooms
        rooms.forEach(async (roomId) => {
            const { room, redisKeys : redisRoomKeys } = await getRoomDataAndKey(roomId.toString())
            // Check have this user in room in all position
            await redisClient.del(redisRoomKeys.detail);
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
        socket.join(redisKeys.detail);
        if(Object.keys(room).length == 0) {
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                notValidRoom: 'no-valid'
            });
            return;
        } else {
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, room);
        }
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.PICK_POSITION, async (payload: {id: string, position: number, name: string}) => {
        const { id, position, name } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(id)
        if(timers[redisKeys.detail]) {
            clearTimeout(timers[redisKeys.detail])
            delete timers[redisKeys.detail]
        }
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
        const index = room.players.findIndex(player => player.id == socket.id)
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


    async function startGame(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        const cards = shuffleArray(getCardThirteen())
        let firstCardUser: ThirteenCard[] = []
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


async function getRoomDataAndKey(roomId: string) : Promise<{room: ThirteenGame, redisKeys: RedisKeys }> {
    const redisKeys = generateRedisKey('thirteen', roomId);
    const roomInfo = await redisClient.get(redisKeys.detail);
    const room: ThirteenGame = JSON.parse(roomInfo || '{}');
    return {
        room,
        redisKeys
    }
}

export async function getThirteenList() {
    const redisKey = generateRedisKey('thirteen');
    const roomsRedis = await redisClient.get(redisKey.list);
    const rooms: number[] = JSON.parse(roomsRedis || '[]');
    let result = [];
    for (let i = 0; i < rooms.length; i++) {
        const { room } = await getRoomDataAndKey(rooms[i].toString())
        result.push({
            id: room.id,
            players: room.players?.map(player => player.name),
            createdAt: room.createdAt,
        });
    }
    return result;
}
export default handleThirteenGame;