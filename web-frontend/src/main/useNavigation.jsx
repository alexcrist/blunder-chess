import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Chess from "../chess/Chess/Chess";
import chessSlice from "../chess/chessSlice";
import ConnectionMenu from "../networking/ConnectionMenu/ConnectionMenu";
import { disconnectFromPeer } from "../networking/peerNetwork";
import HowToPlay from "./HowToPlay/HowToPlay";
import Menu from "./Menu/Menu";
import mainSlice from "./mainSlice";

export const VIEWS = {
    MENU: "/",
    GAME_LOCAL: "/local",
    CONNECT_ONLINE: "/connect",
    GAME_ONLINE: "/online",
    HOW_TO_PLAY: "/how",
};

// If user navigates straight to online-game URL, redirect to connection page
if (window.location.pathname === VIEWS.GAME_ONLINE) {
    window.location.href = VIEWS.CONNECT_ONLINE;
}

const useNavigateTo = () => {
    const dispatch = useDispatch();
    const connectedPeer = useSelector((state) => state.main.connectedPeer);
    return useCallback(
        (view) => {
            history.pushState("", "", view);
            dispatch(mainSlice.actions.updateView());
            if (view !== VIEWS.GAME_ONLINE) {
                disconnectFromPeer(connectedPeer?.peerId);
            }
        },
        [connectedPeer?.peerId, dispatch],
    );
};

export const useNavigation = () => {
    const view = useSelector((state) => state.main.view);
    const connectedPeer = useSelector((state) => state.main.connectedPeer);
    const dispatch = useDispatch();
    const navigateTo = useNavigateTo();

    // Handle direct page loads to subpaths
    useEffect(() => {
        const search = window.location.search;
        if (search.startsWith("?/")) {
            let view = search.replace("?/", "/");
            if (view === VIEWS.GAME_ONLINE) {
                view = VIEWS.CONNECT_ONLINE;
            }
            navigateTo(view);
        }
    }, [navigateTo]);

    // Handle back button
    useEffect(() => {
        const handlePopState = () => {
            dispatch(mainSlice.actions.updateView());
            disconnectFromPeer(connectedPeer?.peerId);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [connectedPeer?.peerId, dispatch, view]);

    // Return the active view
    return useMemo(() => {
        if (view === VIEWS.MENU) {
            return <Menu />;
        } else if (view === VIEWS.GAME_LOCAL) {
            return <Chess />;
        } else if (view === VIEWS.CONNECT_ONLINE) {
            return <ConnectionMenu />;
        } else if (view === VIEWS.GAME_ONLINE) {
            return <Chess />;
        } else if (view === VIEWS.HOW_TO_PLAY) {
            return <HowToPlay />;
        } else {
            return <div>Unknown view: {view}</div>;
        }
    }, [view]);
};

export const useNavigateToMenu = () => {
    const navigateTo = useNavigateTo();
    return useCallback(() => {
        navigateTo(VIEWS.MENU);
    }, [navigateTo]);
};

export const useNavigateToGameLocal = () => {
    const dispatch = useDispatch();
    const navigateTo = useNavigateTo();
    return useCallback(() => {
        dispatch(mainSlice.actions.setIsOnlineGame(false));
        dispatch(chessSlice.actions.reset());
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
            dispatch(mainSlice.actions.setDidPeerDisconnect(false));
            dispatch(mainSlice.actions.setIsOnlineGame(true));
            dispatch(mainSlice.actions.setConnectedPeer(connectedPeer));
            dispatch(mainSlice.actions.setIsPlayer1(isPlayer1));
            dispatch(chessSlice.actions.reset());
            dispatch(chessSlice.actions.setPlayer1Name(player1Name));
            dispatch(chessSlice.actions.setPlayer2Name(player2Name));
            navigateTo(VIEWS.GAME_ONLINE);
        },
        [dispatch, navigateTo],
    );
};

export const useNavigateToHowToPlay = () => {
    const navigateTo = useNavigateTo();
    return useCallback(() => {
        navigateTo(VIEWS.HOW_TO_PLAY);
    }, [navigateTo]);
};
