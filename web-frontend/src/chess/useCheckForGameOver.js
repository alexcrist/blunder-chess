import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { VIEWS } from "../main/useNavigation";
import { getFileAndRankIndices } from "./chessCoordinates";
import chessSlice from "./chessSlice";
import { useTurn } from "./getTurn";
import {
    getBoardStateIndices,
    getIsInCheck,
    getPossibleMoves,
} from "./useCalculatePossibleMoves";
import { GRACE_TIME_MS, usePlayerTimeMs } from "./useTurnTimer";

export const useCheckForGameOver = () => {
    // TODO: Add game over conditions for:
    // * repition
    // * offered draw
    useCheckForPeerDisconnect();
    useCheckForMate();
    useCheckForTimeExpired();
};

const useCheckForTimeExpired = () => {
    const dispatch = useDispatch();
    const player1Time = usePlayerTimeMs("1");
    const player2Time = usePlayerTimeMs("2");
    useEffect(() => {
        if (player1Time + GRACE_TIME_MS < 0) {
            dispatch(
                chessSlice.actions.endGame({
                    winner: "2",
                    reason: "timeout",
                }),
            );
        }
        if (player2Time + GRACE_TIME_MS < 0) {
            dispatch(
                chessSlice.actions.endGame({
                    winner: "1",
                    reason: "timeout",
                }),
            );
        }
    }, [dispatch, player1Time, player2Time]);
};

const useCheckForPeerDisconnect = () => {
    const dispatch = useDispatch();
    const view = useSelector((state) => state.main.view);
    const didPeerDisconnect = useSelector(
        (state) => state.main.didPeerDisconnect,
    );
    const isPlayer1 = useSelector((state) => state.main.isPlayer1);
    useEffect(() => {
        if (view === VIEWS.GAME_ONLINE && didPeerDisconnect) {
            const winner = isPlayer1 ? "1" : "2";
            dispatch(
                chessSlice.actions.endGame({
                    winner,
                    reason: "opponent disconnecting",
                }),
            );
        }
    }, [didPeerDisconnect, dispatch, isPlayer1, view]);
};

const useCheckForMate = () => {
    const dispatch = useDispatch();
    const boardState = useSelector((state) => state.chess.boardState);
    const isPromotingPawn = useSelector((state) => state.chess.isPromotingPawn);
    const turn = useTurn();
    const moveHistory = useSelector((state) => state.chess.moveHistory);
    const view = useSelector((state) => state.main.view);
    const didPeerDisconnect = useSelector(
        (state) => state.main.didPeerDisconnect,
    );
    const isPlayer1 = useSelector((state) => state.main.isPlayer1);
    useEffect(() => {
        if (isPromotingPawn) {
            return;
        }
        if (moveHistory.length === 0) {
            return;
        }
        if (view === VIEWS.GAME_ONLINE && didPeerDisconnect) {
            const winner = isPlayer1 ? "1" : "2";
            dispatch(
                chessSlice.actions.endGame({
                    winner,
                    reason: "opponent disconnecting",
                }),
            );
            return;
        }
        const turnColor = turn[1];
        const isWhite = turnColor === "w";
        const doAnyMovesExist = getDoAnyMovesExist(
            boardState,
            moveHistory,
            turn,
        );
        if (!doAnyMovesExist) {
            const boardStateIndices = getBoardStateIndices(boardState);
            const isInCheck = getIsInCheck(boardStateIndices, isWhite);
            if (isInCheck) {
                const winner = isWhite ? "2" : "1";
                dispatch(
                    chessSlice.actions.endGame({ winner, reason: "checkmate" }),
                );
            } else {
                dispatch(
                    chessSlice.actions.endGame({
                        isTie: true,
                        reason: "stalemate",
                    }),
                );
            }
        }
    }, [
        boardState,
        didPeerDisconnect,
        dispatch,
        isPlayer1,
        isPromotingPawn,
        moveHistory,
        turn,
        view,
    ]);
};

const getDoAnyMovesExist = (boardState, moveHistory, turn) => {
    const boardStateIndices = getBoardStateIndices(boardState);
    const moveHistoryIndices = moveHistory.map(({ source, dest }) => {
        return {
            source: getFileAndRankIndices(source),
            dest: getFileAndRankIndices(dest),
        };
    });
    for (const fileIndex in boardStateIndices) {
        for (const rankIndex in boardStateIndices[fileIndex]) {
            const piece = boardStateIndices[fileIndex][rankIndex];
            const pieceColor = piece[0];
            const turnColor = turn[1];
            if (pieceColor === turnColor) {
                const moves = getPossibleMoves(
                    fileIndex,
                    rankIndex,
                    boardStateIndices,
                    moveHistoryIndices,
                    turn,
                );
                if (moves.length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
};
