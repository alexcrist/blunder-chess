import { useMemo } from "react";
import ChessBoardSquare from "../ChessBoardSquare/ChessBoardSquare";
import { useChessBoardMouseHandler } from "../useChessBoardMouseHandler";
import styles from "./ChessBoard.module.css";

const ChessBoard = () => {
    // Calculate board square coordinates
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

    // Handle mouse interactions
    const onMouseDown = useChessBoardMouseHandler();

    return (
        <div
            className={styles.container}
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
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
