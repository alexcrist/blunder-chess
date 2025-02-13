import { createSlice } from "@reduxjs/toolkit";
import { getName, setName } from "./name";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        name: getName(),
        view: window.location.pathname,
        isOnlineGame: false,
        connectedPeer: null,
        isPlayer1: false,
        isOnRequestCooldown: false,
        didPeerDisconnect: false,
        pageWidth: 0,
    },
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
            setName(state.name);
        },
        updateView: (state) => {
            state.view = window.location.pathname;
        },
        setIsOnlineGame: (state, action) => {
            state.isOnlineGame = action.payload;
        },
        setConnectedPeer: (state, action) => {
            state.connectedPeer = action.payload;
        },
        setIsPlayer1: (state, action) => {
            state.isPlayer1 = action.payload;
        },
        setIsOnRequestCooldown: (state, action) => {
            state.isOnRequestCooldown = action.payload;
        },
        setDidPeerDisconnect: (state, action) => {
            state.didPeerDisconnect = action.payload;
        },
        setPageWidth: (state, action) => {
            state.pageWidth = action.payload;
        },
    },
});

export default mainSlice;
