import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTurn } from "./getTurn";

export const useCanMakeMove = () => {
    const isOnlineGame = useSelector((state) => state.main.isOnlineGame);
    const isPlayer1 = useSelector((state) => state.main.isPlayer1);
    const turn = useTurn();
    return useMemo(() => {
        if (!isOnlineGame) {
            return true;
        }
        const player = turn[0];
        return (player === "1" && isPlayer1) || (player === "2" && !isPlayer1);
    }, [isOnlineGame, isPlayer1, turn]);
};
