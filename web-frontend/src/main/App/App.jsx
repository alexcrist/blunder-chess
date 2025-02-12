import GameOverModal from "../../chess/GameOverModal/GameOverModal";
import PawnPromotionModal from "../../chess/PawnPromotionModal/PawnPromotionModal";
import { useNavigation } from "../useNavigation";
import styles from "./App.module.css";

const App = () => {
    const view = useNavigation();
    return (
        <div className={styles.container}>
            {view}
            <PawnPromotionModal />
            <GameOverModal />
        </div>
    );
};

export default App;
