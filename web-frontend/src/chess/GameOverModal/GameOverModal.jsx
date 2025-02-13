import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../main/Button/Button";
import { useNavigateToMenu } from "../../main/useNavigation";
import chessSlice from "../chessSlice";
import Modal from "../Modal/Modal";
import styles from "./GameOverModal.module.css";

const GameOverModal = () => {
    const dispatch = useDispatch();
    const winner = useSelector((state) => state.chess.winner);
    const player1Name = useSelector((state) => state.chess.player1Name);
    const player2Name = useSelector((state) => state.chess.player2Name);
    const isTie = useSelector((state) => state.chess.isTie);
    const isGameOverModalClosed = useSelector(
        (state) => state.chess.isGameOverModalClosed,
    );
    const gameOverReason = useSelector((state) => state.chess.gameOverReason);
    const isVisible = useMemo(() => {
        return !isGameOverModalClosed && (winner || isTie);
    }, [isGameOverModalClosed, isTie, winner]);
    const navigateToMenu = useNavigateToMenu();
    const onMenu = () => navigateToMenu();
    const onClose = () =>
        dispatch(chessSlice.actions.setIsGameOverModalClosed(true));
    const gameOverText = useMemo(() => {
        let text = `due to ${gameOverReason}`;
        if (isTie) {
            text = `Draw ${text}.`;
        }
        if (winner === "1") {
            text = `${player1Name} wins ${text}!`;
        }
        if (winner === "2") {
            text = `${player2Name} wins ${text}!`;
        }
        return text;
    }, [gameOverReason, isTie, player1Name, player2Name, winner]);
    return (
        <Modal isVisible={isVisible} className={styles.container}>
            <div className={styles.text}>{gameOverText}</div>
            <div className={styles.buttons}>
                <Button className={styles.button} onClick={onMenu}>
                    Menu
                </Button>
                <Button className={styles.button} onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
};

export default GameOverModal;
