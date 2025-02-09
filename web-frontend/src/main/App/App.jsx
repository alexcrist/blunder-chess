import { useSelector } from "react-redux";
import Chess from "../../chess/Chess/Chess";
import GameOverModal from "../../chess/GameOverModal/GameOverModal";
import PawnPromotionModal from "../../chess/PawnPromotionModal/PawnPromotionModal";
import Menu from "../Menu/Menu";

const App = () => {
    const isGameActive = useSelector((state) => state.main.isGameActive);
    console.log("isGameActive", isGameActive);

    let view = <Menu />;
    if (isGameActive) {
        view = <Chess />;
    }

    return (
        <div>
            {view}
            <PawnPromotionModal />
            <GameOverModal />
        </div>
    );
};

export default App;
