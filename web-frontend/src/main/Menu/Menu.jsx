import { useMemo } from "react";
import { useSelector } from "react-redux";
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
    const pageWidth = useSelector((state) => state.main.pageWidth);
    const fontSize = useMemo(() => {
        return Math.min(100, pageWidth / 12);
    }, [pageWidth]);

    return (
        <div className={styles.container}>
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
