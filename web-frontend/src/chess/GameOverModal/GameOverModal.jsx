import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Modal from "../Modal/Modal";
import styles from "./GameOverModal.module.css";

const GameOverModal = () => {
    const winner = useSelector((state) => state.chess.winner);
    const player1Name = useSelector((state) => state.chess.player1Name);
    const player2Name = useSelector((state) => state.chess.player2Name);
    const isTie = useSelector((state) => state.chess.isTie);
    const [isClosed, setIsClosed] = useState(false);
    const isVisible = useMemo(
        () => (winner || isTie) && !isClosed,
        [isClosed, isTie, winner],
    );
    const onReset = () => location.reload();
    const onClose = () => setIsClosed(true);
    const gameOverText = useMemo(() => {
        if (isTie) {
            return "It's a draw!";
        }
        if (winner === "1") {
            return player1Name + " wins!";
        }
        return player2Name + " wins!";
    }, [isTie, player1Name, player2Name, winner]);
    return (
        <Modal isVisible={isVisible} className={styles.container}>
            <div className={styles.text}>{gameOverText}</div>
            <div className={styles.buttons}>
                <div className={styles.button} onClick={onReset}>
                    Reset
                </div>
                <div className={styles.button} onClick={onClose}>
                    Close
                </div>
            </div>
        </Modal>
    );
};

export default GameOverModal;
