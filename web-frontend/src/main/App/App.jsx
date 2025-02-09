import { useSelector } from "react-redux";
import Chess from "../../chess/Chess/Chess";
import GameOverModal from "../../chess/GameOverModal/GameOverModal";
import PawnPromotionModal from "../../chess/PawnPromotionModal/PawnPromotionModal";
import Menu from "../Menu/Menu";

const App = () => {
    const isPlayingLocalMultiplayer = useSelector(
        (state) => state.main.isPlayingLocalMultiplayer,
    );
    const isPlayingOnlineMultiplayer = useSelector(
        (state) => state.main.isPlayingOnlineMultiplayer,
    );
    const isPlayingDualScreenMultiplayer = useSelector(
        (state) => state.main.isPlayingDualScreenMultiplayer,
    );

    let view = <Menu />;
    if (isPlayingLocalMultiplayer) {
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
