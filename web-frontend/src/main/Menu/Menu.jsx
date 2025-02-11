import { useDispatch } from "react-redux";
import chessSlice from "../../chess/chessSlice";
import CheckboardBackground from "../CheckboardBackground/CheckboardBackground";
import mainSlice from "../mainSlice";
import styles from "./Menu.module.css";

const Menu = () => {
    const dispatch = useDispatch();
    const onPlayLocal = () => {
        dispatch(mainSlice.actions.setIsGameActive(true));
        dispatch(chessSlice.actions.setPlayer1Name("Player 1"));
        dispatch(chessSlice.actions.setPlayer2Name("Player 2"));
    };
    const onPlayOnline = () => {
        dispatch(mainSlice.actions.setIsConnectingToPeer(true));
    };
    return (
        <div className={styles.container}>
            <CheckboardBackground />
            <div className={styles.title}>blunderchess.net</div>
            <div className={styles.button} onClick={onPlayLocal}>
                Blunder locally
            </div>
            <div className={styles.button} onClick={onPlayOnline}>
                Blunder online
            </div>
        </div>
    );
};

export default Menu;
