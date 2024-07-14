import { Server } from 'socket.io';
import { SOCKET_EVENTS } from './events';
import { CreateGame } from './types/create-game.type';
import handleThirteenGame from './game/thirteen';
import redisClient from '../configs/redisClient';
import REDIS_KEYS from '../constants/redis-keys';
import generateRedisKey from '../utils/generate-redis-ket';
import { ThirteenGame } from '../types/game.type';
const socketHandler = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {});

    socket.on(SOCKET_EVENTS.GAME.CREATE, async (payload: CreateGame) => {
      const { type } = payload;
      const redisKey = generateRedisKey(type);
      switch (type) {
        case 'thirteen':
          const rooms = await redisClient.get(redisKey.list);
          const thirteenRooms: number[] = JSON.parse(rooms || '[]');
          let roomId = 1;
          while (thirteenRooms.some(room => room == roomId)) roomId++;
          thirteenRooms.push(roomId);
          await redisClient.set(redisKey.list, JSON.stringify(thirteenRooms));
          // Create room detail
          const {detail: redisRoomDetailKey} = generateRedisKey(type, roomId.toString());
          const room: ThirteenGame = {
            id: roomId.toString(),
            players: [],
            host: socket.id,
            status: 'waiting',
          };
          await redisClient.set(redisRoomDetailKey, JSON.stringify(room));
          socket.emit(SOCKET_EVENTS.GAME.CREATED, roomId);
          break;
        default:
          console.log('Creating a default game');
          break;
      }
    })

    handleThirteenGame(socket, io);


  });
};

export default socketHandler;
