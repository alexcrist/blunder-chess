import classnames from "classnames";
import ChessBoard from "../ChessBoard/ChessBoard";
import TurnIndicator from "../TurnIndicator/TurnIndicator";
import styles from "./App.module.css";

const App = () => {
    return (
        <div className={styles.container}>
            <div className={styles.board}>
                <div className={classnames(styles.player, styles.player2)}>
                    Player 2
                </div>
                <ChessBoard />
                <div className={classnames(styles.player, styles.player1)}>
                    Player 1
                </div>
            </div>
            <TurnIndicator />
        </div>
    );
};

export default App;
