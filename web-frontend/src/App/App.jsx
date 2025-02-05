import ChessBoard from "../ChessBoard/ChessBoard";
import styles from "./App.module.css";

const App = () => {
    return (
        <div className={styles.container}>
            <ChessBoard />
        </div>
    );
};

export default App;
