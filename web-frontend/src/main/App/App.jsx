import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import GameOverModal from "../../chess/GameOverModal/GameOverModal";
import PawnPromotionModal from "../../chess/PawnPromotionModal/PawnPromotionModal";
import { useElementLayoutObserver } from "../../util/useElementLayoutObserver";
import mainSlice from "../mainSlice";
import { useNavigation } from "../useNavigation";
import styles from "./App.module.css";

const App = () => {
    const view = useNavigation();
    const ref = useRef(null);
    const dispatch = useDispatch();
    const onResize = useCallback(
        ({ width }) => {
            console.log("width", width);
            dispatch(mainSlice.actions.setPageWidth(width));
        },
        [dispatch],
    );
    useElementLayoutObserver(ref, onResize);
    return (
        <div className={styles.container} ref={ref}>
            {view}
            <PawnPromotionModal />
            <GameOverModal />
        </div>
    );
};

export default App;
