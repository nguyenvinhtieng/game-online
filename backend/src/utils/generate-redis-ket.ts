import REDIS_KEYS from "../constants/redis-keys";
import { GameType } from "../types/game.type";
export interface RedisKeys {
    list: string;
    detail: string;
}
export default function generateRedisKey(type: GameType, roomId?: string): RedisKeys {
    return {
        list: REDIS_KEYS['game:list'] + ':' + type,
        detail: REDIS_KEYS['game:detail'] + ':' + type + ':' + roomId,
    }
}