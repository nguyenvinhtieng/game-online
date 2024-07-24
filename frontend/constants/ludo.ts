import type { LudoColor, LudoDestination, LudoPosition, LudoRouteCell } from "~/types/game.ludo";
export const ludo_routes : LudoRouteCell[] = [
    // Red Area
    { x: 1,     y: 5,   index: 0,   color: 'red', isStartPlace: true },
    { x: 2,     y: 5,   index: 1,   color: 'red' },
    { x: 3,     y: 5,   index: 2,   color: 'red' },
    { x: 4,     y: 5,   index: 3,   color: 'red' },
    { x: 5,     y: 5,   index: 4,   color: 'red' },
    { x: 5,     y: 4,   index: 5,   color: 'red' },
    { x: 5,     y: 3,   index: 6,   color: 'red' },
    { x: 5,     y: 2,   index: 7,   color: 'red' },
    { x: 5,     y: 1,   index: 8,   color: 'red' },

    // // Blue Area
    { x: 6,     y: 1,   index: 9,   color: 'blue', isEndPlace: true },
    { x: 7,     y: 1,   index: 10,  color: 'blue', isStartPlace: true },
    { x: 7,     y: 2,   index: 11,  color: 'blue' },
    { x: 7,     y: 3,   index: 12,  color: 'blue' },
    { x: 7,     y: 4,   index: 13,  color: 'blue' },
    { x: 7,     y: 5,   index: 14,  color: 'blue' },
    { x: 8,     y: 5,   index: 15,  color: 'blue' },
    { x: 9,     y: 5,   index: 16,  color: 'blue' },
    { x: 10,    y: 5,   index: 17,  color: 'blue' },
    { x: 11,    y: 5,   index: 18,  color: 'blue' },

    // // Green Area
    { x: 11,    y: 6,   index: 19,  color: 'green', isEndPlace: true },
    { x: 11,    y: 7,   index: 20,  color: 'green', isStartPlace: true },
    { x: 10,    y: 7,   index: 21,  color: 'green' },
    { x: 9,     y: 7,   index: 22,  color: 'green' },
    { x: 8,     y: 7,   index: 23,  color: 'green' },
    { x: 7,     y: 7,   index: 24,  color: 'green' },
    { x: 7,     y: 8,   index: 25,  color: 'green' },
    { x: 7,     y: 9,   index: 26,  color: 'green' },
    { x: 7,     y: 10,  index: 27,  color: 'green' },
    { x: 7,     y: 11,  index: 28,  color: 'green' },

    // // Yellow area
    { x: 6,     y: 11,  index: 29,  color: 'yellow', isEndPlace: true },
    { x: 5,     y: 11,  index: 30,  color: 'yellow', isStartPlace: true },
    { x: 5,     y: 10,  index: 31,  color: 'yellow' },
    { x: 5,     y: 9,   index: 32,  color: 'yellow' },
    { x: 5,     y: 8,   index: 33,  color: 'yellow' },
    { x: 5,     y: 7,   index: 34,  color: 'yellow' },
    { x: 4,     y: 7,   index: 35,  color: 'yellow' },
    { x: 3,     y: 7,   index: 36,  color: 'yellow' },
    { x: 2,     y: 7,   index: 37,  color: 'yellow' },
    { x: 1,     y: 7,   index: 38,  color: 'yellow' },

    // // End place of red
    { x: 1,     y: 6,   index: 36,  color: 'red', isEndPlace: true },
    
]
export const ludo_destination: LudoDestination[] = [
    // Red destination
    { x: 2,     y: 6,   index: 1,   color: 'red'},
    { x: 3,     y: 6,   index: 2,   color: 'red'},
    { x: 4,     y: 6,   index: 3,   color: 'red'},
    { x: 5,     y: 6,   index: 4,   color: 'red'},
    
    // Blue
    { x: 6,     y: 2,   index: 1,   color: 'blue'},
    { x: 6,     y: 3,   index: 2,   color: 'blue'},
    { x: 6,     y: 4,   index: 3,   color: 'blue'},
    { x: 6,     y: 5,   index: 4,   color: 'blue'},

    // Green
    { x: 10,    y: 6,   index: 1,   color: 'green'},
    { x: 9,     y: 6,   index: 2,   color: 'green'},
    { x: 8,     y: 6,   index: 3,   color: 'green'},
    { x: 7,     y: 6,   index: 4,   color: 'green'},

    // yellow
    { x: 6,     y: 10,   index: 1,   color: 'yellow'},
    { x: 6,     y: 9,   index: 2,   color: 'yellow'},
    { x: 6,     y: 8,   index: 3,   color: 'yellow'},
    { x: 6,     y: 7,   index: 4,   color: 'yellow'},
]
export const position_to_color: Record<LudoPosition, LudoColor> = {
    1: 'red',
    2: 'blue',
    3: 'green',
    4: 'yellow'
}