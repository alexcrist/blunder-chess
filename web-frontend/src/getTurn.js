import { useMemo } from "react";
import { useSelector } from "react-redux";

const TURN_ORDER = [
    ...["1w"],
    ...["2b", "2w", "1b", "1w"],
    ...["2b"],
    ...["1w", "1b", "2w", "2b"],
];

export const useTurn = () => {
    const globalTurnIndex = useSelector((state) => state.chess.globalTurnIndex);
    return useMemo(() => getTurn(globalTurnIndex), [globalTurnIndex]);
};

export const getTurn = (globalTurnIndex) => {
    const turnIndex = globalTurnIndex % TURN_ORDER.length;
    return TURN_ORDER[turnIndex];
};
