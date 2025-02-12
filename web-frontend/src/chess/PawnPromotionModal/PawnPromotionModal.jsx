import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChessPiece from "../ChessPiece/ChessPiece";
import chessSlice from "../chessSlice";
import Modal from "../Modal/Modal";
import { useCanMakeMove } from "../useCanMakeMove";
import styles from "./PawnPromotionModal.module.css";

const PawnPromotionModal = () => {
    // Determine piece color of promotion
    const boardState = useSelector((state) => state.chess.boardState);
    const moveHistory = useSelector((state) => state.chess.moveHistory);
    const pieceColor = useMemo(() => {
        const previousMove = moveHistory[moveHistory.length - 1];
        if (!previousMove) {
            return null;
        }
        const coordinate = previousMove.dest;
        const piece = boardState[coordinate];
        if (!piece) {
            return null;
        }
        return piece[0];
    }, [boardState, moveHistory]);

    // Determine if modal should be visible
    const isPromotingPawn = useSelector((state) => state.chess.isPromotingPawn);
    const canMakeMove = useCanMakeMove();
    const isVisible = useMemo(() => {
        return isPromotingPawn && canMakeMove;
    }, [canMakeMove, isPromotingPawn]);

    // On promotion
    const dispatch = useDispatch();
    const onChoosePromotion = useCallback(
        (newPiece) => () => {
            dispatch(chessSlice.actions.promotePawn(newPiece));
        },
        [dispatch],
    );

    // Promotion options
    const promotionOptions = useMemo(() => {
        if (!pieceColor) {
            return [];
        }
        return ["n", "b", "r", "q"].map((pieceType) => {
            const piece = pieceColor + pieceType;
            const coordinate = `pawn-promotion-${piece}`;
            return (
                <div
                    className={styles.pieceContainer}
                    key={coordinate}
                    onClick={onChoosePromotion(piece)}
                >
                    <ChessPiece pieceString={piece} coordinate={coordinate} />
                </div>
            );
        });
    }, [onChoosePromotion, pieceColor]);

    return (
        <Modal isVisible={isVisible} className={styles.container}>
            {promotionOptions}
        </Modal>
    );
};

export default PawnPromotionModal;
