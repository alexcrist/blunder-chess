import { useDispatch } from "react-redux";
import CheckboardBackground from "../CheckboardBackground/CheckboardBackground";
import mainSlice from "../mainSlice";
import styles from "./Menu.module.css";

const Menu = () => {
    const dispatch = useDispatch();
    const onPlayLocal = () => {
        dispatch(mainSlice.actions.setIsGameActive(true));
    };
    const onPlayDualScreen = () => {
        dispatch(mainSlice.actions.setIsConnectingToDualScreen(true));
    };
    return (
        <div className={styles.container}>
            <CheckboardBackground />
            <div className={styles.title}>Blunder Chess</div>
            <div className={styles.button} onClick={onPlayLocal}>
                Blunder locally
            </div>
            <div className={styles.button} onClick={onPlayDualScreen}>
                Blunder dual-screen
            </div>
        </div>
    );
};

export default Menu;
