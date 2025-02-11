import { useSelector } from "react-redux";
import Chess from "../../chess/Chess/Chess";
import GameOverModal from "../../chess/GameOverModal/GameOverModal";
import PawnPromotionModal from "../../chess/PawnPromotionModal/PawnPromotionModal";
import ConnectionMenu from "../../networking/ConnectionMenu/ConnectionMenu";
import Menu from "../Menu/Menu";
import styles from "./App.module.css";

const App = () => {
    const isGameActive = useSelector((state) => state.main.isGameActive);
    const isConnectingToPeer = useSelector(
        (state) => state.main.isConnectingToPeer,
    );

    let view = <Menu />;
    if (isGameActive) {
        view = <Chess />;
    } else if (isConnectingToPeer) {
        view = <ConnectionMenu />;
    }

    return (
        <div className={styles.container}>
            {view}
            <PawnPromotionModal />
            <GameOverModal />
        </div>
    );
};

export default App;
