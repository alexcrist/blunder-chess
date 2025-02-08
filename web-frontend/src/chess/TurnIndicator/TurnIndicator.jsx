import classNames from "classnames";
import { useSelector } from "react-redux";
import { getTurn } from "../../getTurn";
import styles from "./TurnIndicator.module.css";

const TurnIndicator = () => {
    const globalTurnIndex = useSelector((state) => state.main.globalTurnIndex);
    const turns = [];
    for (let i = 0; i < 30; i++) {
        turns.push(getTurn(globalTurnIndex + i));
    }

    return (
        <div className={styles.container}>
            <div className={styles.turns}>
                {turns.map((turn, index) => {
                    const [player, color] = turn;
                    return (
                        <div
                            className={classNames(
                                styles.turn,
                                styles[`player${player}`],
                                {
                                    [styles.isActive]: index === 0,
                                },
                            )}
                            key={`turn-${index}`}
                        >
                            <div className={styles.player}>
                                Player&nbsp;{player}
                            </div>
                            <div
                                className={classNames(
                                    styles.color,
                                    styles[`color${color.toUpperCase()}`],
                                )}
                            >
                                moves&nbsp;{color === "w" ? "white" : "black"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TurnIndicator;
