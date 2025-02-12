import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import chessSlice from "./chessSlice";
import { useTurn } from "./getTurn";
import { useCanMakeMove } from "./useCanMakeMove";

export const useChessBoardMouseHandler = (containerRef) => {
    const dispatch = useDispatch();
    const sourceCoordinate = useSelector(
        (state) => state.chess.sourceCoordinate,
    );
    const boardSquaresBounds = useSelector(
        (state) => state.chess.boardSquaresBounds,
    );
    const isMouseDown = useSelector((state) => state.chess.isMouseDown);
    const boardState = useSelector((state) => state.chess.boardState);
    const getIsValidMove = useGetIsValidMove();
    const turn = useTurn();
    const canMakeMove = useCanMakeMove();

    // Handle mousedown
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        return addMouseDownListener(
            containerRef.current,
            forwardMouseCoords(({ x, y }, event) => {
                event.preventDefault();
                if (!canMakeMove) {
                    return;
                }
                dispatch(chessSlice.actions.setIsMouseDown(true));

                // User touched off the board
                const coordinate = getCoordinateAtPosition(
                    x,
                    y,
                    boardSquaresBounds,
                );
                if (coordinate === null) {
                    dispatch(chessSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // No piece had been selected yet and the touched square does not have
                // a piece
                if (sourceCoordinate === null && !boardState[coordinate]) {
                    dispatch(chessSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // No piece had been selected yet and the touched square does have
                // a piece but its not that piece color's turn
                const pieceColor = boardState[coordinate]?.[0];
                const turnColor = turn[1];
                const isSourcePieceColorCorrect = pieceColor === turnColor;
                if (
                    sourceCoordinate === null &&
                    boardState[coordinate] &&
                    !isSourcePieceColorCorrect
                ) {
                    dispatch(chessSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // No piece had been selected yet and the touched square does have
                // a piece
                if (
                    sourceCoordinate === null &&
                    boardState[coordinate] &&
                    isSourcePieceColorCorrect
                ) {
                    dispatch(
                        chessSlice.actions.setSourceCoordinate(coordinate),
                    );
                    dispatch(chessSlice.actions.setDraggedPieceXY({ x, y }));
                    return;
                }

                // Selected piece was re-touched
                if (sourceCoordinate === coordinate) {
                    dispatch(chessSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // A piece was selected and a new square was touched and the proposed
                // move is invalid and the new square does not contain a piece
                const move = { source: sourceCoordinate, dest: coordinate };
                const isValidMove = getIsValidMove(move);
                if (
                    sourceCoordinate &&
                    coordinate &&
                    !boardState[coordinate] &&
                    !isValidMove
                ) {
                    dispatch(chessSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // A piece was selected and a new square was touched and the proposed
                // move is invalid and the new square does contain a piece but that
                // piece is not the color of the current turn
                if (
                    sourceCoordinate &&
                    coordinate &&
                    boardState[coordinate] &&
                    !isValidMove &&
                    !isSourcePieceColorCorrect
                ) {
                    dispatch(chessSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // A piece was selected and a new square was touched and the proposed
                // move is invalid and the new square does contain a piece and that
                // piece is the color of the current turn
                if (
                    sourceCoordinate &&
                    coordinate &&
                    boardState[coordinate] &&
                    !isValidMove &&
                    isSourcePieceColorCorrect
                ) {
                    dispatch(
                        chessSlice.actions.setSourceCoordinate(coordinate),
                    );
                    dispatch(chessSlice.actions.setDraggedPieceXY({ x, y }));
                    return;
                }

                // A piece was selected and a new square was touched and the proposed
                // move is valid
                dispatch(chessSlice.actions.makeMove(move));
                dispatch(chessSlice.actions.setSourceCoordinate(null));
            }),
        );
    }, [
        boardSquaresBounds,
        boardState,
        canMakeMove,
        containerRef,
        dispatch,
        getIsValidMove,
        sourceCoordinate,
        turn,
    ]);

    // Handle mousemove
    useEffect(() => {
        const onMouseMove = ({ x, y }) => {
            if (!canMakeMove) {
                return;
            }
            const coordinate = getCoordinateAtPosition(
                x,
                y,
                boardSquaresBounds,
            );
            if (isMouseDown && sourceCoordinate) {
                dispatch(chessSlice.actions.setDraggedPieceXY({ x, y }));
                dispatch(chessSlice.actions.setHoveredCoordinate(coordinate));
            }
        };
        return addMouseMoveListener(onMouseMove);
    }, [
        boardSquaresBounds,
        canMakeMove,
        dispatch,
        isMouseDown,
        sourceCoordinate,
    ]);

    // Handle mouseup
    useEffect(() => {
        const onMouseUp = ({ x, y }) => {
            dispatch(chessSlice.actions.setIsMouseDown(false));
            dispatch(chessSlice.actions.setHoveredCoordinate(null));
            if (!canMakeMove) {
                return;
            }
            const coordinate = getCoordinateAtPosition(
                x,
                y,
                boardSquaresBounds,
            );

            // User performed a drag-move
            if (
                sourceCoordinate &&
                coordinate &&
                sourceCoordinate !== coordinate
            ) {
                const move = { source: sourceCoordinate, dest: coordinate };
                if (getIsValidMove(move)) {
                    dispatch(chessSlice.actions.makeMove(move));
                    dispatch(chessSlice.actions.setSourceCoordinate(null));
                }
            }
        };
        return addMouseUpListener(onMouseUp);
    }, [
        boardSquaresBounds,
        canMakeMove,
        dispatch,
        getIsValidMove,
        sourceCoordinate,
    ]);
};

export const getCoordinateAtPosition = (x, y, boardSquareBounds) => {
    for (const coordinate in boardSquareBounds) {
        const { top, left, bottom, right } = boardSquareBounds[coordinate];
        if (x > left && x < right && y > top && y < bottom) {
            return coordinate;
        }
    }
    return null;
};

const addMouseDownListener = (element, handler) => {
    element.addEventListener("mousedown", handler);
    element.addEventListener("touchstart", handler, { passive: false });
    return () => {
        element.removeEventListener("mousedown", handler);
        element.removeEventListener("touchstart", handler);
    };
};

const addMouseMoveListener = (rawHandler) => {
    const handler = forwardMouseCoords(rawHandler);
    document.addEventListener("mousemove", handler);
    document.addEventListener("touchmove", handler, { passive: false });
    return () => {
        document.removeEventListener("mousemove", handler);
        document.removeEventListener("touchmove", handler);
    };
};

const addMouseUpListener = (rawHandler) => {
    const handler = forwardMouseCoords(rawHandler);
    document.addEventListener("mouseup", handler);
    document.addEventListener("touchend", handler, { passive: false });
    document.addEventListener("touchcancel", handler, { passive: false });
    return () => {
        document.removeEventListener("mouseup", handler);
        document.removeEventListener("touchend", handler);
        document.removeEventListener("touchcancel", handler);
    };
};

const forwardMouseCoords = (handler) => {
    return (event) => {
        let x, y;
        if (event.touches && event.touches.length > 0) {
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            x = event.changedTouches[0].clientX;
            y = event.changedTouches[0].clientY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
        handler({ x, y }, event);
    };
};

const useGetIsValidMove = () => {
    const sourceCoordinate = useSelector(
        (state) => state.chess.sourceCoordinate,
    );
    const possibleMoves = useSelector((state) => state.chess.possibleMoves);
    const possibleMoveDests = useMemo(
        () => possibleMoves.map((move) => move.dest),
        [possibleMoves],
    );
    return useCallback(
        (move) => {
            const { source, dest } = move;
            return (
                sourceCoordinate === source && possibleMoveDests.includes(dest)
            );
        },
        [possibleMoveDests, sourceCoordinate],
    );
};
