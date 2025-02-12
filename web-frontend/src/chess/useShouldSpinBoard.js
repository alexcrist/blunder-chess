import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useShouldSpinBoard = () => {
    const isOnlineGame = useSelector((state) => state.main.isOnlineGame);
    const isPlayer1 = useSelector((state) => state.main.isPlayer1);
    return useMemo(() => isOnlineGame && !isPlayer1, [isOnlineGame, isPlayer1]);
};
