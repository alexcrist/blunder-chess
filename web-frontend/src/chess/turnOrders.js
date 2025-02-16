// prettier-ignore
const TURN_ORDERS = {
    VERSION_1: [
        "1w",
        "2b", "2w",
        "1b", "1w",
        "2b",
        "1w", "1b",
        "2w", "2b",
    ],
    VERSION_2: [

        // Five normal moves
        "1w",
        "2b",
        "1w",
        "2b",
        "1w",

        // Players blunder for opponent (player 2 has move-order-advantage)
        "1b",
        "2w",

        // Five normal moves
        "2b",
        "1w",
        "2b",
        "1w",
        "2b",

        // Players blunder for opponent (player 1 has move-order-advantage)
        "2w",
        "1b",
    ],
};

export const ACTIVE_TURN_ORDER = TURN_ORDERS.VERSION_2;
