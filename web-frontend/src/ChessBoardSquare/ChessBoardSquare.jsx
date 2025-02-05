import classnames from "classnames";
import { useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChessBoardPiece from "../ChessBoardPiece/ChessBoardPiece";
import mainSlice from "../mainSlice";
import styles from "./ChessBoardSquare.module.css";

const ChessBoardSquare = ({ coordinate }) => {
    // Parse coordinate
    const boardState = useSelector((state) => state.main.boardState);
    const pieceString = boardState[coordinate];
    const [file, rank] = coordinate;
    const fileIndex = file.charCodeAt(0) - "a".charCodeAt(0);
    const rankIndex = Number(rank) - 1;

    // Determine square color
    const isSquareWhite = (fileIndex + rankIndex) % 2 === 0;
    const isSquareBlack = !isSquareWhite;

    // Save square bounds
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    useLayoutEffect(() => {
        if (containerRef.current) {
            const { top, left, right, bottom } =
                containerRef.current.getBoundingClientRect();
            const bounds = { top, left, right, bottom };
            dispatch(
                mainSlice.actions.setBoardSquareBounds({
                    coordinate,
                    bounds,
                }),
            );
        }
    }, [coordinate, dispatch]);

    // Determine if square is source and/or target
    const sourceCoordinate = useSelector(
        (state) => state.main.sourceCoordinate,
    );
    const targetCoordinate = useSelector(
        (state) => state.main.targetCoordinate,
    );
    const isSource = sourceCoordinate === coordinate;
    const isTarget = targetCoordinate === coordinate;

    return (
        <div
            ref={containerRef}
            className={classnames(styles.container, {
                [styles.isSquareWhite]: isSquareWhite,
                [styles.isSquareBlack]: isSquareBlack,
                [styles.isSource]: isSource,
                [styles.isTarget]: isTarget,
            })}
        >
            {pieceString && (
                <ChessBoardPiece pieceString={pieceString} id={coordinate} />
            )}
            {fileIndex === 0 && <div className={styles.fileLabel}>{rank}</div>}
            {rankIndex === 0 && <div className={styles.rankLabel}>{file}</div>}
        </div>
    );
};

export default ChessBoardSquare;
