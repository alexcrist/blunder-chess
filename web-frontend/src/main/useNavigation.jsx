import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Chess from "../chess/Chess/Chess";
import chessSlice from "../chess/chessSlice";
import ConnectionMenu from "../networking/ConnectionMenu/ConnectionMenu";
import Menu from "./Menu/Menu";
import mainSlice from "./mainSlice";

export const VIEWS = {
    GAME_LOCAL: "/game/local",
    CONNECT_ONLINE: "/connect/online",
    GAME_ONLINE: "/game/online",
};

export const useNavigation = () => {
    const view = useSelector((state) => state.main.view);
    const dispatch = useDispatch();
    useEffect(() => {
        const handlePopState = () => {
            console.log("pop");
            if (window.onbeforeunload) {
                const isSure = window.confirm(
                    "Are you sure you want to navigate away?",
                );
                if (isSure) {
                    dispatch(mainSlice.actions.updateView());
                } else {
                    // Note: browsers don't love when you pushState when the user
                    // is trying to popState. On the user's second attempted popState,
                    // the browser will pop multiple states (to prevent the site from
                    // trapping the user). So the user may end up navigating away
                    // from blunderchess.net altogether
                    history.pushState({}, "", view);
                }
            } else {
                dispatch(mainSlice.actions.updateView());
            }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [dispatch, view]);

    return useMemo(() => {
        if (view === "/") {
            return <Menu />;
        } else if (view === VIEWS.GAME_LOCAL) {
            return <Chess />;
        } else if (view === VIEWS.CONNECT_ONLINE) {
            return <ConnectionMenu />;
        } else if (view === VIEWS.GAME_ONLINE) {
            return <Chess />;
        } else {
            return <div>Unknown view: {view}</div>;
        }
    }, [view]);
};

export const useNavigateTo = () => {
    const dispatch = useDispatch();
    return useCallback(
        (path) => {
            history.pushState({}, "", path);
            dispatch(mainSlice.actions.updateView());
        },
        [dispatch],
    );
};

export const useNavigateToGameLocal = () => {
    const dispatch = useDispatch();
    const navigateTo = useNavigateTo();
    return useCallback(() => {
        dispatch(mainSlice.actions.setIsOnlineGame(false));
        dispatch(chessSlice.actions.setPlayer1Name("Player 1"));
        dispatch(chessSlice.actions.setPlayer2Name("Player 2"));
        navigateTo(VIEWS.GAME_LOCAL);
    }, [dispatch, navigateTo]);
};

export const useNavigateToConnectOnline = () => {
    const navigateTo = useNavigateTo();
    return useCallback(() => {
        navigateTo(VIEWS.CONNECT_ONLINE);
    }, [navigateTo]);
};

export const useNavigateToGameOnline = () => {
    const dispatch = useDispatch();
    const navigateTo = useNavigateTo();
    return useCallback(
        ({ connectedPeer, isPlayer1, player1Name, player2Name }) => {
            dispatch(mainSlice.actions.setConnectedPeer(connectedPeer));
            dispatch(mainSlice.actions.setIsPlayer1(isPlayer1));
            dispatch(chessSlice.actions.setPlayer1Name(player1Name));
            dispatch(chessSlice.actions.setPlayer2Name(player2Name));
            navigateTo(VIEWS.GAME_LOCAL);
        },
        [dispatch, navigateTo],
    );
};
