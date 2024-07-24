import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../events";
import generateRedisKey, { RedisKeys } from "../../utils/generate-redis-ket";
import redisClient from "../../configs/redisClient";
import jwt from "jsonwebtoken";
import { Chess, ChessStatus, Dice, LudoColor, LudoGame, LudoPosition, UserStatus } from "../../types/game.ludo.type";
import { getFullRouteForColor, initChessesForPosition, ludo_destination } from "../../utils/ludo-chess";
import { color_to_position, ludo_routes, position_to_color } from "../../constants/ludo";
const jwtKey = process.env.JWT_SECRET || "jwt-key";
export const ludo_lister_register = "ludo_lister_register";
const handleLudoGame = (socket: Socket, io: Server) => {
    const timersStartGame: Record<string, NodeJS.Timeout> = {}
    const TIME_PREPARE_START_GAME = 5;
    const ROLLING_TIME = 5;
    const FINISH_TIME = 5
    socket.on("disconnect", async () => {
        socket.leave(ludo_lister_register);
        const redisKey = generateRedisKey("ludo")
        const roomsRedis = await redisClient.get(redisKey.list);
        const rooms: number[] = JSON.parse(roomsRedis || '[]');
        let isRoomListChange = false;
        // Loop rooms
        rooms.forEach(async (roomId) => {
            const { room, redisKeys: redisRoomKeys } = await getRoomDataAndKey(roomId.toString())
            if (!room) return
            // Check have this user in room in all position
            const userLeave = room.players?.find(player => player.id == socket.id)
            if (userLeave) {
                if (room.status == 'waiting' || room.status == 'finished') {
                    room.players = room.players?.filter(player => player.id != socket.id)
                    room.gameStartAt = undefined
                    if(timersStartGame[redisRoomKeys.detail]) {
                        clearTimeout(timersStartGame[redisRoomKeys.detail])
                        delete timersStartGame[redisRoomKeys.detail]
                    }
                    io.in(redisRoomKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
                        gameStartAt: undefined,
                        players: room.players || []
                    });
                    await redisClient.set(redisRoomKeys.detail, JSON.stringify(room));
                    isRoomListChange = true;
                } else if(room.status == 'playing') {
                    const userLeaveIndex = room.players.findIndex(player => player.id == socket.id)
                    room.players[userLeaveIndex].status = 'disconnect'
                    await redisClient.set(redisRoomKeys.detail, JSON.stringify(room));
                    io.in(redisRoomKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA,  {
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
            const result = await getLudoList();
            io.in(ludo_lister_register).emit(SOCKET_EVENTS.GAME.THIRTEEN.LIST, result);
        }
        socket.leave(ludo_lister_register);
    });

    socket.on(SOCKET_EVENTS.GAME.LUDO.RE_CONNECT, async (payload: { roomId: string; token: string }) => { 
        const { roomId, token } = payload;
        const { room, redisKeys } = await getRoomDataAndKey(roomId)
        if (!room) return;
        jwt.verify(token, jwtKey, async (err, decoded) => {
            if (err || !decoded) return;
            if(typeof decoded == 'string') return;
            const userId = decoded.id;
            console.log('ID::', userId)
            const index = room.players.findIndex(player => player.id == userId)
            const user = room.players[index]
            if (!user || user.status != 'disconnect') return;
            // Change id to new socket id
            room.players[index].status = 'ready';
            room.players[index].id = socket.id
            room.turn = room.turn == userId ? socket.id : room.turn
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
                players: room.players,
                turn: room.turn
            });
            const newToken = jwt.sign({ id: socket.id }, jwtKey, {
                expiresIn: '1h'
            })
            io.to(socket.id).emit(SOCKET_EVENTS.GAME.LUDO.USER_TOKEN, {
                token: newToken
            });
        });
    });

    socket.on(SOCKET_EVENTS.GAME.LUDO.REGISTER_LIST, async () => {
        socket.join(ludo_lister_register);
        const result = await getLudoList();
        io.to(socket.id).emit(SOCKET_EVENTS.GAME.LUDO.LIST, result);
    });

    socket.on(SOCKET_EVENTS.GAME.LUDO.UNREGISTER_LIST, async () => {
        socket.leave(ludo_lister_register);
    });

    socket.on(SOCKET_EVENTS.GAME.LUDO.JOIN, async (payload: { id: string }) => {
            const { id } = payload;
            const { room, redisKeys } = await getRoomDataAndKey(id);
            if (!room || Object.keys(room).length == 0) {
                io.to(socket.id).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
                    notValidRoom: "no-valid",
                });
            } else {
                socket.join(redisKeys.detail);
                io.to(socket.id).emit(SOCKET_EVENTS.GAME.LUDO.DATA, room);
            }
        }
    );

    socket.on(SOCKET_EVENTS.GAME.LUDO.PICK_POSITION, async (payload: { id: string; position: number; name: string }) => {
            const { id, position, name } = payload;
            const { room, redisKeys } = await getRoomDataAndKey(id);
            if (!room) {
                io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                    message: "Phòng không tồn tại",
                    type: "error",
                });
                return;
            }
            const myIndex = room.players?.findIndex((player) => player.id == socket.id);
            if (myIndex != -1) {
                room.players[myIndex].position = Number(position) as LudoPosition;
            } else {
                // Check position have user or not
                const isPositionHaveUser = room.players?.some(
                    (player) => player.position == Number(position)
                );
                if (isPositionHaveUser) return;
                room.players?.push({
                    id: socket.id,
                    name,
                    status: "unready",
                    position: Number(position) as LudoPosition,
                });
                if (timersStartGame[redisKeys.detail]) {
                    clearTimeout(timersStartGame[redisKeys.detail]);
                    delete timersStartGame[redisKeys.detail];
                }
                room.gameStartAt = undefined;
                // Generate token
                const token = jwt.sign({ id: socket.id }, jwtKey, {
                    expiresIn: "1h",
                });
                io.to(socket.id).emit(SOCKET_EVENTS.GAME.LUDO.USER_TOKEN, {
                    token: token,
                });
            }
            await redisClient.set(redisKeys.detail, JSON.stringify(room));
            io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
                players: room.players,
                gameStartAt: room.gameStartAt,
            });
            const result = await getLudoList();
            io.in(ludo_lister_register).emit(
                SOCKET_EVENTS.GAME.LUDO.LIST,
                result
            );
        }
    );

    socket.on(SOCKET_EVENTS.GAME.LUDO.CHANGE_NAME,
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
                io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
                    players: room.players,
                });
            }
        }
    );

    socket.on(
        SOCKET_EVENTS.GAME.LUDO.UPDATE_PLAYER_STATUS,
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
            io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
                gameStartAt: room.gameStartAt || null,
                players: room.players
            });
        }
    );


    socket.on(SOCKET_EVENTS.GAME.LUDO.ROLL, async ({ id }: { id: string}) => {
        const { room, redisKeys } = await getRoomDataAndKey(id);
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                message: "Phòng không tồn tại",
                type: "error",
            });
            return;
        }
        if (room.turn != socket.id || room.status != 'playing') {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                message: "Không phải lượt của bạn",
                type: "error",
            });
            return;
        }

        await roll(id)
        
    });

    socket.on(SOCKET_EVENTS.GAME.LUDO.MOVE_CHESS, async ({chess, id}: {chess: Chess, id: string}) => {
        const { room, redisKeys } = await getRoomDataAndKey(id);
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                message: "Phòng không tồn tại",
                type: "error",
            });
            return;
        }
        if (room.turn != socket.id) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                message: "Không phải lượt của bạn",
                type: "error",
            });
            return;
        }
        if(!room.dice) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                message: "Bạn chưa tung xúc xắc",
                type: "error",
            });
            return;
        }
        const player = room.players.find(p => p.id == socket.id)
        if(!player) return;
        const position = player.position
        const chesses = getChessMovable(room.chesses, position, room.dice.value)
        // check my chess have in chesses
        const isMyChessValid = chesses.some(c => c.x == chess.x && c.y == chess.y)
        if(!isMyChessValid) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                message: "Quân cờ không hợp lệ",
                type: "error",
            });
            return;
        }
        io.to(socket.id).emit(SOCKET_EVENTS.GAME.LUDO.MOVABLE_CHESS, {
            chesses: []
        })
        const newChesses = updateChesses(room.chesses, chess, room.dice.value)
        room.chesses = newChesses

        // Check win
        const allMyArrivedChess = newChesses.filter(c => c.color == position_to_color[position] && c.status == 'arrived')
        if(allMyArrivedChess.length == 4) {
            room.status = 'finished'
            room.winner = player.id
            room.players = room.players.filter(player => player.status != 'disconnect')
            setTimeout(async () => {
                const time = new Date();
                time.setSeconds(time.getSeconds() + TIME_PREPARE_START_GAME);
                const { room: room1, redisKeys } = await getRoomDataAndKey(room.id)
                if (!room1) return;
                room1.gameStartAt = time.toString()
                timersStartGame[redisKeys.detail] = setTimeout(() => {
                    startGame(room1.id)
                }, TIME_PREPARE_START_GAME * 1000)
                io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
                    gameStartAt: room1.gameStartAt || null,
                    status: 'waiting'
                });
            }, FINISH_TIME * 1000)
        }

        if(room.dice.value != 6) {
            // Update turn
            const positions = room.players.map(p =>p.position).sort((a,b)=> a-b)  
            const currentIndexPosition = positions.findIndex(p => p == position)
            const nextPosition = currentIndexPosition == (positions.length - 1) ? positions[0] : positions[currentIndexPosition + 1]
            const p = room.players.find(p => p.position == nextPosition)
            room.turn = p?.id
            room.dice = undefined
        }
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
            turn: room.turn,
            dice: room.dice || null,
            chesses: room.chesses,
            status: room.status,
            winner: room.winner,
            players: room.players
        });
       
    });

    async function roll(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId);
        if(!room) return;
        const turn = room.turn || socket.id
        const dice = Math.floor(Math.random() * 6) + 1 as Dice;
        // const hash_dice = [5, 6];
        // const random = Math.floor(Math.random() * hash_dice.length);
        // const dice = hash_dice[random] as Dice
        const seek = Math.floor(Math.random() * 100) + 1;
        room.dice = {
            value: dice,
            seek
        }
        const player = room.players.find(p => p.id == turn)
        if(!player) return;
        const position = player.position
        const chesses = getChessMovable(room.chesses, position, dice)

        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
            dice: room.dice,
        });

        if(chesses.length == 0 && dice != 6) {
            setTimeout(async ()=>{
                const positions = room.players.map(p =>p.position).sort((a,b)=> a-b)  
                const currentIndexPosition = positions.findIndex(p => p == position)
                const nextPosition = currentIndexPosition == (positions.length - 1) ? positions[0] : positions[currentIndexPosition + 1]
                const p = room.players.find(p => p.position == nextPosition)
                room.turn = p?.id
                room.dice = undefined
                await redisClient.set(redisKeys.detail, JSON.stringify(room));
                io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
                    turn: room.turn,
                    dice: room.dice || null,
                });
            }, ROLLING_TIME * 1000)
        } else if (chesses.length == 0 && dice == 6) { // quay tiep
        } else {
            io.to(turn).emit(SOCKET_EVENTS.GAME.LUDO.MOVABLE_CHESS, {
                chesses: chesses
            })
        }
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
    }

    function updateChesses(chesses: Chess[], chess: Chess, dice: Dice) : Chess[] {
        const newChesses = [...chesses]
        const myChesses = chesses.filter(c => c.color == chess.color)
        const myArrivedChesses = myChesses.filter(c => c.status == "arrived")
        const indexArrived = myArrivedChesses.map(c => c.arrivedAt) || []
        const myRoutes = getFullRouteForColor(chess.color)
        const MAX_INDEX = myRoutes.length - 1
        const targetPosition: {x: number, y: number} = {x: 0, y: 0}
        let status: ChessStatus = chess.status
        let arrivedAt = undefined
        const position = chesses.findIndex(c => c.x == chess.x && c.y == chess.y && c.color == chess.color)
        switch(chess.status) {
            case "home": // Actually dice = 6
                targetPosition.x = myRoutes[0].x
                targetPosition.y = myRoutes[0].y
                status = "playing"
                break;
            case "playing":
                const currentIndex = myRoutes.findIndex(r => r.x == chess.x && r.y == chess.y)
                const nextIndex = currentIndex + dice
                if(nextIndex > MAX_INDEX) {
                    const diff = nextIndex - MAX_INDEX
                    if(!indexArrived.includes(diff)) {
                        const my_destination = ludo_destination.find(d => d.color == chess.color && d.index == diff)
                        targetPosition.x = my_destination?.x || 0
                        targetPosition.y = my_destination?.y || 0
                        status = 'arrived'
                        arrivedAt = diff
                    }
                } else {
                    const chessAtNextIndex = myRoutes[nextIndex]
                    const isHaveMyChessAtNextPosition = chesses.findIndex(c => c.x == chessAtNextIndex.x && c.y == chessAtNextIndex.y && c.color == chess.color) != -1
                    if(!isHaveMyChessAtNextPosition) {
                        targetPosition.x = chessAtNextIndex.x
                        targetPosition.y = chessAtNextIndex.y
                        status = 'playing'
                    }
                }
                break;
            case "arrived":
                if(!chess.arrivedAt) break;
                const currentArrived = chess.arrivedAt
                const nextArrived = currentArrived + dice
                if(!indexArrived.includes(nextArrived)) {
                    const my_destination = ludo_destination.find(d => d.color == chess.color && d.index == nextArrived)
                    targetPosition.x = my_destination?.x || 0
                    targetPosition.y = my_destination?.y || 0
                    status = 'arrived'
                    arrivedAt = nextArrived
                }
                break;
            default:
                break;
        }
        if(targetPosition.x == 0 || targetPosition.y == 0) return chesses;
        // Get chess at targetPosition
        const indexChessAtTarget = chesses.findIndex(c => c.x == targetPosition.x && c.y == targetPosition.y)
        if(indexChessAtTarget != -1) {
            const targetChess = chesses[indexChessAtTarget]
            if(targetChess.color == chess.color) return chesses;
            const init_chess_for_target: Chess[] = initChessesForPosition[color_to_position[targetChess.color]]
            const all_home_chess_of_target: Chess[] = chesses.filter(c => c.status == "home" && c.color == targetChess.color)
            const isInAllHomeChess = (chess: Chess) => {
                return all_home_chess_of_target.some(homeChess => homeChess.x === chess.x && homeChess.y === chess.y && homeChess.color === chess.color);
            };
            const firstChessNotInHome = init_chess_for_target.find(chess => !isInAllHomeChess(chess));
            if(firstChessNotInHome) {
                newChesses[indexChessAtTarget].x = firstChessNotInHome.x
                newChesses[indexChessAtTarget].y = firstChessNotInHome.y
                newChesses[indexChessAtTarget].status = "home"
            }
        }
        newChesses[position].x = targetPosition.x
        newChesses[position].y = targetPosition.y
        newChesses[position].status = status
        newChesses[position].arrivedAt = arrivedAt
        return newChesses
    }

    async function startGame(roomId: string) {
        const { room, redisKeys } = await getRoomDataAndKey(roomId);
        if (!room) {
            io.to(socket.id).emit(SOCKET_EVENTS.TOAST_MESSAGE, {
                message: "Phòng không tồn tại",
                type: "error",
            });
            return;
        }

        const players = room.players
        const chesses : Chess[] = []
        players.forEach(p => {
            chesses.push(...initChessesForPosition[p.position])
        })
        const playerStart = players.reduce((prev, current) => (prev.position < current.position) ? prev : current)
        room.turn = playerStart.id
        room.status = 'playing'
        room.chesses = chesses
        room.winner = undefined
        // room.gameStartAt = undefined;
        
        await redisClient.set(redisKeys.detail, JSON.stringify(room));
        io.in(redisKeys.detail).emit(SOCKET_EVENTS.GAME.LUDO.DATA, {
            gameStartAt: room.gameStartAt || null,
            status: room.status,
            turn: room.turn,
            chesses: room.chesses,
            winner: room.winner || null
        });
    }


};


async function getRoomDataAndKey(
    roomId: string
): Promise<{ room?: LudoGame; redisKeys: RedisKeys }> {
    const redisKeys = generateRedisKey("ludo", roomId);
    const roomInfo = await redisClient.get(redisKeys.detail);
    if (!roomInfo) return { redisKeys };
    const room: LudoGame = JSON.parse(roomInfo);
    return {
        room,
        redisKeys,
    };
}

function getChessMovable(chesses: Chess[], position: LudoPosition, dice: Dice) : Chess[] {
    const color = position_to_color[position]
    const movableChesses: Chess[] = []
    const myChesses = chesses.filter(c => c.color == color)
    const myHomeChesses = myChesses.filter(c => c.status == "home")
    const myPlayingChesses = myChesses.filter(c => c.status == "playing")
    const myArrivedChesses = myChesses.filter(c => c.status == "arrived")
    const indexArrived = myArrivedChesses.map(c => c.arrivedAt) || []
    const myRoutes = getFullRouteForColor(color)

    // All my chess at home
    const haveMyChessAtStart = chesses.some(c => c.x == myRoutes[0].x && c.y == myRoutes[0].y && c.color == color)
    if(dice == 6 && !haveMyChessAtStart) {
        movableChesses.push(...myHomeChesses)
    }

    // All my chess playing
    const MAX_INDEX = myRoutes.length - 1
    myPlayingChesses.forEach(chess => {
        const currentIndex = myRoutes.findIndex(r => r.x == chess.x && r.y == chess.y)
        const nextIndex = currentIndex + dice
        if(nextIndex > MAX_INDEX) {
            const diff = nextIndex - MAX_INDEX
            if(!indexArrived.includes(diff) && diff < 5) movableChesses.push(chess)
        } else {
            const chessAtNextIndex = myRoutes[nextIndex]
            const isHaveMyChessAtNextPosition = chesses.findIndex(c => c.x == chessAtNextIndex.x && c.y == chessAtNextIndex.y && c.color == color) != -1
            if(!isHaveMyChessAtNextPosition) movableChesses.push(chess)
        }
    })
    // All my chess arrived
    
    myArrivedChesses.forEach(chess => {
        if(!chess.arrivedAt) return;
        const nextIndex = chess.arrivedAt + dice
        if(nextIndex > 4) return;
        if(!indexArrived.includes(nextIndex)) movableChesses.push(chess)
    })

    return movableChesses
}

export async function getLudoList() {
    const redisKey = generateRedisKey("ludo");
    const roomsRedis = await redisClient.get(redisKey.list);
    const rooms: string[] = JSON.parse(roomsRedis || "[]");
    const result = [];
    for (let i = 0; i < rooms.length; i++) {
        const { room } = await getRoomDataAndKey(rooms[i].toString());
        if (!room) continue;
        result.push(room);
        // redisClient.del(generateRedisKey("ludo", rooms[i].toString()).detail);
    }
    // redisClient.del(redisKey.list);
    return result;
}
export default handleLudoGame;
