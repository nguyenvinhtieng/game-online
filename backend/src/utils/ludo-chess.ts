import { ludo_routes } from "../constants/ludo";
import { Chess, LudoColor, LudoDestination, LudoPosition, LudoRouteCell } from "../types/game.ludo.type";

export const initChessesForPosition: Record<LudoPosition, Chess[]> = {
    1: [
        { x: 2, y: 2, color: "red", status: "home" },
        { x: 2, y: 3, color: "red", status: "home" },
        { x: 3, y: 2, color: "red", status: "home" },
        { x: 3, y: 3, color: "red", status: "home" },
    ],
    2: [
        { x: 9, y: 2, color: "blue", status: "home" },
        { x: 9, y: 3, color: "blue", status: "home" },
        { x: 10, y: 2, color: "blue", status: "home" },
        { x: 10, y: 3, color: "blue", status: "home" },
    ],
    3: [
        { x: 9, y: 9, color: "green", status: "home" },
        { x: 9, y: 10, color: "green", status: "home" },
        { x: 10, y: 9, color: "green", status: "home" },
        { x: 10, y: 10, color: "green", status: "home" },
    ],
    4: [
        { x: 2, y: 9, color: "yellow", status: "home" },
        { x: 2, y: 10, color: "yellow", status: "home" },
        { x: 3, y: 9, color: "yellow", status: "home" },
        { x: 3, y: 10, color: "yellow", status: "home" },
    ],
}

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

export function getFullRouteForColor(color: LudoColor) : LudoRouteCell[] {
    const startPlace = ludo_routes.find(route => route.color === color && route.isStartPlace)
    const endPlace = ludo_routes.find(route => route.color === color && route.isEndPlace)
    if(!startPlace || !endPlace) return []
    const startIndex = startPlace.index
    const endIndex = endPlace.index
    const startRoute: LudoRouteCell[] = ludo_routes.slice(startIndex)
    let endRoute: LudoRouteCell[] = []
    if(endIndex != ludo_routes.length - 1) {
        endRoute = ludo_routes.slice(0, endIndex + 1)
    }
    return startRoute.concat(endRoute);
}