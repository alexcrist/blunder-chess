import Chess from "../chess/Chess/Chess";
import GameOverModal from "../chess/GameOverModal/GameOverModal";
import PawnPromotionModal from "../chess/PawnPromotionModal/PawnPromotionModal";

const App = () => {
    return (
        <div>
            <Chess />
            <PawnPromotionModal />
            <GameOverModal />
        </div>
    );
};

export default App;
