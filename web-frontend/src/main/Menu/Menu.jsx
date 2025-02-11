import { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import chessSlice from "../../chess/chessSlice";
import { useElementLayoutObserver } from "../../util/useElementLayoutObserver";
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

    const [fontSize, setFontSize] = useState(20);
    const ref = useRef(null);
    const onLayout = useCallback(({ width }) => {
        setFontSize(width / 12);
    }, []);
    useElementLayoutObserver(ref, onLayout);

    return (
        <div className={styles.container} ref={ref}>
            <CheckboardBackground />
            <div className={styles.title} style={{ fontSize }}>
                blunderchess.net
            </div>
            <div
                className={styles.button}
                onClick={onPlayLocal}
                style={{ fontSize: fontSize * 0.65 }}
            >
                Blunder locally
            </div>
            <div
                className={styles.button}
                onClick={onPlayOnline}
                style={{ fontSize: fontSize * 0.65 }}
            >
                Blunder online
            </div>
        </div>
    );
};

export default Menu;
