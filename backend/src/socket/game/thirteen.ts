import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import generateRedisKey from '../../utils/generate-redis-ket';
import redisClient from '../../configs/redisClient';
import { ThirteenGame, UserStatus } from '../../types/game.type';
import getCardThirteen, { ThirteenCard } from '../../utils/get-card-thirteen';
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
        // Loop rooms
        rooms.forEach(async (roomId) => {
            const {detail: redisRoomDetailKey} = generateRedisKey('thirteen', roomId.toString());
            const roomInfo = await redisClient.get(redisRoomDetailKey);
            const room: ThirteenGame = JSON.parse(roomInfo || '{}');
            // Check have this user in room in all position
            let haveUser = false;
            let oldPosition = '';
            Object.keys(room.players).forEach(key => {
                if (room.players[key]?.id == socket.id) {
                    haveUser = true;
                    oldPosition = key;
                }
            });
            if (haveUser) {
                delete room.players[oldPosition];
                room.gameStartAt = undefined
                socket.leave(redisRoomDetailKey);
                await redisClient.set(redisRoomDetailKey, JSON.stringify(room));
                io.to(redisRoomDetailKey).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
                    players: room.players,
                    gameStartAt: room.gameStartAt
                });
                let result = await getThirteenList()
                io.to('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
            }
            // Check have any user in socket room or not => delete room
            const roomSockets = io.sockets.adapter.rooms.get(redisRoomDetailKey);
            if (!roomSockets || roomSockets.size == 0) {
                rooms.splice(rooms.indexOf(roomId), 1);
                await redisClient.set(redisKey.list, JSON.stringify(rooms));
                await redisClient.del(redisRoomDetailKey);
            }
        });
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

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER_STATUS, async ({
        roomId,
    }: {roomId: string}) => {
        const redisKeys = generateRedisKey('thirteen', roomId);
        const roomInfo = await redisClient.get(redisKeys.detail);
        const room: ThirteenGame = JSON.parse(roomInfo || '{}');
        let isAllReady = true
        Object.keys(room.players).forEach(key => {
            if (room.players[key]?.id == socket.id) {
                room.players[key].status = room.players[key].status == 'ready' ? 'unready' : 'ready'
            }
            if(room.players[key].status == 'unready') isAllReady = false
        });
        // If all players ready => start game in 5 seconds
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
            players: room.players,
            gameStartAt: room.gameStartAt
        });
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.JOIN, async (payload: {id: string}) => {
        const { id } = payload;
        const redisKeys = generateRedisKey('thirteen', id);
        socket.join(redisKeys.detail);
        const roomInfo = await redisClient.get(redisKeys.detail);
        const room = JSON.parse(roomInfo || '{}');
        io.to(socket.id).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, room);
    })

    socket.on(SOCKET_EVENTS.GAME.THIRTEEN.PICK_POSITION, async (payload: {id: string, position: string, name: string}) => {
        const { id, position, name } = payload;
        const redisKeys = generateRedisKey('thirteen', id);
        const roomInfo = await redisClient.get(redisKeys.detail);
        const room: ThirteenGame = JSON.parse(roomInfo || '{}');
        // // Check have this user in room in all position
        let haveUser = false;
        let oldPosition = '';
        Object.keys(room.players).forEach(key => {
            if (room.players[key]?.id == socket.id) {
                haveUser = true;
                oldPosition = key;
            }
        });

        if (haveUser) { // Change position
            room.players[position] = room.players[oldPosition];
            delete room.players[oldPosition];
        } else { // New User
            room.players[position] = {
                id: socket.id,
                name,
                index: Number(position),
                cards: [],
                score: 0,
                status: 'unready',
            };
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
        const redisKeys = generateRedisKey('thirteen', roomId);
        const roomInfo = await redisClient.get(redisKeys.detail);
        const room: ThirteenGame = JSON.parse(roomInfo || '{}');
        Object.keys(room.players).forEach(key => {
            if (room.players[key]?.id == socket.id) {
                room.players[key].name = name;
            }
        });
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            players: room.players
        });
        let result = await getThirteenList()
        io.to('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
    })


    async function startGame(roomId: string) {
        const redisKeys = generateRedisKey('thirteen', roomId);
        const cards = shuffleArray(getCardThirteen())
        const roomInfo = await redisClient.get(redisKeys.detail);
        const room: ThirteenGame = JSON.parse(roomInfo || '{}');
        Object.keys(room.players).forEach(key => {
            if(room.players[key]) {
                let myCards = cards.splice(-13, 13);
                myCards = myCards.sort((a, b) => {
                    const valueDifference = a.weight - b.weight;
                    if (valueDifference !== 0) {
                        return valueDifference;
                    }
                    return suitOrder[a.suit] - suitOrder[b.suit];
                });
                room.players[key].cards = myCards;
            }
        });

        // Check have anyone win

        // 

        room.gameStartAt = undefined
        room.status = 'playing'
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.DATA, {
            players: room.players,
            gameStartAt: room.gameStartAt,
            status: room.status
        });
    }

};


export async function getThirteenList() {
    const redisKey = generateRedisKey('thirteen');
    const roomsRedis = await redisClient.get(redisKey.list);
    const rooms: number[] = JSON.parse(roomsRedis || '[]');
    let result = [];
    for (let i = 0; i < rooms.length; i++) {
        const {detail: redisRoomDetailKey} = generateRedisKey('thirteen', rooms[i].toString());
        const roomInfo = await redisClient.get(redisRoomDetailKey);
        const room: ThirteenGame = JSON.parse(roomInfo || '{}');
        result.push({
            id: room.id,
            players: Object.keys(room.players).map(key => room.players[key]?.name),
            createdAt: room.createdAt,
        });
    }
    return result;
}
export default handleThirteenGame;