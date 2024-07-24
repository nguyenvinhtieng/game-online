export const SOCKET_EVENTS = {
    GAME: {
        CREATE: 'GAME:CREATE',
        CREATED: 'GAME:CREATED',
        JOIN: 'GAME:JOIN',
        THIRTEEN: {
            JOIN: 'GAME:THIRTEEN:JOIN',
            USER_TOKEN: 'GAME:THIRTEEN:USER_TOKEN',
            RE_CONNECT: 'GAME:THIRTEEN:RE_CONNECT',
            USER_LEAVE: 'GAME:THIRTEEN:USER_LEAVE',
            DATA: 'GAME:THIRTEEN:DATA',
            JOINED: 'GAME:THIRTEEN:JOINED',
            PICK_POSITION: 'GAME:THIRTEEN:PICK_POSITION',
            CHANGE_NAME: 'GAME:THIRTEEN:CHANGE_NAME',
            UPDATE_STATUS: 'GAME:THIRTEEN:UPDATE_STATUS',
            UPDATE_HOST: 'GAME:THIRTEEN:UPDATE_HOST',
            REGISTER_LIST: 'GAME:THIRTEEN:REGISTER_LIST',
            UNREGISTER_LIST: 'GAME:THIRTEEN:UNREGISTER_LIST',
            LIST: 'GAME:THIRTEEN:LIST',
            UPDATE_PLAYER_STATUS: 'GAME:THIRTEEN:UPDATE_PLAYER_STATUS',
            UPDATE_GAME_START_AT: 'GAME:THIRTEEN:UPDATE_GAME_START_AT',
            UPDATE_CARD: 'GAME:THIRTEEN:UPDATE_CARD',
            POST_CARD: 'GAME:THIRTEEN:POST_CARD',
            SKIP_TURN: 'GAME:THIRTEEN:SKIP_TURN',
            USER_NOTIFICATION: 'GAME:THIRTEEN:USER_NOTIFICATION',
            UPDATE_USERS_SCORE: 'GAME:THIRTEEN:UPDATE_USERS_SCORE',
        },
        LUDO: {
            JOIN: 'GAME:LUDO:JOIN',
            USER_TOKEN: 'GAME:LUDO:USER_TOKEN',
            RE_CONNECT: 'GAME:LUDO:RE_CONNECT',
            DATA: 'GAME:LUDO:DATA',
            JOINED: 'GAME:LUDO:JOINED',
            PICK_POSITION: 'GAME:LUDO:PICK_POSITION',
            UPDATE_PLAYER: 'GAME:LUDO:UPDATE_PLAYER',
            CHANGE_NAME: 'GAME:LUDO:CHANGE_NAME',
            UPDATE_STATUS: 'GAME:LUDO:UPDATE_STATUS',
            UPDATE_HOST: 'GAME:LUDO:UPDATE_HOST',
            REGISTER_LIST: 'GAME:LUDO:REGISTER_LIST',
            UNREGISTER_LIST: 'GAME:LUDO:UNREGISTER_LIST',
            LIST: 'GAME:LUDO:LIST',
            UPDATE_PLAYER_STATUS: 'GAME:LUDO:UPDATE_PLAYER_STATUS',
            USER_NOTIFICATION: 'GAME:LUDO:USER_NOTIFICATION',
            ROLL: 'GAME:LUDO:ROLL',
            MOVABLE_CHESS: 'GAME:LUDO:MOVABLE_CHESS',
            MOVE_CHESS: 'GAME:LUDO:MOVE_CHESS',
        }
    },
    TOAST_MESSAGE: 'TOAST_MESSAGE',
    GAME_NOTIFICATION: 'GAME_NOTIFICATION'
}