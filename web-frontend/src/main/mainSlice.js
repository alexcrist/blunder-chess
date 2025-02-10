import { createSlice } from "@reduxjs/toolkit";
import { generateRandomName } from "./generateRandomName";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        name: generateRandomName(),
        isGameActive: false,
        isConnectingToDualScreen: true, // TODO: revert to false
        connectedPeer: null,
    },
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
        },
        setIsGameActive: (state, action) => {
            state.isGameActive = action.payload;
        },
        setIsConnectingToDualScreen: (state, action) => {
            state.isConnectingToDualScreen = action.payload;
        },
        setConnectedPeer: (state, action) => {
            state.connectedPeer = action.payload;
        },
    },
});

export default mainSlice;
