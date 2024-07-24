import type { LudoColor } from "~/constants";
import type { LudoPosition } from "~/types/game.ludo";

export function colorToHex(color: LudoColor) {
    switch (color){
        case "red":
            return "#FF2F2F";
        case "green":
            return "#2FFF50";
        case "blue":
            return "#2F8FFF";
        case "yellow":
            return "#FFD700";
        default:
            return "#FF2F2F";
    }
}

export function positionToHex(position: LudoPosition) {
    switch (position){
        case 1:
            return "#FF2F2F";
        case 2:
            return "#2FFF50";
        case 3:
            return "#2F8FFF";
        case 4:
            return "#FFD700";
        default:
            return "#FF2F2F";
    }
}