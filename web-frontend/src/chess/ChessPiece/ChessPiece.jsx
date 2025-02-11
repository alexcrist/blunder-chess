import classNames from "classnames";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "./ChessPiece.module.css";

const DRAGGED_SIZE_INCREASE = 1.5;

const SPRITE_POSITIONS = {
    wk: [0, 0],
    wq: [1, 0],
    wr: [2, 0],
    wb: [3, 0],
    wn: [4, 0],
    wp: [5, 0],
    bk: [0, 1],
    bq: [1, 1],
    br: [2, 1],
    bb: [3, 1],
    bn: [4, 1],
    bp: [5, 1],
};

const ChessPiece = ({ pieceString, coordinate }) => {
    // Calculate piece size
    const boardSizePx = useSelector((state) => state.chess.boardSizePx) ?? 0;
    const pieceSizePx = useMemo(() => {
        return boardSizePx / 8;
    }, [boardSizePx]);

    // Determine if piece is being dragged
    const isMouseDown = useSelector((state) => state.chess.isMouseDown);
    const draggedPieceXY = useSelector((state) => state.chess.draggedPieceXY);
    const sourceCoordinate = useSelector(
        (state) => state.chess.sourceCoordinate,
    );
    const isBeingDragged = useMemo(
        () => isMouseDown && sourceCoordinate === coordinate,
        [coordinate, isMouseDown, sourceCoordinate],
    );

    // Style piece
    const style = useMemo(() => {
        const x = SPRITE_POSITIONS[pieceString][0] * -100;
        const y = SPRITE_POSITIONS[pieceString][1] * -100;
        const style = {
            width: pieceSizePx * 0.9,
            height: pieceSizePx * 0.9,
            backgroundPosition: `${x}% ${y}%`,
        };
        if (isBeingDragged) {
            style.width *= DRAGGED_SIZE_INCREASE;
            style.height *= DRAGGED_SIZE_INCREASE;
            style.marginLeft = -style.width / 2;
            style.marginTop = -style.height;
            style.left = draggedPieceXY?.x ?? 0;
            style.top = draggedPieceXY?.y ?? 0;
        }
        return style;
    }, [
        draggedPieceXY?.x,
        draggedPieceXY?.y,
        isBeingDragged,
        pieceSizePx,
        pieceString,
    ]);

    return (
        <div
            id={coordinate}
            style={style}
            className={classNames(styles.container, {
                [styles.isBeingDragged]: isBeingDragged,
            })}
        >
            <div className={styles.image} />
        </div>
    );
};

export default ChessPiece;
