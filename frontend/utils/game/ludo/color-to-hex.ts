import type { LudoColor } from "~/constants";

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