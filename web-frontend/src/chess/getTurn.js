import _ from "lodash";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ACTIVE_TURN_ORDER } from "./turnOrders";

export const useTurn = () => {
    const globalTurnIndex = useSelector((state) => state.chess.globalTurnIndex);
    return useMemo(() => getTurn(globalTurnIndex), [globalTurnIndex]);
};

export const getTurn = (globalTurnIndex) => {
    const turnIndex = globalTurnIndex % ACTIVE_TURN_ORDER.length;
    return ACTIVE_TURN_ORDER[turnIndex];
};

const validateTurnOrder = (turnOrder) => {
    const playerTurns = _.groupBy(turnOrder, (turn) => turn[0]);
    if (playerTurns["1"].length === 0 || playerTurns["2"].length === 0) {
        throw Error("A player cannot have zero turns.");
    }
    console.log("playerTurns", playerTurns);
    if (playerTurns["1"].length !== playerTurns["2"].length) {
        throw Error("Players must be given the same amount of turns.");
    }
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

validateTurnOrder(ACTIVE_TURN_ORDER);
