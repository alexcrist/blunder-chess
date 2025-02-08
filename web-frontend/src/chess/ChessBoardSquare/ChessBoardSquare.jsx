import classNames from "classnames";
import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import mainSlice from "../../mainSlice";
import { useElementLayoutObserver } from "../../util/useElementLayoutObserver";
import ChessPiece from "../ChessPiece/ChessPiece";
import styles from "./ChessBoardSquare.module.css";

const ChessBoardSquare = ({ coordinate }) => {
    // Parse coordinate
    const boardState = useSelector((state) => state.main.boardState);
    const pieceString = boardState[coordinate];
    const [file, rank] = coordinate;
    const fileIndex = file.charCodeAt(0) - "a".charCodeAt(0);
    const rankIndex = Number(rank) - 1;

    // Save square bounds
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const onLayoutChange = useCallback(
        ({ top, left, bottom, right }) => {
            const bounds = { top, left, bottom, right };
            dispatch(
                mainSlice.actions.setBoardSquareBounds({
                    coordinate,
                    bounds,
                }),
            );
        },
        [coordinate, dispatch],
    );
    useElementLayoutObserver(containerRef, onLayoutChange);

    // Determine square color
    const isSquareWhite = (fileIndex + rankIndex) % 2 === 1;
    const isSquareBlack = !isSquareWhite;

    // Determine if square is source and/or is hovered
    const sourceCoordinate = useSelector(
        (state) => state.main.sourceCoordinate,
    );
    const hoveredCoordinate = useSelector(
        (state) => state.main.hoveredCoordinate,
    );
    const isSource = sourceCoordinate === coordinate;
    const isHovered = hoveredCoordinate === coordinate;

    // Determine if square was part of the previous move
    const moveHistory = useSelector((state) => state.main.moveHistory);
    const lastMove = moveHistory[moveHistory.length - 1];
    const lastMoveSource = lastMove?.source ?? null;
    const lastMoveDest = lastMove?.dest ?? null;
    const wasLastMoveSource = coordinate === lastMoveSource;
    const wasLastMoveDest = coordinate === lastMoveDest;

    // Determine if square should be highlighted
    const isHighlighted = isSource || wasLastMoveSource || wasLastMoveDest;

    // Determine if this square is currently a possible move
    const possibleMoves = useSelector((state) => state.main.possibleMoves);
    const isPossibleMove = possibleMoves.includes(coordinate);
    const isOccupied = !!pieceString;

    // Calculate label sizes
    const boardSizePx = useSelector((state) => state.main.boardSizePx) ?? 0;
    const labelFontSizePx = boardSizePx * 0.022;
    const labelMarginSizePx = boardSizePx * 0.004;

    // Calculate hovered circle size
    const hoveredCircleSizePx = (boardSizePx / 8) * 2;

    // Calculate possible move circle size
    const possibleMoveSizePx = boardSizePx / 8 / 3;
    const possibleMoveOccupiedSizePx = (boardSizePx / 8) * 0.8;
    const possibleMoveOccupiedBorderWidthPx =
        boardSizePx / 8 - (boardSizePx / 8) * 0.8;

    return (
        <div
            ref={containerRef}
            className={classNames(styles.container, {
                [styles.isSquareWhite]: isSquareWhite,
                [styles.isSquareBlack]: isSquareBlack,
                [styles.isHighlighted]: isHighlighted,
            })}
        >
            {pieceString && (
                <ChessPiece pieceString={pieceString} coordinate={coordinate} />
            )}
            {fileIndex === 0 && (
                <div
                    className={styles.fileLabel}
                    style={{
                        fontSize: `${labelFontSizePx}px`,
                        lineHeight: `${labelFontSizePx}px`,
                        margin: `${labelMarginSizePx}px`,
                    }}
                >
                    {rank}
                </div>
            )}
            {rankIndex === 0 && (
                <div
                    className={styles.rankLabel}
                    style={{
                        fontSize: `${labelFontSizePx}px`,
                        lineHeight: `${labelFontSizePx}px`,
                        margin: `${labelMarginSizePx}px`,
                    }}
                >
                    {file}
                </div>
            )}
            {isHovered && (
                <div
                    className={styles.hoverCircle}
                    style={{
                        width: `${hoveredCircleSizePx}px`,
                        height: `${hoveredCircleSizePx}px`,
                    }}
                />
            )}
            {isPossibleMove && !isOccupied && (
                <div
                    className={styles.possibleMove}
                    style={{
                        width: `${possibleMoveSizePx}px`,
                        height: `${possibleMoveSizePx}px`,
                    }}
                />
            )}
            {isPossibleMove && isOccupied && (
                <div
                    className={styles.possibleMoveOccupied}
                    style={{
                        width: `${possibleMoveOccupiedSizePx}px`,
                        height: `${possibleMoveOccupiedSizePx}px`,
                        borderWidth: `${possibleMoveOccupiedBorderWidthPx}px`,
                    }}
                />
            )}
        </div>
    );
};

export default ChessBoardSquare;
