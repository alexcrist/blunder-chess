import { usePlayerTimeMs } from "../useTurnTimer";
import styles from "./TurnTimer.module.css";

const formatTime = (timeMs) => {
    let isNegative = false;
    if (timeMs < 0) {
        timeMs *= -1;
        isNegative = true;
    }
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${isNegative ? "-" : ""}${String(minutes)}:${String(seconds).padStart(2, "0")}`;
};

const TurnTimer = ({ player }) => {
    const timeMs = usePlayerTimeMs(player);
    return <div className={styles.container}>{formatTime(timeMs)}</div>;
};

export default TurnTimer;
