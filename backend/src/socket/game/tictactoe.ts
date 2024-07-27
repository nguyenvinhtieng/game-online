import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../events";
import generateRedisKey, { RedisKeys } from "../../utils/generate-redis-ket";
import redisClient from "../../configs/redisClient";
import jwt from "jsonwebtoken";
import { Player, PlayerType, PlayerTypeEnum, TicTacToeGame, TicTacToeMove, TicTacToePosition, UserStatus } from "../../types/game.tictactoe.type";
const jwtKey = process.env.JWT_SECRET || "jwt-key";
export const tictactoe_list_register = "tictactoe_list_register";
const timersStartGame: Record<string, NodeJS.Timeout> = {}
export const handleTictactoeGame = (socket: Socket, io: Server) => {
    const TIME_PREPARE_START_GAME = 5;
    const FINISH_TIME = 1.5;
    socket.on("disconnect", async () => {
        socket.leave(tictactoe_list_register);
        const redisKey = generateRedisKey("tictactoe")
        const roomsRedis = await redisClient.get(redisKey.list);
        const rooms: number[] = JSON.parse(roomsRedis || '[]');
        let isRoomListChange = false;
        // Loop rooms
        rooms.forEach(async (roomId) => {
            const { room, redisKeys: redisRoomKeys } = await getRoomDataAndKey(roomId.toString())
            if (!room) return
            // Check have this user in room in all position
            const userLeave = room.players?.find((player: Player) => player.id == socket.id)
            if (userLeave) {
                if (room.status == 'waiting' || room.status == 'finished') {
                    room.players = room.players?.filter((player: Player) => player.id != socket.id)
                    room.gameStartAt = undefined
                    if(timersStartGame[redisRoomKeys.detail]) {
                        clearTimeout(timersStartGame[redisRoomKeys.detail])
                        delete timersStartGame[redisRoomKeys.detail]
                    }
                    io.in(redisRoomKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, {
                        gameStartAt: undefined,
                        players: room.players || []
                    });
                    await redisClient.set(redisRoomKeys.detail, JSON.stringify(room));
                    isRoomListChange = true;
                } else if(room.status == 'playing') {
                    const userLeaveIndex = room.players.findIndex((player: Player) => player.id == socket.id)
                    room.players[userLeaveIndex].status = 'disconnect'
                    await redisClient.set(redisRoomKeys.detail, JSON.stringify(room));
                    io.in(redisRoomKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA,  {
                        players: room.players
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
            const result = await getTictactoeList();
            io.in(tictactoe_list_register).emit(SOCKET_EVENTS.GAME.TICTACTOE.LIST, result);
        }
        socket.leave(tictactoe_list_register);
    });

    socket.on(SOCKET_EVENTS.GAME.TICTACTOE.RE_CONNECT, async (payload: { roomId: string; token: string }) => { 
        const { roomId, token } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if (!room) return;
        jwt.verify(token, jwtKey, async (err, decoded) => {
            if (err || !decoded) return;
            if(typeof decoded == 'string') return;
            const userId = decoded.id;
            const index = room.players.findIndex((player: Player) => player.id == userId)
            const user = room.players[index]
            if (!user || user.status != 'disconnect') return;
            // Change id to new socket id
            room.players[index].status = 'ready';
            room.players[index].id = socket.id
            room.turn = room.turn == userId ? socket.id : room.turn
            room.moves = room.moves.map(m => {
                return {
                    ...m,
                    id: m.id == userId ? socket.id : m.id
                }
            })
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, {
                players: room.players,
                turn: room.turn,
                moves: room.moves
            });
            const newToken = jwt.sign({ id: socket.id }, jwtKey, {
                expiresIn: '1h'
            })
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.TICTACTOE.USER_TOKEN, {
                token: newToken
            });
        });
    });

    socket.on(SOCKET_EVENTS.GAME.TICTACTOE.REGISTER_LIST, async () => {
        socket.join(tictactoe_list_register);
        const result = await getTictactoeList();
        io.to(socket.id).emit(SOCKET_EVENTS.GAME.TICTACTOE.LIST, result);
    });

    socket.on(SOCKET_EVENTS.GAME.TICTACTOE.UNREGISTER_LIST, async () => {
        socket.leave(tictactoe_list_register);
    });

    socket.on(SOCKET_EVENTS.GAME.TICTACTOE.JOIN, async (payload: { id: string, name: string }) => {
            const { id } = payload;
            const { room, redisKeys } = await getRoomDataAndKey(id);
            if (!room || Object.keys(room).length == 0) {
                io.to(socket.id).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, {
                    notValidRoom: "no-valid",
                });
            } else {
                socket.join(redisKeys.detail);
                const isRoomFull = room.players.length == 2;
                if(!isRoomFull) {
                    const isUserJoin = room.players.some((player: Player) => player.id == socket.id)
                    if (!isUserJoin) {
                        room.players.push({
                            id: socket.id,
                            name: payload.name || socket.id,
                            status: 'ready',
                            position: room.players.some((player: Player) => player.position == PlayerTypeEnum.O) ? PlayerTypeEnum.X : PlayerTypeEnum.O,
                            score: 0
                        });
                        // Check if room is full and all players are ready
                        const isAllReady = room.players.every((player: Player) => player.status == 'ready')
                        if (isAllReady) {
                            const time = new Date();
                            time.setSeconds(time.getSeconds() + TIME_PREPARE_START_GAME);
                            room.gameStartAt = time.toString();
                            timersStartGame[redisKeys.detail] = setTimeout(() => {
                                startGame(id);
                            }, TIME_PREPARE_START_GAME * 1000);
                        } else {
                            room.gameStartAt = undefined;
                        }
                        await redisClient.set(redisKeys.detail, JSON.stringify(room));
                    }
                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, room);
                }
                io.to(socket.id).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, room);
            }
        }
    );

    socket.on(SOCKET_EVENTS.GAME.TICTACTOE.CHANGE_NAME,
        async (payload: { name: string; roomId: string }) => {
            const { name, roomId } = payload;
            const { room, redisKeys } = await getRoomDataAndKey(roomId);
            if (!room) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Phòng không tồn tại",
                    type: "error",
                });
                return;
            }
            const myIndex = room.players.findIndex(
                (player) => player.id == socket.id
            );
            if (myIndex != -1) {
                room.players[myIndex].name = name;
                await redisClient.set(redisKeys.detail, JSON.stringify(room));
                io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, {
                    players: room.players,
                });
            }
        }
    );

    socket.on(SOCKET_EVENTS.GAME.TICTACTOE.UPDATE_PLAYER_STATUS,
        async ({ roomId, status }: { roomId: string; status: UserStatus }) => {
            const { room, redisKeys } = await getRoomDataAndKey(roomId);
            if (timersStartGame[redisKeys.detail]) {
                clearTimeout(timersStartGame[redisKeys.detail]);
                delete timersStartGame[redisKeys.detail];
            }
            if (!room) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Phòng không tồn tại",
                    type: "error",
                });
                return;
            }
            const index = room.players?.findIndex((player) => player.id == socket.id);
            if (index == -1) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Bạn không phải là thành viên của phòng này",
                    type: "error",
                });
                return;
            }
            room.players[index].status = status;
            const isAllReady = room.players.every(
                (player) => player.status == "ready"
            );
            if (isAllReady) {
                const time = new Date();
                time.setSeconds(time.getSeconds() + TIME_PREPARE_START_GAME);
                room.gameStartAt = time.toString();
                timersStartGame[redisKeys.detail] = setTimeout(() => {
                    startGame(roomId);
                }, TIME_PREPARE_START_GAME * 1000);
            } else {
                room.gameStartAt = undefined;
            }
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, {
                gameStartAt: room.gameStartAt || null,
                players: room.players
            });
        }
    );


    socket.on(SOCKET_EVENTS.GAME.TICTACTOE.TIC, async ({ roomId, position }: { roomId: string; position: TicTacToePosition}) => {
            const { room, redisKeys } = await getRoomDataAndKey(roomId);
            if (!room) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Phòng không tồn tại",
                    type: "error",
                });
                return;
            }
            const index = room.players?.findIndex((player) => player.id == socket.id);
            if (index == -1) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Bạn không phải là thành viên của phòng này",
                    type: "error",
                });
                return;
            }
            if (room.status != 'playing') {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Trò chơi chưa bắt đầu",
                    type: "error",
                });
                return;
            }
            if (room.turn != socket.id) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Chưa đến lượt của bạn",
                    type: "error",
                });
                return;
            }
            if (room.moves.some(m => m.position == position)) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Vị trí đã được chọn",
                    type: "error",
                });
                return;
            }
            if(room.moves.length > 5) {
                room.moves.shift()
            }
            room.moves.push({
                id: socket.id,
                position
            })
            const winRoute = checkWin(room.moves)
            if (winRoute) {
                room.winner = socket.id
                room.status = 'finished'
                room.winnerRoute = winRoute
                const winnerIndex = room.players.findIndex(player => player.id == socket.id)
                room.players[winnerIndex].score += 1

                setTimeout(async () => {
                    const time = new Date();
                    time.setSeconds(time.getSeconds() + FINISH_TIME);
                    room.gameStartAt = time.toString();
                    await redisClient.set(redisKeys.detail, JSON.stringify(room));
                    io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, {
                        gameStartAt: room.gameStartAt || null,
                        status: room.status,
                        winner: room.winner || null,
                        moves: room.moves,
                        winnerRoute: room.winnerRoute
                    });
                    timersStartGame[redisKeys.detail] = setTimeout(() => {
                        startGame(roomId);
                    }, FINISH_TIME * 1000);
                }, FINISH_TIME * 1000);
            } else {
                room.turn = room.players.find(player => player.id != socket.id)?.id
            }
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, {
                status: room.status,
                turn: room.turn,
                winner: room.winner || null,
                moves: room.moves,
                winnerRoute: room.winnerRoute,
                players: room.players
            });
        }
    );

    async function startGame(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId);
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                message: "Phòng không tồn tại",
                type: "error",
            });
            return;
        }
        room.turn = room.winner || room.players[0].id;
        room.status = 'playing'
        room.winner = undefined
        room.winnerRoute = []
        room.moves = []
        room.gameStartAt = undefined;
        
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.TICTACTOE.DATA, {
            gameStartAt: room.gameStartAt || null,
            status: room.status,
            turn: room.turn,
            winner: room.winner || null,
            moves: room.moves,
            winnerRoute: room.winnerRoute
        });
    }

    function checkWin(moves: TicTacToeMove[]) : TicTacToePosition[] | false {
        const winRoutes = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
            [1, 5, 9],
            [3, 5, 7]
        ] as TicTacToePosition[][]
        const myMoves = moves.filter(m => m.id == socket.id && m.position)
        const myPositions = myMoves.map(m => m.position)
        for (let i = 0; i < winRoutes.length; i++) {
            const route = winRoutes[i]
            if (route.every(r => myPositions.includes(r as TicTacToePosition))) {
                return route
            }
        }
        return false
    }


};


async function getRoomDataAndKey(
    roomId: string
): Promise<{ room?: TicTacToeGame; redisKeys: RedisKeys }> {
    const redisKeys = generateRedisKey("tictactoe", roomId);
    const roomInfo = await redisClient.get(redisKeys.detail);
    if (!roomInfo) return { redisKeys };
    const room: TicTacToeGame = JSON.parse(roomInfo);
    return {
        room,
        redisKeys,
    };
}



export async function getTictactoeList() {
    const redisKey = generateRedisKey("tictactoe");
    const roomsRedis = await redisClient.get(redisKey.list);
    const rooms: string[] = JSON.parse(roomsRedis || "[]");
    const result = [];
    for (let i = 0; i < rooms.length; i++) {
        const { room } = await getRoomDataAndKey(rooms[i].toString());
        if (!room) continue;
        result.push(room);
    }
    return result;
}



export default handleTictactoeGame;
