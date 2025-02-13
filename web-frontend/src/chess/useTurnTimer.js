import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import chessSlice from "./chessSlice";
import { useTurn } from "./getTurn";
import { ACTIVE_TURN_ORDER } from "./turnOrders";

const PLAYER_TIME_MS = 1000 * 60 * 10; // Ten minutes
const PLAYER_INCREMENT_TIME = 1000 * 5; // Five seconds

export const GRACE_TIME_MS = 1000;
const TIMER_UPDATE_FREQ_MS = 300;

export const useTurnTimer = () => {
    // Start clock when white moves
    const dispatch = useDispatch();
    const moveHistory = useSelector((state) => state.chess.moveHistory);
    const matchStartTime = useSelector((state) => state.chess.matchStartTime);
    useEffect(() => {
        if (moveHistory.length === 1 && matchStartTime === null) {
            dispatch(chessSlice.actions.setMatchStartTime());
        }
    }, [dispatch, matchStartTime, moveHistory.length]);
};

const useGetCurrentMoveDuration = () => {
    const matchStartTime = useSelector((state) => state.chess.matchStartTime);
    const moveDurationsMs = useSelector((state) => state.chess.moveDurationsMs);
    const moveHistory = useSelector((state) => state.chess.moveHistory);
    return useCallback(() => {
        if (moveHistory.length === 0) {
            return 0;
        }
        return Date.now() - matchStartTime - _.sum(moveDurationsMs);
    }, [matchStartTime, moveDurationsMs, moveHistory.length]);
};

export const useGetPlayerTimeMs = () => {
    const moveDurationsMs = useSelector((state) => state.chess.moveDurationsMs);
    const getCurrentMoveDuration = useGetCurrentMoveDuration();
    const turn = useTurn();
    return useCallback(
        (player) => {
            let timeMs = PLAYER_TIME_MS;
            if (turn[0] === player) {
                timeMs -= getCurrentMoveDuration();
            }
            const playerMoveDurationsMs = moveDurationsMs.filter(
                (durationMs, index) => {
                    if (durationMs === null) {
                        return false;
                    }
                    const turnOrderIndex = index % ACTIVE_TURN_ORDER.length;
                    return ACTIVE_TURN_ORDER[turnOrderIndex][0] === player;
                },
            );
            timeMs -= _.sum(playerMoveDurationsMs);
            timeMs += PLAYER_INCREMENT_TIME * playerMoveDurationsMs.length;
            return timeMs;
        },
        [getCurrentMoveDuration, moveDurationsMs, turn],
    );
};

export const usePlayerTimeMs = (player) => {
    const getPlayerTimeMs = useGetPlayerTimeMs();
    const [timeMs, setTimeMs] = useState(getPlayerTimeMs(player));
    useEffect(() => {
        const interval = setInterval(
            () => setTimeMs(getPlayerTimeMs(player)),
            TIMER_UPDATE_FREQ_MS,
        );
        return () => clearInterval(interval);
    }, [getPlayerTimeMs, player]);
    return timeMs;
};
