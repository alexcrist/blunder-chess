import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mainSlice from "./mainSlice";

export const useChessBoardMouseHandler = () => {
    const dispatch = useDispatch();
    const sourceCoordinate = useSelector(
        (state) => state.main.sourceCoordinate,
    );
    const targetCoordinate = useSelector(
        (state) => state.main.targetCoordinate,
    );
    const wasSourceDropped = useSelector(
        (state) => state.main.wasSourceDropped,
    );
    const boardSquaresBounds = useSelector(
        (state) => state.main.boardSquaresBounds,
    );
    const boardState = useSelector((state) => state.main.boardState);

    // Handle mouse down
    const [isMouseDown, setIsMouseDown] = useState(false);
    const onMouseDown = useCallback(
        (event) => {
            return forwardMouseCoords(({ x, y }) => {
                setIsMouseDown(true);
                const coordinate = getCoordinateAtPosition(
                    x,
                    y,
                    boardSquaresBounds,
                );

                // Invalid click
                if (coordinate === null) {
                    dispatch(mainSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // No square had been selected yet
                if (sourceCoordinate === null && boardState[coordinate]) {
                    dispatch(mainSlice.actions.setSourceCoordinate(coordinate));
                    dispatch(mainSlice.actions.setTargetCoordinate(coordinate));
                    return;
                }

                // Selected square was re-clicked
                if (sourceCoordinate === coordinate) {
                    dispatch(mainSlice.actions.setSourceCoordinate(null));
                    return;
                }

                // Different square was clicked (attempt move)
                const move = { from: sourceCoordinate, to: coordinate };
                const isValidMove = getIsValidMove(move);
                if (isValidMove) {
                    dispatch(mainSlice.actions.makeMove(move));
                }
                dispatch(mainSlice.actions.setSourceCoordinate(null));
            })(event);
        },
        [boardSquaresBounds, boardState, dispatch, sourceCoordinate],
    );

    // Handle mousemove
    useEffect(() => {
        const onMouseMove = ({ x, y }) => {
            const coordinate = getCoordinateAtPosition(
                x,
                y,
                boardSquaresBounds,
            );
            if (isMouseDown && sourceCoordinate) {
                dispatch(mainSlice.actions.setTargetCoordinate(coordinate));
            }
        };
        return addMouseMoveListener(onMouseMove);
    }, [boardSquaresBounds, dispatch, isMouseDown, sourceCoordinate]);

    // Handle mouseup
    useEffect(() => {
        const onMouseUp = ({ x, y }) => {
            setIsMouseDown(false);
            const coordinate = getCoordinateAtPosition(
                x,
                y,
                boardSquaresBounds,
            );
            dispatch(mainSlice.actions.setTargetCoordinate(null));
            console.log("mouseup", coordinate);
            // if (!coordinate) {
            //     return;
            // }
            // if no source square
            //     return
            //
            // TODO: get coord, determine square
            //
            // if off board
            //     wassoucesquaredropped = true
            // if on source square
            //     if wasSourceDropped
            //         unset source square
            //         wasSourceDropped = false
            //     else
            //         wasSourceDropped = true
            // if on other square
            //     if valid move
            //         do move
            //         advance turn
            // unset target square
        };
        return addMouseUpListener(onMouseUp);
    }, [boardSquaresBounds]);

    return onMouseDown;
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

const addMouseMoveListener = (handler) => {
    const waitMs = 15;
    const maxWaitMs = 30;
    const debouncedForwardedHandler = _.debounce(
        forwardMouseCoords(handler),
        waitMs,
        {
            leading: false,
            trailing: true,
            maxWait: maxWaitMs,
        },
    );
    document.addEventListener("mousemove", debouncedForwardedHandler);
    document.addEventListener("touchmove", debouncedForwardedHandler);
    return () => {
        document.removeEventListener("mousemove", debouncedForwardedHandler);
        document.removeEventListener("touchmove", debouncedForwardedHandler);
    };
};

const addMouseUpListener = (handler) => {
    const forwardedHandler = forwardMouseCoords(handler);
    document.addEventListener("mouseup", forwardedHandler);
    document.addEventListener("touchend", forwardedHandler);
    return () => {
        document.removeEventListener("mouseup", forwardedHandler);
        document.removeEventListener("touchend", forwardedHandler);
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
        handler({ x, y });
    };
};

const getIsValidMove = () => {
    // TODO
    return true;
};
