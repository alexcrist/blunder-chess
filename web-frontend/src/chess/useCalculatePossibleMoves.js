import _ from "lodash";
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
        let possibleMoves = [];
        if (sourceCoordinate) {
            const [fileIndex, rankIndex] =
                getFileAndRankIndices(sourceCoordinate);
            possibleMoves = getPossibleMoves(
                fileIndex,
                rankIndex,
                boardStateIndices,
                moveHistoryIndices,
                turn,
            );
        }
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
    fileIndex,
    rankIndex,
    boardStateIndices,
    moveHistoryIndices,
    turn,
    skipCheckCheck = false,
) => {
    fileIndex = Number(fileIndex);
    rankIndex = Number(rankIndex);
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
        skipCheckCheck,
    );
    return moves
        .filter((move) => {
            if (skipCheckCheck) {
                return true;
            }
            return !getWouldBeInCheck(
                fileIndex,
                rankIndex,
                move,
                isWhite,
                boardStateIndices,
            );
        })
        .map((move) => {
            const [fileIndex, rankIndex] = move.dest;
            const newMove = {
                ...move,
                dest: getCoordinate(fileIndex, rankIndex),
            };
            return newMove;
        });
};

const getMovesForPieceType = (
    pieceType,
    fileIndex,
    rankIndex,
    isWhite,
    boardStateIndices,
    moveHistoryIndices,
    skipCheckCheck,
) => {
    switch (pieceType) {
        case "k":
            return getKingMoves(
                fileIndex,
                rankIndex,
                isWhite,
                boardStateIndices,
                moveHistoryIndices,
                skipCheckCheck,
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
    skipCheckCheck,
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
    ]
        .map(([dFile, dRank]) => [fileIndex + dFile, rankIndex + dRank])
        .filter(getIsOnBoard)
        .filter(
            (dest) => !getWouldTakeOwnPiece(dest, isWhite, boardStateIndices),
        )
        .map((dest) => ({ dest }));
    if (skipCheckCheck) {
        return moves;
    }

    // Castling
    const kingFileIndex = 4;
    const kingRankIndex = isWhite ? 0 : 7;
    const hasKingBeenMoved = getHasPieceBeenMoved(
        kingFileIndex,
        kingRankIndex,
        moveHistoryIndices,
    );
    const isInCheck = getIsInCheck(boardStateIndices, isWhite);
    if (!hasKingBeenMoved && !isInCheck) {
        const castles = [
            // Kingside
            {
                rookFileIndex: 7,
                rookRankIndex: isWhite ? 0 : 7,
                requiredOpenUnthreatenedSquares: isWhite
                    ? [
                          [5, 0],
                          [6, 0],
                      ]
                    : [
                          [5, 7],
                          [6, 7],
                      ],
                dest: isWhite ? [6, 0] : [6, 7],
                additionalMoves: [
                    {
                        source: getCoordinate(...(isWhite ? [7, 0] : [7, 7])),
                        dest: getCoordinate(...(isWhite ? [5, 0] : [5, 7])),
                    },
                ],
            },
            // Queenside
            {
                rookFileIndex: 0,
                rookRankIndex: isWhite ? 0 : 7,
                requiredOpenUnthreatenedSquares: isWhite
                    ? [
                          [1, 0],
                          [2, 0],
                          [3, 0],
                      ]
                    : [
                          [1, 7],
                          [2, 7],
                          [3, 7],
                      ],
                dest: isWhite ? [2, 0] : [2, 7],
                additionalMoves: [
                    {
                        source: getCoordinate(...(isWhite ? [0, 0] : [0, 7])),
                        dest: getCoordinate(...(isWhite ? [3, 0] : [3, 7])),
                    },
                ],
            },
        ];
        for (const castle of castles) {
            const {
                rookFileIndex,
                rookRankIndex,
                requiredOpenUnthreatenedSquares,
                dest,
                additionalMoves,
            } = castle;
            const hasRookMoved = getHasPieceBeenMoved(
                rookFileIndex,
                rookRankIndex,
                moveHistoryIndices,
            );
            if (hasRookMoved) {
                continue;
            }
            const couldCastle = _.every(
                requiredOpenUnthreatenedSquares.map(
                    ([fileIndex, rankIndex]) => {
                        const piece = boardStateIndices[fileIndex]?.[rankIndex];
                        if (piece) {
                            return false;
                        }
                        const isThreatened = getIsSquareThreatened(
                            fileIndex,
                            rankIndex,
                            boardStateIndices,
                            isWhite,
                        );
                        return !isThreatened;
                    },
                ),
            );
            if (couldCastle) {
                moves.push({ dest, additionalMoves });
            }
        }
    }

    return moves;
};

const getQueenMoves = (fileIndex, rankIndex, isWhite, boardStateIndices) => {
    const directions = [
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
    ];
    return getDirectionalMoves(
        fileIndex,
        rankIndex,
        isWhite,
        boardStateIndices,
        directions,
    );
};

const getKnightMoves = (fileIndex, rankIndex, isWhite, boardStateIndices) => {
    const moves = [
        [2, 1],
        [1, 2],
        [-1, 2],
        [-2, 1],
        [-2, -1],
        [-1, -2],
        [1, -2],
        [2, -1],
    ]
        .map(([dFile, dRank]) => [fileIndex + dFile, rankIndex + dRank])
        .filter(getIsOnBoard)
        .filter(
            (dest) => !getWouldTakeOwnPiece(dest, isWhite, boardStateIndices),
        )
        .map((dest) => ({ dest }));
    return moves;
};

const getBishopMoves = (fileIndex, rankIndex, isWhite, boardStateIndices) => {
    const directions = [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
    ];
    return getDirectionalMoves(
        fileIndex,
        rankIndex,
        isWhite,
        boardStateIndices,
        directions,
    );
};

const getRookMoves = (fileIndex, rankIndex, isWhite, boardStateIndices) => {
    const directions = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
    ];
    return getDirectionalMoves(
        fileIndex,
        rankIndex,
        isWhite,
        boardStateIndices,
        directions,
    );
};

const getPawnMoves = (
    fileIndex,
    rankIndex,
    isWhite,
    boardStateIndices,
    moveHistoryIndices,
) => {
    const moves = [];
    const rankMultiplier = isWhite ? 1 : -1;

    // Advance forward one square
    const advanceOneSquare = [fileIndex, rankIndex + 1 * rankMultiplier];
    const canAdvanceOneSquare =
        !boardStateIndices?.[advanceOneSquare[0]]?.[advanceOneSquare[1]];
    if (canAdvanceOneSquare) {
        moves.push({ dest: advanceOneSquare });
    }

    // Advance forward two squares
    const hasPawnMoved =
        (isWhite && rankIndex !== 1) || (!isWhite && rankIndex !== 6);
    const advanceTwoSquares = [fileIndex, rankIndex + 2 * rankMultiplier];
    if (
        !hasPawnMoved &&
        canAdvanceOneSquare &&
        !boardStateIndices?.[advanceTwoSquares[0]]?.[advanceTwoSquares[1]]
    ) {
        moves.push({ dest: advanceTwoSquares });
    }

    // Take moves
    const takeLeft = [fileIndex - 1, rankIndex + 1 * rankMultiplier];
    const takeRight = [fileIndex + 1, rankIndex + 1 * rankMultiplier];
    for (const take of [takeLeft, takeRight]) {
        const opponentColor = isWhite ? "b" : "w";
        const targetPieceColor = boardStateIndices?.[take[0]]?.[take[1]]?.[0];
        if (targetPieceColor === opponentColor) {
            moves.push({ dest: take });
        }
    }

    // En passant moves
    const previousMove = moveHistoryIndices[moveHistoryIndices.length - 1];
    if (
        ((isWhite && rankIndex === 4) || (!isWhite && rankIndex === 3)) &&
        previousMove
    ) {
        const enPassantDFiles = [-1, 1];
        const previousMove = moveHistoryIndices[moveHistoryIndices.length - 1];
        for (const dFile of enPassantDFiles) {
            // Must have adjacent opponent pawn
            const adjacentPiece =
                boardStateIndices?.[fileIndex + dFile]?.[rankIndex];
            if (!adjacentPiece) {
                continue;
            }
            const [adjacentPieceColor, adjacentPieceType] = adjacentPiece;
            if (
                (isWhite && adjacentPieceColor !== "b") ||
                (!isWhite && adjacentPieceColor !== "w") ||
                adjacentPieceType !== "p"
            ) {
                continue;
            }

            // Adjacent opponent pawn must have been moved two spaces from starting
            // position the previous turn
            const expectedSourceFileIndex = fileIndex + dFile;
            const expectedDestFileIndex = fileIndex + dFile;
            const expectedSourceRankIndex = isWhite ? 6 : 1;
            const expectedDestRankIndex = isWhite ? 4 : 3;
            const [sourceFileIndex, sourceRankIndex] = previousMove.source;
            const [destFileIndex, destRankIndex] = previousMove.dest;
            if (
                sourceFileIndex === expectedSourceFileIndex &&
                destFileIndex === expectedDestFileIndex &&
                sourceRankIndex === expectedSourceRankIndex &&
                destRankIndex === expectedDestRankIndex
            ) {
                const dRank = isWhite ? 1 : -1;
                const move = [fileIndex + dFile, rankIndex + dRank];
                moves.push({
                    dest: move,
                    coordinatesToDelete: [
                        getCoordinate(destFileIndex, destRankIndex),
                    ],
                });
            }
        }
    }

    return moves;
};

const getDirectionalMoves = (
    fileIndex,
    rankIndex,
    isWhite,
    boardStateIndices,
    directions,
) => {
    const moves = [];
    for (const direction of directions) {
        const [fileDirection, rankDirection] = direction;
        for (let i = 1; i <= 7; i++) {
            const targetFileIndex = fileIndex + fileDirection * i;
            const targetRankIndex = rankIndex + rankDirection * i;
            const dest = [targetFileIndex, targetRankIndex];

            // If target square is off board, direction is done
            const isOnBoard = getIsOnBoard(dest);
            if (!isOnBoard) {
                break;
            }

            // If target square is unoccupied, valid move, continue with direction
            const piece =
                boardStateIndices?.[targetFileIndex]?.[targetRankIndex];
            if (!piece) {
                moves.push({ dest });
                continue;
            }

            // If target square is occupied by self, direction is done
            const pieceColor = piece[0];
            const selfColor = isWhite ? "w" : "b";
            if (pieceColor === selfColor) {
                break;
            }

            // If target square is occupied by opponent, valid move, direction is done
            moves.push({ dest });
            break;
        }
    }
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

const getHasPieceBeenMoved = (fileIndex, rankIndex, moveHistoryIndices) => {
    for (const {
        source: [sourceFileIndex, sourceRankIndex],
    } of moveHistoryIndices) {
        if (fileIndex === sourceFileIndex && rankIndex === sourceRankIndex) {
            return true;
        }
    }
    return false;
};

const getWouldBeInCheck = (
    fileIndex,
    rankIndex,
    move,
    isWhite,
    boardStateIndices,
) => {
    const newBoardStateIndices = applyMove(
        fileIndex,
        rankIndex,
        move,
        boardStateIndices,
    );
    const isInCheck = getIsInCheck(newBoardStateIndices, isWhite);
    return isInCheck;
};

const getIsInCheck = (boardStateIndices, isWhite) => {
    const king = isWhite ? "wk" : "bk";
    const [fileIndex, rankIndex] = findPiece(king, boardStateIndices);
    return getIsSquareThreatened(
        fileIndex,
        rankIndex,
        boardStateIndices,
        isWhite,
    );
};

const getIsSquareThreatened = (
    fileIndex,
    rankIndex,
    boardStateIndices,
    isWhite,
) => {
    const threatenedCoordinates = getThreatenedCoordinates(
        boardStateIndices,
        isWhite,
    );
    for (const coordinate of threatenedCoordinates) {
        const [threatenedFileIndex, threatenedRankIndex] =
            getFileAndRankIndices(coordinate);
        if (
            Number(fileIndex) === Number(threatenedFileIndex) &&
            Number(rankIndex) === Number(threatenedRankIndex)
        ) {
            return true;
        }
    }
    return false;
};

const getThreatenedCoordinates = (boardStateIndices, isWhite) => {
    const threatenedCoordinates = new Set();
    for (const fileIndex in boardStateIndices) {
        for (const rankIndex in boardStateIndices[fileIndex]) {
            const piece = boardStateIndices[fileIndex][rankIndex];
            const pieceColor = piece[0];
            const selfColor = isWhite ? "w" : "b";
            if (pieceColor !== selfColor) {
                const moves = getPossibleMoves(
                    fileIndex,
                    rankIndex,
                    boardStateIndices,
                    [],
                    isWhite ? "xb" : "xw",
                    true,
                );
                for (const move of moves) {
                    threatenedCoordinates.add(move.dest);
                }
            }
        }
    }
    return threatenedCoordinates;
};

const applyMove = (
    sourceFileIndex,
    sourceRankIndex,
    move,
    boardStateIndices,
) => {
    const newBoardStateIndices = _.cloneDeep(boardStateIndices);
    const { dest, coordinatesToDelete = [], additionalMoves = [] } = move;
    const [destFileIndex, destRankIndex] = dest;
    const piece = boardStateIndices[sourceFileIndex][sourceRankIndex];
    newBoardStateIndices[destFileIndex] ??= {};
    newBoardStateIndices[destFileIndex][destRankIndex] = piece;
    delete newBoardStateIndices[sourceFileIndex][sourceRankIndex];
    for (const coordinate of coordinatesToDelete) {
        const [fileIndex, rankIndex] = getFileAndRankIndices(coordinate);
        delete newBoardStateIndices[fileIndex][rankIndex];
    }
    for (const move of additionalMoves) {
        const { source, dest } = move;
        const [sourceFileIndex, sourceRankIndex] =
            getFileAndRankIndices(source);
        const [destFileIndex, destRankIndex] = getFileAndRankIndices(dest);
        const piece = boardStateIndices[sourceFileIndex][sourceRankIndex];
        newBoardStateIndices[destFileIndex] ??= {};
        newBoardStateIndices[destFileIndex][destRankIndex] = piece;
        delete newBoardStateIndices[sourceFileIndex][sourceRankIndex];
    }
    return newBoardStateIndices;
};

const findPiece = (searchPiece, boardStateIndices) => {
    for (const fileIndex in boardStateIndices) {
        for (const rankIndex in boardStateIndices[fileIndex]) {
            const piece = boardStateIndices[fileIndex][rankIndex];
            if (piece === searchPiece) {
                return [fileIndex, rankIndex];
            }
        }
    }
};
