import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTurn } from "../getTurn";
import mainSlice from "../mainSlice";

export const useChessBoardMouseHandler = (containerRef) => {
    const dispatch = useDispatch();
    const sourceCoordinate = useSelector(
        (state) => state.main.sourceCoordinate,
    );
    const boardSquaresBounds = useSelector(
        (state) => state.main.boardSquaresBounds,
    );
    const isMouseDown = useSelector((state) => state.main.isMouseDown);
    const boardState = useSelector((state) => state.main.boardState);
    const getIsValidMove = useGetIsValidMove();
    const turn = useTurn();

    // Handle mousedown
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        return addMouseDownListener(
            containerRef.current,
            forwardMouseCoords(({ x, y }, event) => {
                event.preventDefault();
                dispatch(mainSlice.actions.setIsMouseDown(true));

                // User touched off the board
                const coordinate = getCoordinateAtPosition(
                    x,
                    y,
                    boardSquaresBounds,
                );
                if (coordinate === null) {
                    dispatch(mainSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // No piece had been selected yet and the touched square does not have
                // a piece
                if (sourceCoordinate === null && !boardState[coordinate]) {
                    dispatch(mainSlice.actions.setSourceCoordinate(null));
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
                    dispatch(mainSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // No piece had been selected yet and the touched square does have
                // a piece
                if (
                    sourceCoordinate === null &&
                    boardState[coordinate] &&
                    isSourcePieceColorCorrect
                ) {
                    dispatch(mainSlice.actions.setSourceCoordinate(coordinate));
                    dispatch(mainSlice.actions.setDraggedPieceXY({ x, y }));
                    return;
                }

                // Selected piece was re-touched
                if (sourceCoordinate === coordinate) {
                    dispatch(mainSlice.actions.setSourceCoordinate(null));
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
                    dispatch(mainSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // A piece was selected and a new square was touched and the proposed
                // move is invalid and the new square does contain a piece
                if (
                    sourceCoordinate &&
                    coordinate &&
                    boardState[coordinate] &&
                    !isValidMove
                ) {
                    dispatch(mainSlice.actions.setSourceCoordinate(coordinate));
                    dispatch(mainSlice.actions.setDraggedPieceXY({ x, y }));
                    return;
                }

                // A piece was selected and a new square was touched and the proposed
                // move is valid
                dispatch(mainSlice.actions.makeMove(move));
                dispatch(mainSlice.actions.setSourceCoordinate(null));
            }),
        );
    }, [
        boardSquaresBounds,
        boardState,
        containerRef,
        dispatch,
        getIsValidMove,
        sourceCoordinate,
    ]);

    // Handle mousemove
    useEffect(() => {
        const onMouseMove = ({ x, y }, event) => {
            event.preventDefault();
            const coordinate = getCoordinateAtPosition(
                x,
                y,
                boardSquaresBounds,
            );
            if (isMouseDown && sourceCoordinate) {
                dispatch(mainSlice.actions.setDraggedPieceXY({ x, y }));
                dispatch(mainSlice.actions.setHoveredCoordinate(coordinate));
            }
        };
        return addMouseMoveListener(onMouseMove);
    }, [boardSquaresBounds, dispatch, isMouseDown, sourceCoordinate]);

    // Handle mouseup
    useEffect(() => {
        const onMouseUp = (positionXY, event) => {
            const { x, y } = positionXY;
            event.preventDefault();
            dispatch(mainSlice.actions.setIsMouseDown(false));
            const coordinate = getCoordinateAtPosition(
                x,
                y,
                boardSquaresBounds,
            );
            dispatch(mainSlice.actions.setHoveredCoordinate(null));

            // User performed a drag-move
            if (
                sourceCoordinate &&
                coordinate &&
                sourceCoordinate !== coordinate
            ) {
                const move = { source: sourceCoordinate, dest: coordinate };
                if (getIsValidMove(move)) {
                    dispatch(mainSlice.actions.makeMove(move));
                    dispatch(mainSlice.actions.setSourceCoordinate(null));
                }
            }
        };
        return addMouseUpListener(onMouseUp);
    }, [boardSquaresBounds, dispatch, getIsValidMove, sourceCoordinate]);
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
    document.addEventListener("touchmove", handler);
    return () => {
        document.removeEventListener("mousemove", handler);
        document.removeEventListener("touchmove", handler);
    };
};

const addMouseUpListener = (rawHandler) => {
    const handler = forwardMouseCoords(rawHandler);
    document.addEventListener("mouseup", handler);
    document.addEventListener("touchend", handler);
    document.addEventListener("touchcancel", handler);
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
        (state) => state.main.sourceCoordinate,
    );
    const possibleMoves = useSelector((state) => state.main.possibleMoves);
    return useCallback(
        (move) => {
            const { source, dest } = move;
            return sourceCoordinate === source && possibleMoves.includes(dest);
        },
        [possibleMoves, sourceCoordinate],
    );
};
