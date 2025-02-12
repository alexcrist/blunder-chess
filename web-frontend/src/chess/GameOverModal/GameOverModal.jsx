import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../main/Button/Button";
import { useNavigateToMenu, VIEWS } from "../../main/useNavigation";
import chessSlice from "../chessSlice";
import Modal from "../Modal/Modal";
import styles from "./GameOverModal.module.css";

const GameOverModal = () => {
    const dispatch = useDispatch();
    const didPeerDisconnect = useSelector(
        (state) => state.main.didPeerDisconnect,
    );
    const connectedPeer = useSelector((state) => state.main.connectedPeer);
    const winner = useSelector((state) => state.chess.winner);
    const player1Name = useSelector((state) => state.chess.player1Name);
    const player2Name = useSelector((state) => state.chess.player2Name);
    const isTie = useSelector((state) => state.chess.isTie);
    const isGameOverModalClosed = useSelector(
        (state) => state.chess.isGameOverModalClosed,
    );
    const view = useSelector((state) => state.main.view);
    const isVisible = useMemo(() => {
        if (isGameOverModalClosed) {
            return false;
        }
        if (view === VIEWS.GAME_ONLINE && didPeerDisconnect) {
            return true;
        }
        if (winner || isTie) {
            return true;
        }
        return false;
    }, [didPeerDisconnect, isGameOverModalClosed, isTie, view, winner]);
    const navigateToMenu = useNavigateToMenu();
    const onMenu = () => navigateToMenu();
    const onClose = () =>
        dispatch(chessSlice.actions.setIsGameOverModalClosed(true));
    const gameOverText = useMemo(() => {
        if (didPeerDisconnect) {
            return `${connectedPeer?.name} disconnected. You win!`;
        }
        if (isTie) {
            return "It's a draw!";
        }
        if (winner === "1") {
            return player1Name + " wins!";
        }
        if (winner === "2") {
            return player2Name + " wins!";
        }
    }, [
        connectedPeer,
        didPeerDisconnect,
        isTie,
        player1Name,
        player2Name,
        winner,
    ]);
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
