import _ from "lodash";
import { useDispatch } from "react-redux";
import chessSlice from "../../chess/chessSlice";
import mainSlice from "../mainSlice";
import styles from "./Menu.module.css";

const Menu = () => {
    const dispatch = useDispatch();
    const onPlayLocal = () => {
        dispatch(mainSlice.actions.setIsGameActive(true));
        dispatch(chessSlice.actions.setDoesControlPlayer1(true));
        dispatch(chessSlice.actions.setDoesControlPlayer2(true));
    };
    const onPlayOnline = () => {
        // TODO
    };
    return (
        <div className={styles.container}>
            <div className={styles.background}>
                {_.range(500).map((index) => {
                    return <div key={index} />;
                })}
            </div>
            <div className={styles.title}>Blunder Chess</div>
            <div className={styles.button} onClick={onPlayLocal}>
                Blunder locally
            </div>
            <div className={styles.button} onClick={onPlayOnline}>
                Blunder online (coming soon)
            </div>
        </div>
    );
};

export default Menu;
