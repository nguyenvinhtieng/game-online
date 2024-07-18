import { Server } from 'socket.io';
import { SOCKET_EVENTS } from './events';
import { CreateGame } from './types/create-game.type';
import handleThirteenGame, { getThirteenList } from './game/thirteen';
import redisClient from '../configs/redisClient';
import generateRedisKey from '../utils/generate-redis-ket';
import { ThirteenGame } from '../types/game.thirteen.type';
const socketHandler = (io: Server) => {
  io.on('connection', (socket) => {

    socket.on('disconnect', () => {
    });

    socket.on(SOCKET_EVENTS.GAME.CREATE, async (payload: CreateGame) => {
      const { type } = payload;
      const redisKey = generateRedisKey(type);
      let roomId = 1;
      const roomsRedis = await redisClient.get(redisKey.list);
      const rooms: number[] = JSON.parse(roomsRedis || '[]');
      while (rooms.some(room => room == roomId)) roomId++;
      rooms.push(roomId);
      await redisClient.set(redisKey.list, JSON.stringify(rooms));
      const {detail: redisRoomDetailKey} = generateRedisKey(type, roomId.toString());
      switch (type) {
        case 'thirteen':
          const room: ThirteenGame = {
            id: roomId.toString(),
            players: [],
            host: socket.id,
            status: 'waiting',
            createdAt: new Date()
          };
          await redisClient.set(redisRoomDetailKey, JSON.stringify(room));
          let result = await getThirteenList()
          io.to('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
          break;
        default:
          console.log('Creating a default game');
          break;
      }
      socket.emit(SOCKET_EVENTS.GAME.CREATED, {
        roomId,
        type,
      });
    })

    handleThirteenGame(socket, io);


  });
};

export default socketHandler;
