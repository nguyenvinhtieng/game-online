import { Server } from 'socket.io';
import { SOCKET_EVENTS } from './events';
import { CreateGame } from './types/create-game.type';
import handleThirteenGame, { getThirteenList } from './game/thirteen';
import redisClient from '../configs/redisClient';
import generateRedisKey from '../utils/generate-redis-ket';
import { ThirteenGame } from '../types/game.thirteen.type';
import { GameType } from '../types/game.type';
import { LudoGame } from '../types/game.ludo.type';
import handleLudoGame, { getLudoList, ludo_lister_register } from './game/ludo';
const socketHandler = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });

    socket.on(SOCKET_EVENTS.GAME.CREATE, async (payload: CreateGame) => {
      const { type } = payload;
      let roomId = await generateRoomId(type)
      const {detail: redisRoomDetailKey} = generateRedisKey(type, roomId);
      switch (type) {
        case 'thirteen':
          const roomThirteen: ThirteenGame = {
            id: roomId,
            players: [],
            host: socket.id,
            status: 'waiting',
            createdAt: new Date(),
            settings: {
              winScore: 500,
              turnTimeout: 30,
            },
            prevTurn: [],
            winHistory: []
          };
          await redisClient.set(redisRoomDetailKey, JSON.stringify(roomThirteen));
          let thirteenList = await getThirteenList()
          io.to('thirteen-register-list').emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, thirteenList);
          break;
        case 'ludo':
          const roomLudo: LudoGame = {
            id: roomId,
            players: [],
            status: 'waiting',
            host: socket.id,
            chesses: [],
          }
          await redisClient.set(redisRoomDetailKey, JSON.stringify(roomLudo));
          let ludoList = await getLudoList()
          io.to(ludo_lister_register).emit(SOCKET_EVENTS.GAME.LUDO.LIST, ludoList);
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
    handleLudoGame(socket, io);


  });
};

async function generateRoomId(type: GameType): Promise<string> {
  let roomId = 1;
  const redisKey = generateRedisKey(type);
  const roomsRedis = await redisClient.get(redisKey.list);
  const rooms: string[] = JSON.parse(roomsRedis || '[]');
  while (rooms.some(room => Number(room) == roomId)) roomId++;
  let newId = roomId.toString().padStart(5, '0');
  rooms.push(newId)
  await redisClient.set(redisKey.list, JSON.stringify(rooms));
  return newId;
}

export default socketHandler;
