import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import generateRedisKey from '../../utils/generate-redis-ket';
import redisClient from '../../configs/redisClient';
import { ThirteenGame } from '../../types/game.type';

const handleThirteenGame = (socket: Socket, io: Server) => {
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
                socket.leave(redisRoomDetailKey);
                await redisClient.set(redisRoomDetailKey, JSON.stringify(room));
                io.to(redisRoomDetailKey).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER, room.players);
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
                status: 'waiting',
            };
        }
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER, room.players);
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
        io.to(redisKeys.detail).emit(SOCKET_EVENTS.GAME.THIRTEEN.UPDATE_PLAYER, room.players);
        let result = await getThirteenList()
        io.to('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
    })


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