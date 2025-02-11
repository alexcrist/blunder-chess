import { createSlice } from "@reduxjs/toolkit";
import { generateRandomName } from "./generateRandomName";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        name: generateRandomName(),
        isGameActive: false,
        isConnectingToPeer: false,
        connectedPeer: null,
        isPlayer1: false,
    },
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
        },
        setIsGameActive: (state, action) => {
            state.isGameActive = action.payload;
        },
        setIsConnectingToPeer: (state, action) => {
            state.isConnectingToPeer = action.payload;
        },
        setConnectedPeer: (state, action) => {
            state.connectedPeer = action.payload;
        },
    },
});

export default mainSlice;
