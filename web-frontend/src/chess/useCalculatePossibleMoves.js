import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTurn } from "../getTurn";
import mainSlice from "../mainSlice";
import { getCoordinate, getFileAndRankIndices } from "./chessCoordinates";

export const useCalculatePossibleMoves = () => {
    const dispatch = useDispatch();
    const sourceCoordinate = useSelector(
        (state) => state.main.sourceCoordinate,
    );
    const boardState = useSelector((state) => state.main.boardState);
    const moveHistory = useSelector((state) => state.main.moveHistory);
    const turn = useTurn();
    const boardStateIndices = useMemo(() => {
        return getBoardStateIndices(boardState);
    }, [boardState]);
    const moveHistoryIndices = useMemo(() => {
        return moveHistory.map(({ source, dest }) => {
            return {
                source: getFileAndRankIndices(source),
                dest: getFileAndRankIndices(dest),
            };
        });
    }, [moveHistory]);
    useEffect(() => {
        const possibleMoves = getPossibleMoves(
            sourceCoordinate,
            boardStateIndices,
            moveHistoryIndices,
            turn,
        );
        dispatch(mainSlice.actions.setPossibleMoves(possibleMoves));
    }, [
        boardStateIndices,
        dispatch,
        turn,
        moveHistoryIndices,
        sourceCoordinate,
    ]);
};

const getBoardStateIndices = (boardState) => {
    const boardStateIndices = {};
    for (const coordinate in boardState) {
        const [fileIndex, rankIndex] = getFileAndRankIndices(coordinate);
        const piece = boardState[coordinate];
        boardStateIndices[fileIndex] ??= {};
        boardStateIndices[fileIndex][rankIndex] = piece;
    }
    return boardStateIndices;
};

const getPossibleMoves = (
    coordinate,
    boardStateIndices,
    moveHistoryIndices,
    turn,
) => {
    if (!coordinate) {
        return [];
    }
    const [fileIndex, rankIndex] = getFileAndRankIndices(coordinate);
    const piece = boardStateIndices?.[fileIndex]?.[rankIndex];
    if (!piece) {
        return [];
    }
    const [pieceColor, pieceType] = piece;
    const turnColor = turn[1];
    if (turnColor !== pieceColor) {
        return [];
    }
    const isWhite = pieceColor === "w";
    const moves = getMovesForPieceType(
        pieceType,
        fileIndex,
        rankIndex,
        isWhite,
        boardStateIndices,
        moveHistoryIndices,
    );
    return moves
        .filter((move) => {
            return !getWouldBeInCheck(move, isWhite, boardStateIndices);
        })
        .map(([fileIndex, rankIndex]) => getCoordinate(fileIndex, rankIndex));
};

const getMovesForPieceType = (
    pieceType,
    fileIndex,
    rankIndex,
    isWhite,
    boardStateIndices,
    moveHistoryIndices,
) => {
    switch (pieceType) {
        case "k":
            return getKingMoves(
                fileIndex,
                rankIndex,
                isWhite,
                boardStateIndices,
                moveHistoryIndices,
            );
        case "q":
            return getQueenMoves(
                fileIndex,
                rankIndex,
                isWhite,
                boardStateIndices,
            );
        case "b":
            return getBishopMoves(
                fileIndex,
                rankIndex,
                isWhite,
                boardStateIndices,
            );
        case "n":
            return getKnightMoves(
                fileIndex,
                rankIndex,
                isWhite,
                boardStateIndices,
            );
        case "r":
            return getRookMoves(
                fileIndex,
                rankIndex,
                isWhite,
                boardStateIndices,
            );
        case "p":
            return getPawnMoves(
                fileIndex,
                rankIndex,
                isWhite,
                boardStateIndices,
                moveHistoryIndices,
            );
        default:
            throw Error(`Unknown piece type: ${pieceType}`);
    }
};

const getKingMoves = (
    fileIndex,
    rankIndex,
    isWhite,
    boardStateIndices,
    moveHistoryIndices,
) => {
    const moves = [
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
    ].map(([dFile, dRank]) => [fileIndex + dFile, rankIndex + dRank]);

    // TODO: add kingside castle
    // * cant castle thorugh check
    // * can't have moved king
    // * can't have moved kingside rook
    // TODO: add queenside castle (note, cannot castle through check)
    // * cant castle thorugh check
    // * can't have moved king
    // * can't have moved queenside rook
    return moves
        .filter(getIsOnBoard)
        .filter(
            (move) => !getWouldTakeOwnPiece(move, isWhite, boardStateIndices),
        );
};

const getQueenMoves = (fileIndex, rankIndex, isWhite, boardStateIndices) => {
    // TODO
    return [];
};

const getKnightMoves = (fileIndex, rankIndex, isWhite, boardStateIndices) => {
    // TODO
    return [];
};

const getBishopMoves = (fileIndex, rankIndex, isWhite, boardStateIndices) => {
    // TODO
    return [];
};

const getRookMoves = (fileIndex, rankIndex, isWhite, boardStateIndices) => {
    // TODO
    return [];
};

const getPawnMoves = (
    fileIndex,
    rankIndex,
    isWhite,
    boardStateIndices,
    moveHistoryIndices,
) => {
    const moves = [];
    const moveMultiplier = isWhite ? 1 : -1;

    // Advance forward one square
    const advanceOneSquare = [fileIndex, rankIndex + 1 * moveMultiplier];
    if (!boardStateIndices?.[advanceOneSquare[0]]?.[advanceOneSquare[1]]) {
        moves.push(advanceOneSquare);
    }

    // Advance forward two squares
    const hasPawnMoved =
        (isWhite && rankIndex !== 1) || (!isWhite && rankIndex !== 6);
    const advanceTwoSquares = [fileIndex, rankIndex + 2 * moveMultiplier];
    if (
        !hasPawnMoved &&
        !boardStateIndices?.[advanceTwoSquares[0]]?.[advanceTwoSquares[1]]
    ) {
        moves.push(advanceTwoSquares);
    }

    // TODO: pawn take

    // TODO: en passant

    return moves;
};

const getIsOnBoard = ([fileIndex, rankIndex]) => {
    return fileIndex >= 0 && fileIndex <= 7 && rankIndex >= 0 && rankIndex <= 7;
};

const getWouldTakeOwnPiece = (
    [fileIndex, rankIndex],
    isWhite,
    boardStateIndices,
) => {
    const piece = boardStateIndices?.[fileIndex]?.[rankIndex];
    if (!piece) {
        return false;
    }
    const isPieceWhite = piece[0] === "w";
    return (isWhite && isPieceWhite) || (!isWhite && !isPieceWhite);
};

const getWouldBeInCheck = () => {
    // TODO
    return false;
};

const getIsInCheck = (boardStateIndices, isWhite) => {
    // TODO
    return false;
};

const getIsSquareBeingAttacked = (
    boardStateIndices,
    isDefenderWhite,
    isDefenderBlack,
) => {
    // TODO
    return false;
};
