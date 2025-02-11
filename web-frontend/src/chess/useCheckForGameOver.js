import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFileAndRankIndices } from "./chessCoordinates";
import chessSlice from "./chessSlice";
import { useTurn } from "./getTurn";
import {
    getBoardStateIndices,
    getIsInCheck,
    getPossibleMoves,
} from "./useCalculatePossibleMoves";

export const useCheckForGameOver = () => {
    const dispatch = useDispatch();
    const boardState = useSelector((state) => state.chess.boardState);
    const isPromotingPawn = useSelector((state) => state.chess.isPromotingPawn);
    const turn = useTurn();
    const moveHistory = useSelector((state) => state.chess.moveHistory);
    useEffect(() => {
        if (isPromotingPawn) {
            return;
        }
        if (moveHistory.length === 0) {
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
                dispatch(chessSlice.actions.setWinner(winner));
            } else {
                dispatch(chessSlice.actions.setIsTie(true));
            }
        }
    }, [
        boardState,
        dispatch,
        isPromotingPawn,
        moveHistory,
        moveHistory.length,
        turn,
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
