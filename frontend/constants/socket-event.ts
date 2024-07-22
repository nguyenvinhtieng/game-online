export const SOCKET_EVENTS = {
    GAME: {
        CREATE: 'GAME:CREATE',
        CREATED: 'GAME:CREATED',
        JOIN: 'GAME:JOIN',
        INFO: 'GAME:INFO',
        THIRTEEN: {
            JOIN: 'GAME:THIRTEEN:JOIN',
            USER_TOKEN: 'GAME:THIRTEEN:USER_TOKEN',
            RE_CONNECT: 'GAME:THIRTEEN:RE_CONNECT',
            DATA: 'GAME:THIRTEEN:DATA',
            JOINED: 'GAME:THIRTEEN:JOINED',
            PICK_POSITION: 'GAME:THIRTEEN:PICK_POSITION',
            UPDATE_PLAYER: 'GAME:THIRTEEN:UPDATE_PLAYER',
            CHANGE_NAME: 'GAME:THIRTEEN:CHANGE_NAME',
            UPDATE_STATUS: 'GAME:THIRTEEN:UPDATE_STATUS',
            UPDATE_HOST: 'GAME:THIRTEEN:UPDATE_HOST',
            REGISTER_LIST: 'GAME:THIRTEEN:REGISTER_LIST',
            UNREGISTER_LIST: 'GAME:THIRTEEN:UNREGISTER_LIST',
            LIST: 'GAME:THIRTEEN:LIST',
            UPDATE_PLAYER_STATUS: 'GAME:THIRTEEN:UPDATE_PLAYER_STATUS',
            UPDATE_CARD: 'GAME:THIRTEEN:UPDATE_CARD',
            POST_CARD: 'GAME:THIRTEEN:POST_CARD',
            SKIP_TURN: 'GAME:THIRTEEN:SKIP_TURN',
            USER_NOTIFICATION: 'GAME:THIRTEEN:USER_NOTIFICATION',
            UPDATE_USERS_SCORE: 'GAME:THIRTEEN:UPDATE_USERS_SCORE',
        }
    },
    TOAST_MESSAGE: 'TOAST_MESSAGE',
    GAME_NOTIFICATION: 'GAME_NOTIFICATION',
}