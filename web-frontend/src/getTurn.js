const TURN_ORDER = [
    ...["1w"],
    ...["2b", "2w", "1b", "1w"],
    ...["2b"],
    ...["1w", "1b", "2w", "2b"],
];

export const getTurn = (globalTurnIndex) => {
    const turnIndex = globalTurnIndex % TURN_ORDER.length;
    return TURN_ORDER[turnIndex];
};
