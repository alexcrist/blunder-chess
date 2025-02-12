import { createSlice } from "@reduxjs/toolkit";
import { generateRandomName } from "./generateRandomName";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        name: generateRandomName(),
        view: window.location.pathname,
        isOnlineGame: false,
        connectedPeer: null,
        isPlayer1: false,
    },
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
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
    },
});

export default mainSlice;
