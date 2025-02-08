import { useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import ChessBoardSquare from "../ChessBoardSquare/ChessBoardSquare";
import { useCalculatePossibleMoves } from "../useCalculatePossibleMoves";
import { useChessBoardMouseHandler } from "../useChessBoardMouseHandler";
import styles from "./ChessBoard.module.css";

const ChessBoard = () => {
    // Calculate board square coordinates (a1, b1, etc.)
    const coordinates = useMemo(() => {
        const coordinates = [];
        for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
            const row = [];
            for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
                const file = String.fromCharCode(97 + fileIndex);
                const rank = (rankIndex + 1).toString();
                const coordinate = file + rank;
                row.push(coordinate);
            }
            coordinates.push(row);
        }
        return coordinates;
    }, []);

    // Get board size
    const boardSizePx = useSelector((state) => state.main.boardSizePx) ?? 0;

    // Handle mouse events
    const containerRef = useRef(null);
    useChessBoardMouseHandler(containerRef);

    // Calculate possible moves
    useCalculatePossibleMoves();

    return (
        <div
            ref={containerRef}
            className={styles.container}
            style={{ width: `${boardSizePx}px`, height: `${boardSizePx}px` }}
        >
            {coordinates.map((row, rowIndex) => {
                return (
                    <div className={styles.row} key={`row-${rowIndex}`}>
                        {row.map((coordinate) => {
                            return (
                                <ChessBoardSquare
                                    key={`square-${coordinate}`}
                                    coordinate={coordinate}
                                />
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default ChessBoard;
