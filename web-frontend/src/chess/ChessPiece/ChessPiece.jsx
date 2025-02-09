import classNames from "classnames";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "./ChessPiece.module.css";

const DRAGGED_SIZE_INCREASE = 1.5;

const ChessPiece = ({ pieceString, coordinate }) => {
    // Load image
    const imageSrc = useMemo(
        () =>
            new URL(`../../assets/pieces/${pieceString}.png`, import.meta.url)
                .href,
        [pieceString],
    );

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
        const style = {
            width: pieceSizePx,
            height: pieceSizePx,
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
    }, [draggedPieceXY, isBeingDragged, pieceSizePx]);

    return (
        <img
            id={coordinate}
            src={imageSrc}
            style={style}
            className={classNames(styles.container, {
                [styles.isBeingDragged]: isBeingDragged,
            })}
            draggable="false"
        />
    );
};

export default ChessPiece;
