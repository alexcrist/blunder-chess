import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import mainSlice from "../../mainSlice";
import ChessPiece from "../ChessPiece/ChessPiece";
import Modal from "../Modal/Modal";
import styles from "./PawnPromotionModal.module.css";

const PawnPromotionModal = () => {
    // Determine piece color of promotion
    const boardState = useSelector((state) => state.main.boardState);
    const moveHistory = useSelector((state) => state.main.moveHistory);
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

    // Determine if promoting
    const isPromotingPawn = useSelector((state) => state.main.isPromotingPawn);

    // On promotion
    const dispatch = useDispatch();
    const onChoosePromotion = useCallback(
        (newPiece) => () => {
            dispatch(mainSlice.actions.promotePawn(newPiece));
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
        <Modal isVisible={isPromotingPawn} className={styles.container}>
            {promotionOptions}
        </Modal>
    );
};

export default PawnPromotionModal;
