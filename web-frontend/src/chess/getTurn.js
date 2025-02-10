import { useMemo } from "react";
import { useSelector } from "react-redux";
import { TURN_ORDERS } from "./turnOrders";

const TURN_ORDER = TURN_ORDERS.VERSION_2;

export const useTurn = () => {
    const globalTurnIndex = useSelector((state) => state.chess.globalTurnIndex);
    return useMemo(() => getTurn(globalTurnIndex), [globalTurnIndex]);
};

export const getTurn = (globalTurnIndex) => {
    const turnIndex = globalTurnIndex % TURN_ORDER.length;
    return TURN_ORDER[turnIndex];
};

const validateTurnOrder = (turnOrder) => {
    for (let i = 0; i < turnOrder.length; i++) {
        const [player, color] = turnOrder[i];
        const expectedColor = i % 2 === 0 ? "w" : "b";
        if (color !== expectedColor) {
            throw Error(`Invalid turn order (i=${i}, color=${color})`);
        }
        if (player !== "1" && player !== "2") {
            throw Error(`Invalid turn order (i=${i}, player=${player})`);
        }
    }
};

validateTurnOrder(TURN_ORDER);
