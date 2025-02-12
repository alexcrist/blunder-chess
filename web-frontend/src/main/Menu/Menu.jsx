import { useCallback, useRef, useState } from "react";
import { useElementLayoutObserver } from "../../util/useElementLayoutObserver";
import CheckboardBackground from "../CheckboardBackground/CheckboardBackground";
import {
    useNavigateToConnectOnline,
    useNavigateToGameLocal,
} from "../useNavigation";
import styles from "./Menu.module.css";

const Menu = () => {
    const navigateToGameLocal = useNavigateToGameLocal();
    const navigateToConnectOnline = useNavigateToConnectOnline();

    // Calculate title / button font-size
    const [fontSize, setFontSize] = useState(20);
    const ref = useRef(null);
    const onLayout = useCallback(({ width }) => {
        const fontSize = Math.min(100, width / 12);
        setFontSize(fontSize);
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
                onClick={navigateToGameLocal}
                style={{ fontSize: fontSize * 0.65 }}
            >
                Blunder locally
            </div>
            <div
                className={styles.button}
                onClick={navigateToConnectOnline}
                style={{ fontSize: fontSize * 0.65 }}
            >
                Blunder online
            </div>
        </div>
    );
};

export default Menu;
